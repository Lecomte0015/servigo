/**
 * ServiGo — Environment Variable Validation
 *
 * Valide TOUTES les variables d'environnement au démarrage du serveur.
 * Les variables requises font crasher le process en production si absentes.
 * En développement : warning console pour ne pas bloquer l'itération.
 *
 * Usage:
 *   import { env } from "@/lib/env";
 *   env.STRIPE_SECRET_KEY  // typé, validé
 */

import { z } from "zod";
import { logger } from "@/lib/logger";

// ─── Schema ────────────────────────────────────────────────────────────────────

const envSchema = z.object({

  // ── Base de données ───────────────────────────────────────────────────────
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL ne peut pas être vide")
    .refine((v) => v.startsWith("postgresql://"), {
      message: "DATABASE_URL doit commencer par postgresql://",
    }),

  DIRECT_URL: z
    .string()
    .min(1, "DIRECT_URL ne peut pas être vide (Prisma migrations)")
    .refine((v) => v.startsWith("postgresql://"), {
      message: "DIRECT_URL doit commencer par postgresql://",
    }),

  // ── Authentification ──────────────────────────────────────────────────────
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET doit faire au moins 32 caractères — générer avec: openssl rand -base64 64"),

  ENCRYPTION_KEY: z
    .string()
    .regex(
      /^[0-9a-fA-F]{64}$/,
      "ENCRYPTION_KEY doit faire exactement 64 caractères hexadécimaux — générer avec: openssl rand -hex 32"
    ),

  // ── URL de l'application ──────────────────────────────────────────────────
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL doit être une URL valide (ex: https://goservi.ch)"),

  // ── Environnement ─────────────────────────────────────────────────────────
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // ── Stripe (optionnel — isStripeConfigured() gère l'absence) ─────────────
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // ── Resend emails (optionnel — fallback console.log si absent) ────────────
  RESEND_API_KEY: z.string().optional(),
  // Accepte "email@domain.com" ou "Name <email@domain.com>" (format Resend)
  RESEND_FROM_EMAIL: z
    .string()
    .refine(
      (v) => !v || v.includes("@"),
      "RESEND_FROM_EMAIL doit contenir une adresse email (ex: noreply@goservi.ch ou ServiGo <noreply@goservi.ch>)"
    )
    .optional()
    .or(z.literal("")),

  // ── Supabase Storage (optionnel — requis pour upload photos) ─────────────
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL doit être une URL valide")
    .optional()
    .or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // ── Upstash Redis (optionnel — fallback in-memory si absent) ─────────────
  UPSTASH_REDIS_REST_URL: z
    .string()
    .url("UPSTASH_REDIS_REST_URL doit être une URL valide")
    .optional()
    .or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

// ─── Validation ────────────────────────────────────────────────────────────────

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    // Formater les erreurs de façon lisible
    const errors = result.error.issues
      .map((issue) => {
        const path = issue.path.join(".");
        return `  ✗  ${path.padEnd(40)} ${issue.message}`;
      })
      .join("\n");

    const banner = [
      "",
      "╔══════════════════════════════════════════════════════════════╗",
      "║  🚨  ERREUR DE CONFIGURATION — Variables d'env invalides     ║",
      "╚══════════════════════════════════════════════════════════════╝",
      "",
      errors,
      "",
      "  → Corrigez votre fichier .env puis redémarrez le serveur.",
      "  → Référence : .env.example",
      "",
    ].join("\n");

    // En production : crash immédiat (ne pas démarrer avec une config cassée)
    if (process.env.NODE_ENV === "production") {
      throw new Error(banner);
    }

    // En dev : warning visible mais on continue (itération rapide)
    logger.warn(banner);

    // Retourne les vars brutes pour que le dev puisse quand même tester
    return process.env as unknown as Env;
  }

  return result.data;
}

/**
 * Variables d'environnement validées et typées.
 * Importez `env` plutôt que `process.env` pour bénéficier de l'autocomplétion
 * et de la vérification de type.
 *
 * @example
 *   import { env } from "@/lib/env";
 *   const url = env.NEXT_PUBLIC_APP_URL;  // string (validé)
 *   const key = env.STRIPE_SECRET_KEY;    // string | undefined
 */
export const env = validateEnv();

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Stripe est-il configuré ? */
export const isStripeReady = (): boolean =>
  !!(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET);

/** Resend est-il configuré ? */
export const isResendReady = (): boolean =>
  !!(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL);

/** Supabase est-il configuré ? */
export const isSupabaseReady = (): boolean =>
  !!(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);

/** Upstash Redis est-il configuré ? */
export const isRedisReady = (): boolean =>
  !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
