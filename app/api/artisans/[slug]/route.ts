import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiNotFound, apiServerError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

/** GET /api/artisans/[slug] — Public artisan profile (no auth required) */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: { firstName: true, lastName: true, createdAt: true },
        },
        services: {
          where: { isActive: true },
          include: {
            category: { select: { name: true, icon: true, slug: true } },
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            client: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!artisan || !artisan.isApproved) {
      return apiNotFound("Profil artisan introuvable");
    }

    // Count completed jobs
    const completedJobs = await prisma.jobAssignment.count({
      where: {
        artisanId: artisan.id,
        job: { status: "COMPLETED" },
      },
    });

    return apiSuccess({
      id: artisan.id,
      slug: artisan.slug,
      companyName: artisan.companyName,
      city: artisan.city,
      description: artisan.description,
      photoUrl: artisan.photoUrl,
      ratingAverage: artisan.ratingAverage,
      ratingCount: artisan.ratingCount,
      emergencyAvailable: artisan.emergencyAvailable,
      insuranceVerified: artisan.insuranceVerified,
      completedJobs,
      memberSince: artisan.user.createdAt,
      services: artisan.services.map((s) => ({
        categoryName: s.category.name,
        categoryIcon: s.category.icon,
        categorySlug: s.category.slug,
        basePrice: s.basePrice,
        emergencyFee: s.emergencyFee,
      })),
      reviews: artisan.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        clientFirstName: r.client.firstName,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    logger.error({ err }, "Get public artisan error");
    return apiServerError();
  }
}
