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
import { apiSuccess, apiError, apiNotFound, apiServerError } from "@/lib/api-response";
import { adminLogger } from "@/lib/logger";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  let verified: boolean;
  try {
    const body = await req.json();
    if (typeof body.verified !== "boolean") {
      return apiError("Le champ 'verified' (boolean) est requis.");
    }
    verified = body.verified;
  } catch {
    return apiError("Corps de requête invalide.");
  }

  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { id },
      select: { id: true, insuranceCertUrl: true },
    });

    if (!artisan) return apiNotFound("Artisan introuvable");

    if (verified && !artisan.insuranceCertUrl) {
      return apiError("Impossible de vérifier : aucun document d'assurance fourni par l'artisan.");
    }

    await prisma.artisanProfile.update({
      where: { id },
      data: { insuranceVerified: verified },
    });

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
