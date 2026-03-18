import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiError, apiNotFound, apiServerError } from "@/lib/api-response";
import { createNotification } from "@/services/notification";
import { jobLogger } from "@/lib/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;

  const { payload } = auth;
  const { id: jobId } = await params;

  try {
    const job = await prisma.jobRequest.findUnique({
      where: { id: jobId },
      include: {
        assignment: { include: { artisan: true } },
        payment: { select: { status: true } },
      },
    });

    if (!job) return apiNotFound();
    if (job.status !== "ASSIGNED") return apiError("Statut invalide");
    if (job.assignment?.artisan.userId !== payload.userId) {
      return apiError("Accès refusé", 403);
    }

    // Bloquer le démarrage si le client n'a pas encore payé
    if (job.payment?.status !== "CAPTURED") {
      return apiError("Le client doit régler la mission avant que vous puissiez démarrer", 402);
    }

    await prisma.$transaction([
      prisma.jobRequest.update({ where: { id: jobId }, data: { status: "IN_PROGRESS" } }),
      prisma.jobAssignment.update({
        where: { jobId },
        data: { startedAt: new Date() },
      }),
    ]);

    await createNotification({
      userId: job.clientId,
      type: "JOB_STARTED",
      message: "🚗 L'artisan est en route vers votre adresse. Préparez-vous à l'accueillir !",
      link: "/dashboard/history",
    });

    return apiSuccess({ status: "IN_PROGRESS" });
  } catch (err) {
    jobLogger.error({ err }, "Start job error");
    return apiServerError();
  }
}
