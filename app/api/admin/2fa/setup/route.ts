/**
 * POST /api/admin/2fa/setup
 *
 * Génère un nouveau secret TOTP et le stocke temporairement (totpPendingSecret).
 * L'admin doit ensuite scanner le QR code et appeler /enable pour confirmer.
 *
 * Requiert : ADMIN authentifié
 * Retourne : { uri: "otpauth://..." }  (à convertir en QR code côté client)
 */

import { NextRequest } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import {
  generateTotpSecret,
  getTotpUri,
  encryptTotpSecret,
} from "@/lib/totp";
import { adminLogger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.payload.userId },
      select: { id: true, email: true, totpEnabled: true },
    });

    if (!user) return apiError("Utilisateur introuvable", 404);

    if (user.totpEnabled) {
      return apiError(
        "La double authentification est déjà active. Désactivez-la d'abord.",
        400
      );
    }

    // Générer un nouveau secret + l'URI pour le QR code
    const secret = generateTotpSecret();
    const uri    = getTotpUri(secret, user.email);

    // Stocker le secret en attente (chiffré) — pas encore activé
    await prisma.user.update({
      where: { id: user.id },
      data:  { totpPendingSecret: encryptTotpSecret(secret) },
    });

    // Générer le QR code en base64 pour affichage direct dans le navigateur
    const qrDataUrl = await QRCode.toDataURL(uri, { width: 200, margin: 2 });

    return apiSuccess({ uri, qrDataUrl });
  } catch (err) {
    adminLogger.error({ err }, "2FA setup error");
    return apiServerError();
  }
}
