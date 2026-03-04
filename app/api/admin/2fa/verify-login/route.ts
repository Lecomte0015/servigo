/**
 * POST /api/admin/2fa/verify-login
 *
 * Deuxième étape du login admin quand 2FA est activé.
 * Vérifie le code TOTP et pose le cookie d'authentification si valide.
 *
 * Body: { pendingToken: "...", code: "123456" }
 *
 * Le pendingToken est un JWT court (5 min) émis par /api/auth/login
 * avec purpose="2fa_pending". Il ne donne aucun accès au back-office.
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAuthCookie } from "@/lib/jwt";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { verifyPending2FAToken } from "@/lib/totp";
import { verifyTotpCode, decryptTotpSecret } from "@/lib/totp";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { adminLogger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  // Rate limit : 5 tentatives / 15 min par IP (brute-force protection)
  const ip = getClientIp(req);
  const rl = await rateLimit(`2fa-login:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.success) {
    return apiError("Trop de tentatives. Réessayez dans 15 minutes.", 429);
  }

  try {
    const { pendingToken, code } =
      await req.json() as { pendingToken?: string; code?: string };

    if (!pendingToken) return apiError("Token manquant", 400);
    if (!code || !/^\d{6}$/.test(code.replace(/\s/g, ""))) {
      return apiError("Code à 6 chiffres requis", 400);
    }

    // Vérifier le pending token
    const payload = verifyPending2FAToken(pendingToken);
    if (!payload) {
      return apiError("Session expirée. Reconnectez-vous.", 401);
    }

    // Charger l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { artisanProfile: true },
    });

    if (!user || user.role !== "ADMIN") {
      return apiError("Accès refusé", 403);
    }

    if (!user.totpEnabled || !user.totpSecret) {
      return apiError("2FA non configurée sur ce compte", 400);
    }

    // Vérifier le code TOTP
    const secret = decryptTotpSecret(user.totpSecret);
    if (!verifyTotpCode(code, secret)) {
      return apiError("Code invalide ou expiré. Réessayez.", 422);
    }

    // Code valide → poser le vrai cookie d'authentification
    await setAuthCookie({
      userId: user.id,
      role:   user.role,
      email:  user.email,
    });

    return apiSuccess({
      id:         user.id,
      email:      user.email,
      role:       user.role,
      firstName:  user.firstName,
      lastName:   user.lastName,
      isApproved: user.artisanProfile?.isApproved ?? null,
    });
  } catch (err) {
    adminLogger.error({ err }, "2FA verify login error");
    return apiServerError();
  }
}
