import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiError, apiNotFound, apiServerError } from "@/lib/api-response";
import { createNotification } from "@/services/notification";
import { sendJobCancelledClientEmail, sendJobCancelledArtisanEmail } from "@/lib/email";
import { jobLogger } from "@/lib/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["CLIENT"]);
  if ("error" in auth) return auth.error;

  const { payload } = auth;
  const { id } = await params;

  try {
    const job = await prisma.jobRequest.findUnique({
      where: { id },
      include: {
        payment: true,
        assignment: { include: { artisan: { include: { user: { select: { email: true, firstName: true } } } } } },
        client: { select: { email: true, firstName: true } },
        category: { select: { name: true } },
      },
    });

    if (!job) return apiNotFound("Mission introuvable");
    if (job.clientId !== payload.userId) return apiError("Non autorisé", 403);

    const cancellableStatuses = ["PENDING", "MATCHING", "ASSIGNED"];
    if (!cancellableStatuses.includes(job.status)) {
      return apiError("Cette mission ne peut plus être annulée");
    }

    // Cancel Stripe PaymentIntent if exists
    if (job.payment?.stripePaymentIntentId && job.payment.status === "AUTHORIZED") {
      try {
        const { stripe } = await import("@/lib/stripe");
        await stripe.paymentIntents.cancel(job.payment.stripePaymentIntentId);
        await prisma.payment.update({
          where: { jobId: job.id },
          data: { status: "RELEASED" },
        });
      } catch (stripeErr) {
        jobLogger.error({ stripeErr }, "Stripe cancel error");
      }
    }

    await prisma.jobRequest.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    // Email de confirmation au client (non-bloquant)
    if (job.client?.email) {
      sendJobCancelledClientEmail(
        job.client.email,
        job.client.firstName,
        job.category?.name ?? "Service",
        job.city
      ).catch(() => {});
    }

    // Notify artisan + email si une mission était assignée
    if (job.assignment) {
      await createNotification({
        userId: job.assignment.artisan.userId,
        type: "JOB_CANCELLED",
        message: "Une mission qui vous était assignée a été annulée par le client.",
        link: "/pro/jobs",
      });
      if (job.assignment.artisan.user?.email) {
        sendJobCancelledArtisanEmail(
          job.assignment.artisan.user.email,
          job.assignment.artisan.user.firstName,
          job.category?.name ?? "Service",
          job.city
        ).catch(() => {});
      }
    }

    return apiSuccess({ cancelled: true });
  } catch (err) {
    jobLogger.error({ err }, "Cancel job error");
    return apiServerError();
  }
}
