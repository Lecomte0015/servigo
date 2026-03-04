import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiError, apiNotFound, apiServerError } from "@/lib/api-response";
import { capturePaymentIntent } from "@/lib/stripe";
import { createNotification } from "@/services/notification";
import { jobLogger } from "@/lib/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Client confirms completion
  const auth = requireAuth(req, ["CLIENT"]);
  if ("error" in auth) return auth.error;

  const { payload } = auth;
  const { id: jobId } = await params;

  try {
    const job = await prisma.jobRequest.findUnique({
      where: { id: jobId },
      include: {
        assignment: { include: { artisan: true } },
        payment: true,
      },
    });

    if (!job) return apiNotFound();
    if (job.clientId !== payload.userId) return apiError("Accès refusé", 403);
    if (job.status !== "IN_PROGRESS") return apiError("Statut invalide");
    if (!job.payment) return apiError("Paiement introuvable");

    // Capture Stripe payment
    await capturePaymentIntent(job.payment.stripePaymentIntentId);

    const now = new Date();

    await prisma.$transaction([
      prisma.jobRequest.update({ where: { id: jobId }, data: { status: "COMPLETED" } }),
      prisma.jobAssignment.update({
        where: { jobId },
        data: { completedAt: now },
      }),
      prisma.payment.update({
        where: { jobId },
        data: { status: "RELEASED" },
      }),
    ]);

    // Notify artisan
    if (job.assignment) {
      await createNotification({
        userId: job.assignment.artisan.userId,
        type: "PAYMENT_CAPTURED",
        message: "Intervention complétée. Le paiement vous sera versé sous 2-3 jours.",
      });
    }

    return apiSuccess({ status: "COMPLETED" });
  } catch (err) {
    jobLogger.error({ err }, "Complete job error");
    return apiServerError();
  }
}
