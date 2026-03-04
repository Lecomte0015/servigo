import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});

export const PLATFORM_FEE_PERCENT = 0.1; // 10%

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
