import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { authLogger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body as { token: string; password: string };

    if (!token || !password) {
      return apiError("Token et mot de passe requis");
    }

    if (password.length < 8) {
      return apiError("Le mot de passe doit contenir au moins 8 caractères");
    }

    const user = await prisma.user.findUnique({ where: { resetToken: token } });

    if (!user || !user.resetTokenExpiry) {
      return apiError("Lien invalide ou expiré");
    }

    if (user.resetTokenExpiry < new Date()) {
      return apiError("Lien expiré. Veuillez faire une nouvelle demande.");
    }

    const hashed = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return apiSuccess({ reset: true });
  } catch (err) {
    authLogger.error({ err }, "Reset password error");
    return apiServerError();
  }
}
