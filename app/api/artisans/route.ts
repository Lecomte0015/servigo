import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiServerError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

/**
 * GET /api/artisans
 * Liste publique des artisans approuvés avec coordonnées GPS pour la carte interactive.
 * Paramètres: ?categoryId=... &city=...
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const city = searchParams.get("city") ?? undefined;

  try {
    const artisans = await prisma.artisanProfile.findMany({
      where: {
        isApproved: true,
        latitude: { not: null },
        longitude: { not: null },
        ...(city
          ? { city: { contains: city, mode: "insensitive" } }
          : {}),
        ...(categoryId
          ? { services: { some: { categoryId, isActive: true } } }
          : {}),
      },
      select: {
        id: true,
        companyName: true,
        city: true,
        description: true,
        ratingAverage: true,
        ratingCount: true,
        photoUrl: true,
        slug: true,
        latitude: true,
        longitude: true,
        emergencyAvailable: true,
        user: { select: { firstName: true, lastName: true } },
        services: {
          where: { isActive: true },
          select: {
            basePrice: true,
            emergencyFee: true,
            category: {
              select: { id: true, name: true, slug: true, icon: true },
            },
          },
        },
      },
      orderBy: { ratingAverage: "desc" },
    });

    return apiSuccess({ artisans });
  } catch (err) {
    logger.error({ err }, "List artisans error");
    return apiServerError();
  }
}
