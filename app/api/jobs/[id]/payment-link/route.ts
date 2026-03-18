import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiError, apiNotFound, apiServerError } from "@/lib/api-response";
import { createCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { jobLogger } from "@/lib/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["CLIENT"]);
  if ("error" in auth) return auth.error;

  const { payload } = auth;
  const { id: jobId } = await params;

  if (!isStripeConfigured()) {
    return apiError("Paiement en ligne non disponible — contactez GoServi", 503);
  }

  try {
    const job = await prisma.jobRequest.findUnique({
      where: { id: jobId },
      include: { payment: true },
    });

    if (!job) return apiNotFound();
    if (job.clientId !== payload.userId) return apiError("Accès refusé", 403);
    if (!["MATCHING", "ASSIGNED"].includes(job.status)) {
      return apiError("Paiement non disponible pour ce statut");
    }
    if (!job.payment) return apiError("Paiement introuvable");
    if (job.payment.status === "CAPTURED") {
      return apiError("Paiement déjà effectué");
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await createCheckoutSession(
      job.payment.amount,
      jobId,
      `${appUrl}/dashboard/history?payment=success&job=${jobId}`,
      `${appUrl}/dashboard/history?payment=cancelled&job=${jobId}`
    );

    return apiSuccess({ url: session.url });
  } catch (err) {
    jobLogger.error({ err }, "Create payment link error");
    return apiServerError();
  }
}
