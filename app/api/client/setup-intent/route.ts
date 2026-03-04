import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import {
  isStripeConfigured,
  createSetupIntent,
  createCustomer,
} from "@/lib/stripe";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

/** POST /api/client/setup-intent — Crée un SetupIntent pour sauvegarder une carte */
export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ["CLIENT"]);
  if ("error" in auth) return auth.error;

  if (!isStripeConfigured()) {
    return apiError("Le paiement en ligne n'est pas encore activé sur cette plateforme.");
  }

  const { payload } = auth;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, firstName: true, lastName: true, stripeCustomerId: true },
    });

    if (!user) return apiError("Utilisateur introuvable");

    // Get or create Stripe Customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await createCustomer(
        user.email,
        `${user.firstName} ${user.lastName}`,
        user.id
      );
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const setupIntent = await createSetupIntent(customerId);

    return apiSuccess({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    logger.error({ err }, "Create setup intent error");
    return apiServerError();
  }
}
