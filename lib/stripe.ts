import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});

export const PLATFORM_FEE_PERCENT = 0.15; // 15%

/** Returns true when a real Stripe key is configured */
export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  return (
    (key.startsWith("sk_test_") && !key.includes("REPLACE")) ||
    key.startsWith("sk_live_")
  );
}

export async function createPaymentIntent(
  amount: number,
  jobId: string,
  customerId?: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // CHF in centimes
    currency: "chf",
    capture_method: "manual", // pre-authorization
    metadata: { jobId },
    ...(customerId ? { customer: customerId } : {}),
  });
}

export async function capturePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.capture(paymentIntentId);
}

export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.cancel(paymentIntentId);
}

export async function createSetupIntent(
  customerId: string
): Promise<Stripe.SetupIntent> {
  return stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
  });
}

export async function createCustomer(
  email: string,
  name: string,
  userId: string
): Promise<Stripe.Customer> {
  return stripe.customers.create({ email, name, metadata: { userId } });
}

export async function listPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  const list = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });
  return list.data;
}

export async function detachPaymentMethod(
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> {
  return stripe.paymentMethods.detach(paymentMethodId);
}

export async function refundPayment(
  paymentIntentId: string
): Promise<Stripe.Refund> {
  return stripe.refunds.create({ payment_intent: paymentIntentId });
}

/**
 * Crée une session Stripe Checkout (carte).
 * Paiement immédiat — pas de pré-auth.
 * Le jobId est passé en metadata pour identifier le job dans le webhook.
 */
export async function createCheckoutSession(
  amountChf: number,
  jobId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "chf",
          product_data: {
            name: "Mission GoServi",
            description: `Réf. ${jobId.slice(0, 8).toUpperCase()}`,
          },
          unit_amount: Math.round(amountChf * 100),
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { jobId },
  });
}

export function constructWebhookEvent(
  body: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
