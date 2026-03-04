import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAuthCookie } from "@/lib/jwt";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { authLogger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return apiError("Token manquant", 400);
    }

    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
      include: { artisanProfile: true },
    });

    if (!user) {
      return apiError("Lien invalide ou déjà utilisé", 400);
    }

    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      return apiError("Ce lien a expiré. Veuillez en demander un nouveau.", 400);
    }

    // Mark as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    // Log the user in
    await setAuthCookie({ userId: user.id, role: user.role, email: user.email });

    return apiSuccess({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      isApproved: user.artisanProfile?.isApproved ?? null,
    });
  } catch (err) {
    authLogger.error({ err }, "Verify email error");
    return apiServerError();
  }
}
