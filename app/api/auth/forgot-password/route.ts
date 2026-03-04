import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiServerError } from "@/lib/api-response";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";
import { authLogger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  // ── Rate limiting: 3 req / heure par IP ─────────────────────────────────
  const ip = getClientIp(req);
  const rl = await rateLimit(`forgot:${ip}`, 3, 60 * 60 * 1000);
  if (!rl.success) {
    return apiSuccess({ sent: true }); // Silencieux — ne pas leaker
  }

  try {
    const body = await req.json();
    const { email } = body as { email: string };
    if (!email) return apiSuccess({ sent: true });

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 heure

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiry: expiry },
      });

      // Envoyer l'email de reset (non-bloquant)
      sendPasswordResetEmail(user.email, user.firstName, token).catch((err) => authLogger.error({ err }, "Email send failed"));
    }

    return apiSuccess({ sent: true });
  } catch (err) {
    authLogger.error({ err }, "Forgot password error");
    return apiServerError();
  }
}
