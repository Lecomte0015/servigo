import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";
import { authLogger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  // Rate limit: 3 resends per IP per hour
  const ip = getClientIp(req);
  const rl = await rateLimit(`resend-verification:${ip}`, 3, 60 * 60 * 1000);
  if (!rl.success) {
    return apiError("Trop de tentatives. Réessayez dans 1 heure.", 429);
  }

  try {
    const { email } = await req.json();
    if (!email) return apiError("Email requis", 400);

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to avoid user enumeration
    if (!user || user.isVerified) {
      return apiSuccess({ sent: true });
    }

    const token = randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: token, verificationTokenExpiry: expiry },
    });

    sendVerificationEmail(user.email, user.firstName, token).catch((err) => authLogger.error({ err }, "Email send failed"));

    return apiSuccess({ sent: true });
  } catch (err) {
    authLogger.error({ err }, "Resend verification error");
    return apiServerError();
  }
}
