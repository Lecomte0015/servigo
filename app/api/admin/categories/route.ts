import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { getClientIp } from "@/lib/rate-limit";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit-log";
import { adminLogger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { artisanServices: true, jobRequests: true } } },
    });
    return apiSuccess({ categories });
  } catch (err) {
    adminLogger.error({ err }, "List categories error");
    return apiServerError();
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const { name, icon, description, startPrice, bgColor, accentColor, displayOrder } = body;
    if (!name?.trim()) return apiError("Le nom est requis");

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await prisma.serviceCategory.findUnique({ where: { slug } });
    if (existing) return apiError("Cette catégorie existe déjà");

    const category = await prisma.serviceCategory.create({
      data: {
        name: name.trim(),
        slug,
        icon: icon?.trim() || null,
        description: description?.trim() || null,
        startPrice: startPrice ? parseFloat(startPrice) : null,
        bgColor: bgColor?.trim() || null,
        accentColor: accentColor?.trim() || null,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      },
    });

    createAuditLog({
      adminId: auth.payload.userId,
      action: "CATEGORY_CREATED",
      targetId: category.id,
      targetType: "ServiceCategory",
      details: { name: category.name, slug: category.slug },
      ip: getClientIp(req),
    });

    return apiSuccess(category, 201);
  } catch (err) {
    adminLogger.error({ err }, "Create category error");
    return apiServerError();
  }
}
