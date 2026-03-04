import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;

  const { payload } = auth;

  try {
    const body = await req.json();
    const { categoryId, basePrice, emergencyFee } = body as {
      categoryId: string;
      basePrice: number;
      emergencyFee: number;
    };

    if (!categoryId || basePrice == null) {
      return apiError("categoryId et basePrice sont requis");
    }

    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!artisan) return apiError("Profil artisan introuvable");

    const service = await prisma.artisanService.upsert({
      where: { artisanId_categoryId: { artisanId: artisan.id, categoryId } },
      create: {
        artisanId: artisan.id,
        categoryId,
        basePrice,
        emergencyFee: emergencyFee ?? 0,
        isActive: true,
      },
      update: {
        basePrice,
        emergencyFee: emergencyFee ?? 0,
        isActive: true,
      },
    });

    return apiSuccess(service);
  } catch (err) {
    logger.error({ err }, "Upsert artisan service error");
    return apiServerError();
  }
}
