import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiNotFound, apiServerError } from "@/lib/api-response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: artisanId } = await params;

  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { id: artisanId },
      select: { id: true },
    });

    if (!artisan) return apiNotFound();

    const reviews = await prisma.review.findMany({
      where: { artisanId },
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
