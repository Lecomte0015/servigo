import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { createReviewSchema } from "@/lib/validations";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { createNotification } from "@/services/notification";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ["CLIENT"]);
  if ("error" in auth) return auth.error;

  const { payload } = auth;

  try {
    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message);

    const { jobId, rating, comment } = parsed.data;

    const job = await prisma.jobRequest.findUnique({
      where: { id: jobId },
      include: {
        assignment: { include: { artisan: true } },
        review: true,
      },
    });

    if (!job) return apiError("Demande introuvable", 404);
    if (job.clientId !== payload.userId) return apiError("Accès refusé", 403);
    if (job.status !== "COMPLETED") return apiError("La demande n'est pas terminée");
    if (job.review) return apiError("Avis déjà soumis");
    if (!job.assignment) return apiError("Aucun artisan assigné");

    const artisanId = job.assignment.artisanId;

    const [review] = await prisma.$transaction([
      prisma.review.create({
        data: {
          jobId,
          clientId: payload.userId,
          artisanId,
          rating,
          comment,
        },
      }),
      // Recalculate artisan rating
      prisma.$executeRaw`
        UPDATE "ArtisanProfile"
        SET
          "ratingAverage" = (
            SELECT COALESCE(AVG(rating::float), 0) FROM "Review" WHERE "artisanId" = ${artisanId}
          ),
          "ratingCount" = (
            SELECT COUNT(*) FROM "Review" WHERE "artisanId" = ${artisanId}
          )
        WHERE id = ${artisanId}
      `,
    ]);

    await createNotification({
      userId: job.assignment.artisan.userId,
      type: "REVIEW_RECEIVED",
      message: `Vous avez reçu un avis ${rating}/5.`,
    });

    return apiSuccess(review, 201);
  } catch (err) {
    logger.error({ err }, "Create review error");
    return apiServerError();
  }
}
