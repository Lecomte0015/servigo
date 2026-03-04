import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { getClientIp } from "@/lib/rate-limit";
import { apiSuccess, apiError, apiNotFound, apiServerError } from "@/lib/api-response";
import { createNotification } from "@/services/notification";
import { sendArtisanApprovedEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/audit-log";
import { adminLogger } from "@/lib/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { id },
      include: { user: { select: { firstName: true, email: true } } },
    });

    if (!artisan) return apiNotFound("Artisan introuvable");
    if (artisan.isApproved) return apiError("Déjà approuvé");

    await prisma.artisanProfile.update({ where: { id }, data: { isApproved: true } });

    await createNotification({
      userId: artisan.userId,
      type: "PROFILE_APPROVED",
      message: "Votre profil a été validé ! Vous pouvez maintenant accepter des missions.",
    });

    sendArtisanApprovedEmail(artisan.user.email, artisan.user.firstName).catch((err) => adminLogger.error({ err }, "Email send failed"));

    createAuditLog({
      adminId: auth.payload.userId,
      action: "ARTISAN_APPROVED",
      targetId: id,
      targetType: "ArtisanProfile",
      details: { companyName: artisan.companyName, email: artisan.user.email },
      ip: getClientIp(req),
    });

    return apiSuccess({ approved: true });
  } catch (err) {
    adminLogger.error({ err }, "Approve artisan error");
    return apiServerError();
  }
}
