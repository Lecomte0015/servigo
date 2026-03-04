import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiServerError } from "@/lib/api-response";
import { adminLogger } from "@/lib/logger";

/**
 * GET /api/admin/audit
 *
 * Paramètres de query :
 *   - page     : numéro de page (défaut 1)
 *   - limit    : lignes par page (défaut 30, max 100)
 *   - action   : filtre sur AuditAction (ex: ARTISAN_APPROVED)
 *   - adminId  : filtre sur un admin spécifique
 *   - from     : date ISO de début (ex: 2025-01-01)
 *   - to       : date ISO de fin   (ex: 2025-12-31)
 */
export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);

  const page    = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
  const limit   = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "30")));
  const action  = searchParams.get("action")  ?? undefined;
  const adminId = searchParams.get("adminId") ?? undefined;
  const from    = searchParams.get("from")    ?? undefined;
  const to      = searchParams.get("to")      ?? undefined;

  try {
    // ── Filtre where ──────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (action)  where.action  = action;
    if (adminId) where.adminId = adminId;

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to)   where.createdAt.lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }

    // ── Requêtes parallèles ───────────────────────────────────────────────────
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          admin: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    // ── Admins distincts pour le filtre ───────────────────────────────────────
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: "asc" },
    });

    return apiSuccess({
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
      admins,
    });
  } catch (err) {
    adminLogger.error({ err }, "List audit logs error");
    return apiServerError();
  }
}
