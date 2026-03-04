import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { getClientIp } from "@/lib/rate-limit";
import { apiSuccess, apiError, apiNotFound, apiServerError } from "@/lib/api-response";
import { createNotification } from "@/services/notification";
import { sendArtisanRejectedEmail } from "@/lib/email";
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
    const body = await req.json().catch(() => ({}));
    const reason = (body as { reason?: string }).reason ?? "Dossier incomplet";

    const artisan = await prisma.artisanProfile.findUnique({
      where: { id },
      include: { user: { select: { firstName: true, email: true } } },
    });

    if (!artisan) return apiNotFound("Artisan introuvable");
    if (artisan.isApproved) return apiError("L'artisan est déjà approuvé");

    await createNotification({
      userId: artisan.userId,
      type: "PROFILE_REJECTED",
      message: `Votre demande d'inscription a été refusée. Motif : ${reason}. Contactez le support.`,
    });

    sendArtisanRejectedEmail(artisan.user.email, artisan.user.firstName, reason).catch((err) => adminLogger.error({ err }, "Email send failed"));

    createAuditLog({
      adminId: auth.payload.userId,
      action: "ARTISAN_REJECTED",
      targetId: id,
      targetType: "ArtisanProfile",
      details: { companyName: artisan.companyName, email: artisan.user.email, reason },
      ip: getClientIp(req),
    });

    return apiSuccess({ rejected: true });
  } catch (err) {
    adminLogger.error({ err }, "Reject artisan error");
    return apiServerError();
  }
}
