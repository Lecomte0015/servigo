/**
 * PATCH /api/admin/artisans/[id]/verify-insurance
 * Admin only — marquer l'attestation d'assurance comme vérifiée ou révoquée.
 *
 * Body : { verified: boolean }
 * Retourne : { insuranceVerified: boolean }
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { createAuditLog } from "@/lib/audit-log";
import { createNotification } from "@/services/notification";
import { apiSuccess, apiError, apiNotFound, apiServerError } from "@/lib/api-response";
import { sendInsuranceVerifiedEmail, sendInsuranceUnverifiedEmail } from "@/lib/email";
import { adminLogger } from "@/lib/logger";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  let verified: boolean;
  let reason: string | undefined;
  try {
    const body = await req.json();
    if (typeof body.verified !== "boolean") {
      return apiError("Le champ 'verified' (boolean) est requis.");
    }
    verified = body.verified;
    reason = typeof body.reason === "string" && body.reason.trim() ? body.reason.trim() : undefined;
  } catch {
    return apiError("Corps de requête invalide.");
  }

  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { id },
      select: { id: true, insuranceCertUrl: true, userId: true, user: { select: { email: true, firstName: true } } },
    });

    if (!artisan) return apiNotFound("Artisan introuvable");

    if (verified && !artisan.insuranceCertUrl) {
      return apiError("Impossible de vérifier : aucun document d'assurance fourni par l'artisan.");
    }

    await prisma.artisanProfile.update({
      where: { id },
      data: { insuranceVerified: verified },
    });

    // Notification à l'artisan (non-bloquante)
    createNotification({
      userId: artisan.userId,
      type: verified ? "INSURANCE_VERIFIED" : "INSURANCE_UNVERIFIED",
      message: verified
        ? "✅ Votre attestation d'assurance RC Pro a été vérifiée par GoServi. Votre profil est complet."
        : reason
          ? `❌ Votre attestation d'assurance a été refusée. Motif : ${reason}. Veuillez uploader un nouveau document.`
          : "⚠️ La vérification de votre attestation d'assurance a été révoquée. Veuillez uploader un nouveau document.",
      link: "/pro/profile",
    }).catch(() => {});

    // Email à l'artisan (non-bloquant)
    if (verified) {
      sendInsuranceVerifiedEmail(artisan.user.email, artisan.user.firstName).catch(() => {});
    } else {
      sendInsuranceUnverifiedEmail(artisan.user.email, artisan.user.firstName, reason).catch(() => {});
    }

    // Audit log non-bloquant
    createAuditLog({
      action: verified ? "INSURANCE_VERIFIED" : "INSURANCE_UNVERIFIED",
      adminId: auth.payload.userId,
      targetId: id,
      targetType: "artisan",
    }).catch(() => {});

    return apiSuccess({ insuranceVerified: verified });
  } catch (err) {
    adminLogger.error({ err }, "Verify insurance error");
    return apiServerError();
  }
}
