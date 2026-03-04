import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { getClientIp } from "@/lib/rate-limit";
import { apiSuccess, apiServerError } from "@/lib/api-response";
import { DEFAULT_SETTINGS } from "@/lib/site-settings";
import { createAuditLog } from "@/lib/audit-log";
import { adminLogger } from "@/lib/logger";

/** GET /api/admin/settings — Retourne les paramètres du site */
export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    const data = row ? { ...DEFAULT_SETTINGS, ...(row.data as object) } : DEFAULT_SETTINGS;
    return apiSuccess(data);
  } catch (err) {
    adminLogger.error({ err }, "Get settings error");
    return apiServerError();
  }
}

/** PATCH /api/admin/settings — Met à jour les paramètres (merge partiel) */
export async function PATCH(req: NextRequest) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();

    const row = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", data: { ...DEFAULT_SETTINGS, ...body } },
      update: { data: body },
    });

    createAuditLog({
      adminId: auth.payload.userId,
      action: "SETTINGS_UPDATED",
      targetId: "singleton",
      targetType: "SiteSettings",
      details: { updatedSections: Object.keys(body) },
      ip: getClientIp(req),
    });

    return apiSuccess(row.data);
  } catch (err) {
    adminLogger.error({ err }, "Update settings error");
    return apiServerError();
  }
}
