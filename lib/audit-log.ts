/**
 * GoServi — Audit Log Service
 *
 * Enregistre les actions sensibles des administrateurs.
 * Non-bloquant : les erreurs sont loggées sans planter la requête principale.
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { adminLogger } from "@/lib/logger";

export type AuditAction =
  // Artisans
  | "ARTISAN_APPROVED"
  | "ARTISAN_REJECTED"
  | "INSURANCE_VERIFIED"
  | "INSURANCE_UNVERIFIED"
  // Retraits
  | "PAYOUT_PROCESSING"
  | "PAYOUT_COMPLETED"
  | "PAYOUT_FAILED"
  // Catégories
  | "CATEGORY_CREATED"
  | "CATEGORY_UPDATED"
  | "CATEGORY_DELETED"
  // Paramètres CMS
  | "SETTINGS_UPDATED"
  // Auth / Compte
  | "ADMIN_LOGIN"
  | "ADMIN_2FA_ENABLED"
  | "ADMIN_2FA_DISABLED"
  // Gestion utilisateurs
  | "USER_BLOCKED"
  | "USER_UNBLOCKED"
  | "USER_DELETED";

export interface AuditLogParams {
  adminId: string;
  action: AuditAction;
  targetId?: string;
  targetType?: string;
  details?: Record<string, unknown>;
  ip?: string;
}

/**
 * Crée une entrée d'audit log (non-bloquant).
 * Ne throw jamais — les erreurs sont uniquement loggées en console.
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminId:    params.adminId,
        action:     params.action,
        targetId:   params.targetId,
        targetType: params.targetType,
        ip:         params.ip,
        details:    params.details
          ? (params.details as Prisma.InputJsonValue)
          : Prisma.DbNull,
      },
    });
  } catch (err) {
    adminLogger.error({ err }, "Audit log creation failed");
  }
}

/**
 * Helper pour construire le label lisible d'une action.
 */
export function auditActionLabel(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    ARTISAN_APPROVED:      "Artisan approuvé",
    ARTISAN_REJECTED:      "Artisan refusé",
    INSURANCE_VERIFIED:    "Assurance vérifiée",
    INSURANCE_UNVERIFIED:  "Vérification assurance révoquée",
    PAYOUT_PROCESSING:  "Retrait → En traitement",
    PAYOUT_COMPLETED:   "Retrait → Complété",
    PAYOUT_FAILED:      "Retrait → Échoué",
    CATEGORY_CREATED:   "Catégorie créée",
    CATEGORY_UPDATED:   "Catégorie modifiée",
    CATEGORY_DELETED:   "Catégorie supprimée",
    SETTINGS_UPDATED:   "Paramètres CMS modifiés",
    ADMIN_LOGIN:        "Connexion admin",
    ADMIN_2FA_ENABLED:  "2FA activée",
    ADMIN_2FA_DISABLED: "2FA désactivée",
    USER_BLOCKED:       "Compte suspendu",
    USER_UNBLOCKED:     "Compte réactivé",
    USER_DELETED:       "Compte supprimé",
  };
  return labels[action] ?? action;
}
