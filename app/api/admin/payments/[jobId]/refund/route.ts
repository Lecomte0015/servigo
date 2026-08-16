import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { refundPayment } from "@/lib/stripe";
import { apiSuccess, apiError, apiNotFound, apiServerError } from "@/lib/api-response";
import { createNotification } from "@/services/notification";
import { createAuditLog } from "@/lib/audit-log";
import { getClientIp } from "@/lib/rate-limit";
import { adminLogger } from "@/lib/logger";

/** POST /api/admin/payments/[jobId]/refund — Remboursement Stripe depuis le back-office */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { jobId } = await params;

  try {
    const payment = await prisma.payment.findUnique({
      where: { jobId },
      include: {
        job: {
          select: {
            status: true,
            clientId: true,
            city: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    if (!payment) return apiNotFound("Paiement introuvable");

    if (!["CAPTURED", "RELEASED"].includes(payment.status)) {
      return apiError(`Remboursement impossible — statut actuel : ${payment.status}`);
    }

    if (!payment.stripePaymentIntentId) {
      return apiError("Aucun Payment Intent Stripe associé — remboursement manuel requis");
    }

    await refundPayment(payment.stripePaymentIntentId);

    await prisma.$transaction([
      prisma.payment.update({
        where: { jobId },
        data: { status: "REFUNDED" },
      }),
      prisma.jobRequest.updateMany({
        where: { id: jobId, status: { notIn: ["COMPLETED", "CANCELLED"] } },
        data: { status: "CANCELLED" },
      }),
    ]);

    // Notify client
    await createNotification({
      userId: payment.job.clientId,
      type: "JOB_CANCELLED",
      message: `Votre mission a été remboursée. Le montant sera recrédité sous 3-5 jours ouvrés.`,
      link: "/dashboard/history",
    });

    createAuditLog({
      adminId: auth.payload.userId,
      action: "PAYMENT_REFUNDED",
      targetId: jobId,
      targetType: "Payment",
      details: {
        amount: payment.amount,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        category: payment.job.category.name,
        city: payment.job.city,
      },
      ip: getClientIp(req),
    });

    return apiSuccess({ refunded: true, amount: payment.amount });
  } catch (err) {
    adminLogger.error({ err }, "Admin refund error");
    return apiServerError();
  }
}
