import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiForbidden, apiServerError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const PLATFORM_FEE = 0.15;

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;
  if (auth.payload.role !== "ARTISAN") return apiForbidden();

  try {
    const profile = await prisma.artisanProfile.findUnique({
      where: { userId: auth.payload.userId },
      select: { id: true },
    });
    if (!profile) return apiForbidden();

    const assignments = await prisma.jobAssignment.findMany({
      where: {
        artisanId: profile.id,
        job: { status: "COMPLETED" },
      },
      include: {
        job: {
          select: {
            id: true,
            status: true,
            estimatedPrice: true,
            createdAt: true,
            category: { select: { name: true } },
            client: { select: { firstName: true, lastName: true } },
            payment: { select: { amount: true, platformFee: true, status: true } },
          },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    const completedJobs = assignments.map((a) => {
      const amount = a.finalPrice ?? a.job.estimatedPrice ?? 0;
      const platformFee = amount * PLATFORM_FEE;
      const net = amount - platformFee;
      return {
        jobId: a.job.id,
        category: a.job.category.name,
        client: `${a.job.client.firstName} ${a.job.client.lastName}`,
        completedAt: a.completedAt,
        amount,
        platformFee,
        net,
        paymentStatus: a.job.payment?.status ?? "PENDING",
      };
    });

    const totalGross = completedJobs.reduce((s, j) => s + j.amount, 0);
    const totalFees = completedJobs.reduce((s, j) => s + j.platformFee, 0);
    const totalNet = completedJobs.reduce((s, j) => s + j.net, 0);

    // Monthly breakdown
    const byMonth: Record<string, { gross: number; net: number; count: number }> = {};
    for (const job of completedJobs) {
      if (!job.completedAt) continue;
      const key = new Date(job.completedAt).toISOString().slice(0, 7); // YYYY-MM
      if (!byMonth[key]) byMonth[key] = { gross: 0, net: 0, count: 0 };
      byMonth[key].gross += job.amount;
      byMonth[key].net += job.net;
      byMonth[key].count++;
    }

    const monthlyBreakdown = Object.entries(byMonth)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6)
      .map(([month, data]) => ({ month, ...data }));

    return apiSuccess({
      summary: {
        totalGross,
        totalFees,
        totalNet,
        completedCount: completedJobs.length,
      },
      monthlyBreakdown,
      jobs: completedJobs.slice(0, 20),
    });
  } catch {
    return apiServerError();
  }
}
