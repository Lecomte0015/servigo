import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiNotFound, apiServerError } from "@/lib/api-response";

/**
 * GET /api/artisans/[slug]/reviews
 *
 * Accepts either the artisan profile UUID or its slug as the URL segment.
 * The client passes artisan.id (UUID) which is used to look up the profile.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: artisanId } = await params;

  try {
    // Look up by UUID first, fall back to slug
    const artisan = await prisma.artisanProfile.findFirst({
      where: {
        OR: [{ id: artisanId }, { slug: artisanId }],
      },
      select: { id: true },
    });

    if (!artisan) return apiNotFound();

    const reviews = await prisma.review.findMany({
      where: { artisanId: artisan.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        client: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    const formatted = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      clientFirstName: r.client.firstName,
      clientLastName: r.client.lastName[0] + ".",
    }));

    return apiSuccess({ reviews: formatted });
  } catch {
    return apiServerError();
  }
}
