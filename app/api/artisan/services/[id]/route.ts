import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiError, apiNotFound, apiServerError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

async function getArtisanService(userId: string, serviceId: string) {
  const artisan = await prisma.artisanProfile.findUnique({ where: { userId } });
  if (!artisan) return null;
  const service = await prisma.artisanService.findFirst({
    where: { id: serviceId, artisanId: artisan.id },
  });
  return service;
}

// PATCH — toggle isActive ou mettre à jour les prix
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;
  const { payload } = auth;
  const { id: serviceId } = await params;

  try {
    const body = await req.json() as { isActive?: boolean; basePrice?: number; emergencyFee?: number };
    const service = await getArtisanService(payload.userId, serviceId);
    if (!service) return apiNotFound("Service introuvable");

    const updated = await prisma.artisanService.update({
      where: { id: serviceId },
      data: {
        ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
        ...(body.basePrice !== undefined ? { basePrice: body.basePrice } : {}),
        ...(body.emergencyFee !== undefined ? { emergencyFee: body.emergencyFee } : {}),
      },
      include: { category: { select: { name: true, slug: true } } },
    });

    return apiSuccess(updated);
  } catch (err) {
    logger.error({ err }, "Update artisan service error");
    return apiServerError();
  }
}

// DELETE — supprimer un service
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;
  const { payload } = auth;
  const { id: serviceId } = await params;

  try {
    const service = await getArtisanService(payload.userId, serviceId);
    if (!service) return apiNotFound("Service introuvable");

    await prisma.artisanService.delete({ where: { id: serviceId } });
    return apiSuccess({ deleted: true });
  } catch (err) {
    logger.error({ err }, "Delete artisan service error");
    return apiServerError();
  }
}
