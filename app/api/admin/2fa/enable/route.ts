/**
 * POST /api/admin/2fa/enable
 *
 * Vérifie le premier code TOTP et active la 2FA si valide.
 * Déplace totpPendingSecret → totpSecret et met totpEnabled = true.
 *
 * Body: { code: "123456" }
 * Requiert : ADMIN authentifié + totpPendingSecret défini (appeler /setup d'abord)
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
      select: { id: true, totpEnabled: true, totpPendingSecret: true },
    });

    if (!user)                   return apiError("Utilisateur introuvable", 404);
    if (user.totpEnabled)        return apiError("La 2FA est déjà activée", 400);
    if (!user.totpPendingSecret) return apiError("Lancez d'abord la configuration (/setup)", 400);

    // Déchiffrer et vérifier le code
    const secret = decryptTotpSecret(user.totpPendingSecret);
    if (!verifyTotpCode(code, secret)) {
      return apiError("Code invalide ou expiré. Réessayez.", 422);
    }

    // Activer la 2FA : déplacer pending → actif
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpEnabled:       true,
        totpSecret:        user.totpPendingSecret,
        totpPendingSecret: null,
      },
    });

    // Audit
    createAuditLog({
      adminId: auth.payload.userId,
      action:  "ADMIN_2FA_ENABLED",
      ip:      getClientIp(req),
    });

    return apiSuccess({ enabled: true });
  } catch (err) {
    adminLogger.error({ err }, "2FA enable error");
    return apiServerError();
  }
}
