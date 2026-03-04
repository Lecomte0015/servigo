/**
 * POST /api/admin/2fa/disable
 *
 * Désactive la 2FA après vérification du code actuel.
 * Efface totpSecret + totpPendingSecret.
 *
 * Body: { code: "123456" }
 * Requiert : ADMIN authentifié + totpEnabled = true
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { verifyTotpCode, decryptTotpSecret } from "@/lib/totp";
import { createAuditLog } from "@/lib/audit-log";
import { getClientIp } from "@/lib/rate-limit";
import { adminLogger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const { code } = await req.json() as { code?: string };

    if (!code || !/^\d{6}$/.test(code.replace(/\s/g, ""))) {
      return apiError("Le code doit contenir 6 chiffres", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.payload.userId },
      select: { id: true, totpEnabled: true, totpSecret: true },
    });

    if (!user)           return apiError("Utilisateur introuvable", 404);
    if (!user.totpEnabled) return apiError("La 2FA n'est pas activée", 400);
    if (!user.totpSecret)  return apiError("Secret 2FA introuvable", 500);

    // Vérifier le code avant de désactiver
    const secret = decryptTotpSecret(user.totpSecret);
    if (!verifyTotpCode(code, secret)) {
      return apiError("Code invalide ou expiré.", 422);
    }

    // Désactiver
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpEnabled:       false,
        totpSecret:        null,
        totpPendingSecret: null,
      },
    });

    // Audit
    createAuditLog({
      adminId: auth.payload.userId,
      action:  "ADMIN_2FA_DISABLED",
      ip:      getClientIp(req),
    });

    return apiSuccess({ disabled: true });
  } catch (err) {
    adminLogger.error({ err }, "2FA disable error");
    return apiServerError();
  }
}
