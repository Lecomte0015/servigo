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
import { encrypt, decrypt } from "@/lib/encryption";
import { logger } from "@/lib/logger";

// Basic IBAN validation (international format: 2 letters + 2 digits + up to 30 alphanumeric)
// Swiss IBAN: CH + 2 check digits + 17 chars = 21 total
function isValidIban(iban: string): boolean {
  const cleaned = iban.replace(/\s+/g, "").toUpperCase();
  return /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/.test(cleaned) && cleaned.length >= 15 && cleaned.length <= 34;
}

function normalizeIban(iban: string): string {
  return iban.replace(/\s+/g, "").toUpperCase();
}

const bankAccountSchema = z.object({
  iban: z
    .string()
    .min(15, "IBAN trop court")
    .max(40, "IBAN trop long")
    .refine((v) => isValidIban(v), { message: "IBAN invalide" }),
  accountHolder: z
    .string()
    .min(2, "Nom du titulaire requis")
    .max(100, "Nom trop long")
    .trim(),
});

/** GET /api/artisan/bank-account — Retrieve saved bank info */
export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;

  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: auth.payload.userId },
      select: { iban: true, accountHolder: true },
    });

    if (!artisan) return apiNotFound("Profil artisan introuvable");

    // Decrypt IBAN (handles plain-text legacy values transparently)
    const ibanPlain = artisan.iban ? decrypt(artisan.iban) : null;

    // Mask IBAN for display: show first 4 + last 4 chars, mask the rest
    const maskedIban = ibanPlain
      ? ibanPlain.slice(0, 4) + "•".repeat(ibanPlain.length - 8) + ibanPlain.slice(-4)
      : null;

    return apiSuccess({
      iban: maskedIban,
      ibanFull: ibanPlain, // needed for pre-fill in form
      accountHolder: artisan.accountHolder,
      hasBankAccount: !!(artisan.iban && artisan.accountHolder),
    });
  } catch (err) {
    logger.error({ err }, "Get bank account error");
    return apiServerError();
  }
}

/** PATCH /api/artisan/bank-account — Save / update bank account */
export async function PATCH(req: NextRequest) {
  const auth = requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const parsed = bankAccountSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message);
    }

    const { iban, accountHolder } = parsed.data;
    const normalizedIban = normalizeIban(iban);
    const encryptedIban = encrypt(normalizedIban); // AES-256-GCM

    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: auth.payload.userId },
      select: { id: true },
    });
    if (!artisan) return apiNotFound("Profil artisan introuvable");

    await prisma.artisanProfile.update({
      where: { id: artisan.id },
      data: {
        iban: encryptedIban,
        accountHolder: accountHolder.trim(),
      },
    });

    return apiSuccess({ message: "Coordonnées bancaires enregistrées" });
  } catch (err) {
    logger.error({ err }, "Update bank account error");
    return apiServerError();
  }
}
