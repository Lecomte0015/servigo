import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import {
  apiSuccess,
  apiError,
  apiNotFound,
  apiServerError,
} from "@/lib/api-response";
import { createNotification } from "@/services/notification";
import { decrypt } from "@/lib/encryption";
import { logger } from "@/lib/logger";

const MIN_PAYOUT = 10; // CHF

const requestPayoutSchema = z.object({
  amount: z
    .number()
    .min(MIN_PAYOUT, `Le montant minimum de retrait est ${MIN_PAYOUT} CHF`)
    .positive("Le montant doit être positif"),
});

/** GET /api/artisan/payouts — List artisan's payout history */
export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;

  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: auth.payload.userId },
      select: { id: true },
    });
    if (!artisan) return apiNotFound("Profil artisan introuvable");

    const payouts = await prisma.payout.findMany({
      where: { artisanId: artisan.id },
      orderBy: { createdAt: "desc" },
    });

    // Mask IBAN in payout history
    const sanitized = payouts.map((p) => {
      const ibanPlain = decrypt(p.iban);
      const maskedIban =
        ibanPlain.slice(0, 4) +
        "•".repeat(Math.max(0, ibanPlain.length - 8)) +
        ibanPlain.slice(-4);
      return { ...p, iban: maskedIban };
    });

    return apiSuccess(sanitized);
  } catch (err) {
    logger.error({ err }, "List payouts error");
    return apiServerError();
  }
}

/** POST /api/artisan/payouts — Request a new payout */
export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const parsed = requestPayoutSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }
    const { amount } = parsed.data;

    // Fetch artisan profile + bank info
    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: auth.payload.userId },
      select: { id: true, iban: true, accountHolder: true },
    });
    if (!artisan) return apiNotFound("Profil artisan introuvable");

    if (!artisan.iban || !artisan.accountHolder) {
      return apiError(
        "Veuillez d'abord configurer vos coordonnées bancaires avant de demander un retrait."
      );
    }

    // Check for existing PENDING or PROCESSING payout
    const pending = await prisma.payout.findFirst({
      where: {
        artisanId: artisan.id,
        status: { in: ["PENDING", "PROCESSING"] },
      },
    });
    if (pending) {
      return apiError(
        "Vous avez déjà un retrait en cours de traitement. Veuillez patienter."
      );
    }

    // Compute available balance
    const assignments = await prisma.jobAssignment.findMany({
      where: { artisanId: artisan.id },
      select: {
        job: { select: { payment: { select: { amount: true, platformFee: true, status: true } } } },
      },
    });

    const availableBalance = assignments.reduce((sum, a) => {
      const p = a.job.payment;
      if (p && p.status === "RELEASED") return sum + (p.amount - p.platformFee);
      return sum;
    }, 0);

    const completedPayouts = await prisma.payout.aggregate({
      where: { artisanId: artisan.id, status: "COMPLETED" },
      _sum: { amount: true },
    });
    const alreadyPaidOut = completedPayouts._sum.amount ?? 0;
    const realAvailable = Math.max(0, availableBalance - alreadyPaidOut);

    if (amount > realAvailable + 0.01) {
      return apiError(
        `Solde insuffisant. Solde disponible : ${realAvailable.toFixed(2)} CHF`
      );
    }

    const payout = await prisma.payout.create({
      data: {
        artisanId: artisan.id,
        amount,
        iban: artisan.iban, // encrypted snapshot
        accountHolder: artisan.accountHolder,
        status: "PENDING",
      },
    });

    await createNotification({
      userId: auth.payload.userId,
      type: "PAYOUT_REQUESTED",
      message: `Votre demande de retrait de ${amount.toFixed(2)} CHF a été enregistrée et est en cours de traitement.`,
    });

    return apiSuccess(payout, 201);
  } catch (err) {
    logger.error({ err }, "Create payout error");
    return apiServerError();
  }
}
