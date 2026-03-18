import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { createJobSchema } from "@/lib/validations";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { matchArtisans, notifyTargetArtisan } from "@/services/matching";
import { PLATFORM_FEE_PERCENT } from "@/lib/stripe";
import { createNotification } from "@/services/notification";
import { jobLogger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const { payload } = auth;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const skip = (page - 1) * limit;
  const statusFilter = searchParams.get("status") ?? undefined;

  try {
    let where: Record<string, unknown> = {};

    if (payload.role === "CLIENT") {
      where = { clientId: payload.userId, ...(statusFilter ? { status: statusFilter } : {}) };
    } else if (payload.role === "ARTISAN") {
      // Fetch artisan profile to know their city and active categories
      const artisanProfile = await prisma.artisanProfile.findUnique({
        where: { userId: payload.userId },
        select: {
          id: true,
          city: true,
          isApproved: true,
          services: { where: { isActive: true }, select: { categoryId: true } },
        },
      });

      const categoryIds = artisanProfile?.services.map((s) => s.categoryId) ?? [];

      // An artisan sees:
      // 1. Jobs they are (or were) assigned to
      // 2. MATCHING jobs directly targeted at them (demande directe via carte)
      // 3. MATCHING jobs in their city for their categories, with no specific target (matching standard)
      const matchingConditions: unknown[] = [
        { assignment: { artisan: { userId: payload.userId } } },
      ];

      if (artisanProfile?.isApproved) {
        matchingConditions.push({
          status: "MATCHING",
          targetArtisanId: artisanProfile.id,
        });

        if (artisanProfile.city && categoryIds.length > 0) {
          matchingConditions.push({
            status: "MATCHING",
            city: artisanProfile.city,
            categoryId: { in: categoryIds },
            targetArtisanId: null, // Exclude direct requests meant for another artisan
          });
        }
      }

      where = {
        OR: matchingConditions,
        ...(statusFilter ? { status: statusFilter } : {}),
      };
    }

    const [jobs, total] = await Promise.all([
      prisma.jobRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          client: { select: { firstName: true, lastName: true, phone: true } },
          assignment: {
            include: {
              artisan: {
                select: {
                  companyName: true,
                  ratingAverage: true,
                  photoUrl: true,
                  user: { select: { firstName: true, lastName: true, phone: true } },
                },
              },
            },
          },
          payment: { select: { status: true, amount: true } },
          review: { select: { rating: true, comment: true } },
          _count: {
            select: {
              messages: {
                where: { readAt: null, senderId: { not: payload.userId } },
              },
            },
          },
        },
      }),
      prisma.jobRequest.count({ where }),
    ]);

    return apiSuccess({ jobs, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    jobLogger.error({ err }, "List jobs error");
    return apiServerError();
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ["CLIENT"]);
  if ("error" in auth) return auth.error;

  const { payload } = auth;

  try {
    const body = await req.json();
    const parsed = createJobSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    const { categoryId, description, address, city, urgencyLevel, scheduledAt, targetArtisanId } = parsed.data;

    // Estimate price from local artisans
    const artisanServices = await prisma.artisanService.findMany({
      where: {
        categoryId,
        isActive: true,
        artisan: { city, isApproved: true },
      },
      select: { basePrice: true, emergencyFee: true },
    });

    const estimatedPrice =
      artisanServices.length > 0
        ? artisanServices.reduce((sum, s) => {
            const price = urgencyLevel === "URGENT"
              ? s.basePrice + s.emergencyFee
              : s.basePrice;
            return sum + price;
          }, 0) / artisanServices.length
        : 150; // fallback CHF

    const platformFee = estimatedPrice * PLATFORM_FEE_PERCENT;

    // Create job + payment atomically (paiement collecté via Stripe Checkout à l'assignation)
    const job = await prisma.$transaction(async (tx) => {
      const newJob = await tx.jobRequest.create({
        data: {
          clientId: payload.userId,
          categoryId,
          description,
          address,
          city,
          urgencyLevel,
          status: "MATCHING",
          estimatedPrice,
          ...(scheduledAt ? { scheduledAt: new Date(scheduledAt) } : {}),
          ...(targetArtisanId ? { targetArtisanId } : {}),
        },
      });

      await tx.payment.create({
        data: {
          jobId: newJob.id,
          stripePaymentIntentId: null,
          amount: estimatedPrice,
          platformFee,
          status: "PENDING",
        },
      });

      return newJob;
    });

    // Notify artisan(s) — async, don't block response
    if (targetArtisanId) {
      // Demande directe depuis la carte interactive
      notifyTargetArtisan(job.id, targetArtisanId, city).catch((err) => jobLogger.error({ err }, "notifyTargetArtisan failed"));
    } else {
      // Matching automatique (top 5 par ville/catégorie)
      matchArtisans(job.id, categoryId, city).catch((err) => jobLogger.error({ err }, "matchArtisans failed"));
    }

    return apiSuccess({ jobId: job.id, estimatedPrice }, 201);
  } catch (err) {
    jobLogger.error({ err }, "Create job error");
    return apiServerError();
  }
}
