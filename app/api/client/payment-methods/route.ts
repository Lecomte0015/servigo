import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import {
  isStripeConfigured,
  listPaymentMethods,
  detachPaymentMethod,
} from "@/lib/stripe";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

/** GET /api/client/payment-methods — Liste les cartes sauvegardées */
export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ["CLIENT"]);
  if ("error" in auth) return auth.error;

  if (!isStripeConfigured()) {
    return apiSuccess([]);
  }

  const { payload } = auth;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) return apiSuccess([]);

    const methods = await listPaymentMethods(user.stripeCustomerId);

    const simplified = methods.map((m) => ({
      id: m.id,
      brand: m.card?.brand ?? "unknown",
      last4: m.card?.last4 ?? "????",
      expMonth: m.card?.exp_month,
      expYear: m.card?.exp_year,
    }));

    return apiSuccess(simplified);
  } catch (err) {
    logger.error({ err }, "List payment methods error");
    return apiServerError();
  }
}

/** DELETE /api/client/payment-methods?pmId=pm_xxx — Supprime une carte */
export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req, ["CLIENT"]);
  if ("error" in auth) return auth.error;

  if (!isStripeConfigured()) {
    return apiError("Stripe non configuré");
  }

  const pmId = new URL(req.url).searchParams.get("pmId");
  if (!pmId) return apiError("pmId manquant");

  try {
    await detachPaymentMethod(pmId);
    return apiSuccess({ detached: true });
  } catch (err) {
    logger.error({ err }, "Delete payment method error");
    return apiServerError();
  }
}
