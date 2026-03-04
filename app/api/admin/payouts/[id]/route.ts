import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { getClientIp } from "@/lib/rate-limit";
import { apiSuccess, apiError, apiNotFound, apiServerError } from "@/lib/api-response";
import { createNotification } from "@/services/notification";
import { sendPayoutStatusEmail } from "@/lib/email";
import { createAuditLog, type AuditAction } from "@/lib/audit-log";
import { adminLogger } from "@/lib/logger";

const updatePayoutSchema = z.object({
  status: z.enum(["PROCESSING", "COMPLETED", "FAILED"]),
  adminNotes: z.string().max(500).optional(),
});

/** PATCH /api/admin/payouts/[id] — Update payout status (state machine) */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = updatePayoutSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message);

    const { status, adminNotes } = parsed.data;

    const payout = await prisma.payout.findUnique({
      where: { id },
      include: {
        artisan: {
          select: {
            userId: true,
            companyName: true,
            user: { select: { firstName: true, email: true } },
          },
        },
      },
    });

    if (!payout) return apiNotFound("Demande de retrait introuvable");

    // ── State machine ─────────────────────────────────────────────────────
    const allowedTransitions: Record<string, string[]> = {
      PENDING:    ["PROCESSING", "FAILED"],
      PROCESSING: ["COMPLETED", "FAILED"],
    };
    if (!(allowedTransitions[payout.status] ?? []).includes(status)) {
      return apiError(`Transition invalide : ${payout.status} → ${status}`);
    }

    const updated = await prisma.payout.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes ?? payout.adminNotes,
        processedAt:
          status === "COMPLETED" || status === "FAILED" ? new Date() : payout.processedAt,
      },
    });

    // ── Notifications ─────────────────────────────────────────────────────
    const { userId: artisanUserId, companyName, user: { firstName: artisanName, email: artisanEmail } } = payout.artisan;
    const amount = payout.amount;

    const notifMessages: Record<string, string> = {
      PROCESSING: `Votre retrait de ${amount.toFixed(2)} CHF est en cours de traitement. Virement sous 1-3 jours ouvrés.`,
      COMPLETED:  `✅ Votre retrait de ${amount.toFixed(2)} CHF a été viré sur votre compte bancaire.`,
      FAILED:     `⚠️ Votre demande de retrait de ${amount.toFixed(2)} CHF n'a pas pu être traitée.${adminNotes ? " Motif : " + adminNotes : ""} Contactez le support.`,
    };

    await createNotification({ userId: artisanUserId, type: `PAYOUT_${status}`, message: notifMessages[status] });
    sendPayoutStatusEmail(artisanEmail, artisanName, amount, status, adminNotes).catch((err) => adminLogger.error({ err }, "Email send failed"));

    // ── Audit log ─────────────────────────────────────────────────────────
    createAuditLog({
      adminId: auth.payload.userId,
      action: `PAYOUT_${status}` as AuditAction,
      targetId: id,
      targetType: "Payout",
      details: { amount, status, companyName, artisanEmail, adminNotes: adminNotes ?? null },
      ip: getClientIp(req),
    });

    return apiSuccess(updated);
  } catch (err) {
    adminLogger.error({ err }, "Update payout error");
    return apiServerError();
  }
}
