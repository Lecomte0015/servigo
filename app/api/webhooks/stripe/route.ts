import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { constructWebhookEvent } from "@/lib/stripe";
import { webhookLogger } from "@/lib/logger";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    webhookLogger.error({ err }, "Signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.amount_capturable_updated": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: pi.id },
          data: { status: "AUTHORIZED" },
        });
        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: pi.id },
          data: { status: "CAPTURED" },
        });
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentIntentId: pi.id },
        });

        if (payment) {
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: { status: "REFUNDED" },
            }),
            prisma.jobRequest.update({
              where: { id: payment.jobId },
              data: { status: "CANCELLED" },
            }),
          ]);
        }
        break;
      }

      // PaymentIntent annulé : timeout Stripe 7j ou annulation via cancelPaymentIntent()
      case "payment_intent.canceled": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const payment = await prisma.payment.findFirst({
          where:  { stripePaymentIntentId: pi.id },
          select: { id: true, jobId: true },
        });

        if (payment) {
          // Mettre à jour le paiement + annuler le job s'il n'est pas encore terminal
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data:  { status: "REFUNDED" },
            }),
            // updateMany + filtre statut = idempotent (0 lignes si déjà COMPLETED/CANCELLED)
            prisma.jobRequest.updateMany({
              where: {
                id:     payment.jobId,
                status: { in: ["PENDING", "MATCHING", "ASSIGNED", "IN_PROGRESS"] },
              },
              data: { status: "CANCELLED" },
            }),
          ]);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          await prisma.payment.updateMany({
            where: { stripePaymentIntentId: charge.payment_intent as string },
            data: { status: "REFUNDED" },
          });
        }
        break;
      }

      default:
        webhookLogger.debug({ eventType: event.type }, "Unhandled event");
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    webhookLogger.error({ err }, "Handler error");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
