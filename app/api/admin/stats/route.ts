import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiServerError } from "@/lib/api-response";
import { adminLogger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const [
      totalUsers,
      totalArtisans,
      pendingArtisans,
      totalJobs,
      completedJobs,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.artisanProfile.count({ where: { isApproved: true } }),
      prisma.artisanProfile.count({ where: { isApproved: false } }),
      prisma.jobRequest.count(),
      prisma.jobRequest.count({ where: { status: "COMPLETED" } }),
      prisma.payment.aggregate({
        where: { status: "RELEASED" },
        _sum: { amount: true, platformFee: true },
      }),
    ]);

    return apiSuccess({
      totalUsers,
      totalArtisans,
      pendingArtisans,
      totalJobs,
      completedJobs,
      totalRevenue: totalRevenue._sum.amount ?? 0,
      platformRevenue: totalRevenue._sum.platformFee ?? 0,
    });
  } catch (err) {
    adminLogger.error({ err }, "Get stats error");
    return apiServerError();
  }
}
