/**
 * ServiGo — Next.js Instrumentation Hook
 *
 * S'exécute UNE FOIS au démarrage du serveur Node.js, avant le premier request.
 * Utilisé pour :
 *   1. Valider les variables d'environnement (crash rapide en prod si manquantes)
 *   2. Afficher un résumé de la configuration au démarrage
 *
 * Doc: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */

export async function register() {
  // Ne tourne QUE sur le runtime Node.js (pas sur l'edge runtime)
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // ── 1. Validation des env vars ─────────────────────────────────────────────
  // L'import déclenche validateEnv() → throw en prod si vars manquantes
  const { env, isStripeReady, isResendReady, isSupabaseReady, isRedisReady } =
    await import("@/lib/env");

  const { logger } = await import("@/lib/logger");

  // ── 2. Résumé de démarrage ────────────────────────────────────────────────

  const ok  = (label: string) => `  ✅  ${label}`;
  const warn = (label: string) => `  ⚠️   ${label}`;

  const lines = [
    "",
    "┌─────────────────────────────────────────────────┐",
    "│  ⚡  ServiGo — Démarrage                         │",
    "└─────────────────────────────────────────────────┘",
    "",
    `  ENV          ${env.NODE_ENV}`,
    `  APP_URL      ${env.NEXT_PUBLIC_APP_URL}`,
    "",
    "  Services externes :",
    isStripeReady()
      ? ok("Stripe          configuré")
      : warn("Stripe          désactivé — paiements en mode PENDING"),
    isResendReady()
      ? ok("Resend          configuré — emails transactionnels actifs")
      : warn("Resend          non configuré — emails loggés en console"),
    isSupabaseReady()
      ? ok("Supabase        configuré — upload photos actif")
      : warn("Supabase        non configuré — upload photos désactivé"),
    isRedisReady()
      ? ok("Upstash Redis   configuré — rate limiting distribué")
      : warn("Upstash Redis   non configuré — rate limiting in-memory"),
    "",
  ];

  logger.info(lines.join("\n"));
}
