import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { getClientIp } from "@/lib/rate-limit";
import { apiSuccess, apiNotFound, apiError, apiServerError } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit-log";
import { adminLogger } from "@/lib/logger";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  try {
    const body = await req.json();
    const { name, icon, imageUrl, description, startPrice, bgColor, accentColor, displayOrder, isVisible } = body;

    if (!name?.trim()) return apiError("Le nom est requis");

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const category = await prisma.serviceCategory.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
        icon: icon?.trim() || null,
        imageUrl: imageUrl !== undefined ? (imageUrl?.trim() || null) : undefined,
        description: description !== undefined ? (description?.trim() || null) : undefined,
        startPrice: startPrice !== undefined ? (startPrice ? parseFloat(startPrice) : null) : undefined,
        bgColor: bgColor !== undefined ? (bgColor?.trim() || null) : undefined,
        accentColor: accentColor !== undefined ? (accentColor?.trim() || null) : undefined,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : undefined,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : undefined,
      },
    });

    createAuditLog({
      adminId: auth.payload.userId,
      action: "CATEGORY_UPDATED",
      targetId: id,
      targetType: "ServiceCategory",
      details: { name: category.name, slug: category.slug },
      ip: getClientIp(req),
    });

    return apiSuccess(category);
  } catch (err) {
    adminLogger.error({ err }, "Update category error");
    return apiServerError();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  try {
    const cat = await prisma.serviceCategory.findUnique({
      where: { id },
      include: { _count: { select: { jobRequests: true } } },
    });

    if (!cat) return apiNotFound("Catégorie introuvable");
    if (cat._count.jobRequests > 0)
      return apiError("Impossible de supprimer : des missions utilisent cette catégorie");

    await prisma.serviceCategory.delete({ where: { id } });

    createAuditLog({
      adminId: auth.payload.userId,
      action: "CATEGORY_DELETED",
      targetId: id,
      targetType: "ServiceCategory",
      details: { name: cat.name, slug: cat.slug },
      ip: getClientIp(req),
    });

    return apiSuccess({ deleted: true });
  } catch (err) {
    adminLogger.error({ err }, "Delete category error");
    return apiServerError();
  }
}
