import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiNotFound, apiServerError } from "@/lib/api-response";
import { adminLogger } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
        services: {
          include: {
            category: { select: { name: true, icon: true } },
          },
          orderBy: { category: { name: "asc" } },
        },
        assignments: {
          include: {
            job: {
              select: {
                id: true,
                status: true,
                description: true,
                city: true,
                createdAt: true,
                category: { select: { name: true } },
              },
            },
          },
          orderBy: { acceptedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!artisan) return apiNotFound("Artisan introuvable");

    return apiSuccess(artisan);
  } catch (err) {
    adminLogger.error({ err }, "Get artisan detail error");
    return apiServerError();
  }
}
