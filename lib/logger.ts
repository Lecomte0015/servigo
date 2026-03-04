/**
 * ServiGo — Logger structuré (pino)
 *
 * Remplace les console.error/console.warn/console.info dispersés.
 *
 * En développement : sortie colorée via pino-pretty
 * En production    : JSON sur stdout (compatible Vercel / Datadog / Loki)
 *
 * Usage :
 *   import { logger } from "@/lib/logger";
 *   logger.info("Job créé");
 *   logger.error({ err, jobId }, "Erreur capture Stripe");
 *   const child = logger.child({ module: "stripe" });
 *   child.warn("Stripe non configuré");
 */

import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
    // Champs de base ajoutés à chaque log
    base: {
      app:  "servigo",
      env:  process.env.NODE_ENV ?? "development",
    },
    // Sérialiser les objets Error automatiquement
    serializers: {
      err: pino.stdSerializers.err,
    },
    // Timestamp ISO 8601 lisible
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  isDev
    ? // Couleurs + formatage lisible en dev
      pino.transport({
        target:  "pino-pretty",
        options: {
          colorize:         true,
          translateTime:    "SYS:HH:MM:ss",
          ignore:           "pid,hostname,app,env",
          messageFormat:    "[{module}] {msg}",
          singleLine:       false,
        },
      })
    : // JSON brut en production
      undefined
);

// ─── Child loggers par module ─────────────────────────────────────────────────
// Chaque module peut créer son propre logger enfant avec un contexte fixe.

export const authLogger     = logger.child({ module: "auth" });
export const jobLogger      = logger.child({ module: "jobs" });
export const stripeLogger   = logger.child({ module: "stripe" });
export const webhookLogger  = logger.child({ module: "webhook" });
export const emailLogger    = logger.child({ module: "email" });
export const sessionLogger  = logger.child({ module: "session" });
export const adminLogger    = logger.child({ module: "admin" });
