import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiNotFound, apiServerError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const PLATFORM_FEE = 0.10;

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;

  try {
    const profile = await prisma.artisanProfile.findUnique({
      where: { userId: auth.payload.userId },
    });
    if (!profile) return apiNotFound("Profil artisan introuvable");

    // All assignments with their payments
    const assignments = await prisma.jobAssignment.findMany({
      where: { artisanId: profile.id },
      include: {
        job: {
          include: {
            category: { select: { name: true, icon: true } },
            client: { select: { firstName: true, lastName: true } },
            payment: true,
          },
        },
      },
      orderBy: { acceptedAt: "desc" },
    });

    let availableBalance = 0;   // RELEASED payments → artisan can withdraw
    let pendingBalance = 0;     // AUTHORIZED/CAPTURED → waiting for release
    let totalEarned = 0;        // All-time net earnings

    const transactions = assignments.map((a) => {
      const payment = a.job.payment;
      const gross = payment?.amount ?? 0;
      const fee = gross * PLATFORM_FEE;
      const net = gross - fee;

      if (payment) {
        if (payment.status === "RELEASED") {
          availableBalance += net;
          totalEarned += net;
        } else if (payment.status === "CAPTURED" || payment.status === "AUTHORIZED") {
          pendingBalance += net;
          totalEarned += net;
        }
      }

      return {
        jobId: a.job.id,
        category: a.job.category.name,
        categoryIcon: a.job.category.icon,
        client: `${a.job.client.firstName} ${a.job.client.lastName}`,
        jobStatus: a.job.status,
        paymentStatus: payment?.status ?? null,
        gross,
        fee: parseFloat(fee.toFixed(2)),
        net: parseFloat(net.toFixed(2)),
        acceptedAt: a.acceptedAt,
        completedAt: a.completedAt,
      };
    });

    return apiSuccess({
      availableBalance: parseFloat(availableBalance.toFixed(2)),
      pendingBalance: parseFloat(pendingBalance.toFixed(2)),
      totalEarned: parseFloat(totalEarned.toFixed(2)),
      completedCount: assignments.filter((a) => a.completedAt).length,
      transactions,
    });
  } catch (err) {
    logger.error({ err }, "Get wallet error");
    return apiServerError();
  }
}
