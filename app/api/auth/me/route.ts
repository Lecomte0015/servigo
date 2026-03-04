import { getTokenFromCookies } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiUnauthorized, apiServerError } from "@/lib/api-response";
import { authLogger } from "@/lib/logger";

export async function GET() {
  try {
    const payload = await getTokenFromCookies();
    if (!payload) return apiUnauthorized();

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        isVerified: true,
        totpEnabled: true,
        artisanProfile: {
          select: {
            id: true,
            companyName: true,
            isApproved: true,
            emergencyAvailable: true,
            ratingAverage: true,
            ratingCount: true,
            city: true,
          },
        },
      },
    });

    if (!user) return apiUnauthorized();

    return apiSuccess(user);
  } catch (err) {
    authLogger.error({ err }, "Get current user error");
    return apiServerError();
  }
}
