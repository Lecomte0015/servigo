import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiServerError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ["CLIENT"]);
  if ("error" in auth) return auth.error;

  try {
    const jobs = await prisma.jobRequest.findMany({
      where: {
        clientId: auth.payload.userId,
        payment: { isNot: null },
      },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true, icon: true } },
        payment: true,
        assignment: {
          include: {
            artisan: {
              select: {
                companyName: true,
                photoUrl: true,
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });

    const totalPaid = jobs
      .filter((j) => j.payment?.status === "CAPTURED" || j.payment?.status === "RELEASED")
      .reduce((sum, j) => sum + (j.payment?.amount ?? 0), 0);

    const pendingCount = jobs.filter(
      (j) => j.payment?.status === "AUTHORIZED" || j.payment?.status === "PENDING"
    ).length;

    return apiSuccess({
      payments: jobs.map((j) => ({
        jobId: j.id,
        jobStatus: j.status,
        category: j.category.name,
        categoryIcon: j.category.icon,
        city: j.city,
        createdAt: j.createdAt,
        payment: j.payment,
        artisan: j.assignment?.artisan ?? null,
      })),
      summary: {
        totalPaid: parseFloat(totalPaid.toFixed(2)),
        pendingCount,
        totalCount: jobs.length,
      },
    });
  } catch (err) {
    logger.error({ err }, "List client payments error");
    return apiServerError();
  }
}
