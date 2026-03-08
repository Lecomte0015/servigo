import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiNotFound, apiServerError, apiError } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit-log";
import { adminLogger } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
            isBlocked: true,
          },
        },
        services: {
          include: {
            category: { select: { name: true, icon: true } },
          },
          orderBy: { category: { name: "asc" } },
        },
        assignments: {
          include: {
            job: {
              select: {
                id: true,
                status: true,
                description: true,
                city: true,
                createdAt: true,
                category: { select: { name: true } },
              },
            },
          },
          orderBy: { acceptedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!artisan) return apiNotFound("Artisan introuvable");

    return apiSuccess(artisan);
  } catch (err) {
    adminLogger.error({ err }, "Get artisan detail error");
    return apiServerError();
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  let blocked: boolean;
  try {
    const body = await req.json();
    if (typeof body.blocked !== "boolean") {
      return apiError("Le champ 'blocked' (boolean) est requis.");
    }
    blocked = body.blocked;
  } catch {
    return apiError("Corps de requête invalide.");
  }

  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { id },
      select: { userId: true, companyName: true },
    });

    if (!artisan) return apiNotFound("Artisan introuvable");

    await prisma.user.update({
      where: { id: artisan.userId },
      data: { isBlocked: blocked },
    });

    createAuditLog({
      action: blocked ? "USER_BLOCKED" : "USER_UNBLOCKED",
      adminId: auth.payload.userId,
      targetId: id,
      targetType: "artisan",
    }).catch(() => {});

    return apiSuccess({ isBlocked: blocked });
  } catch (err) {
    adminLogger.error({ err }, "Block artisan error");
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
    const artisan = await prisma.artisanProfile.findUnique({
      where: { id },
      select: {
        userId: true,
        companyName: true,
        assignments: {
          where: { job: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } } },
          select: { id: true },
        },
      },
    });

    if (!artisan) return apiNotFound("Artisan introuvable");

    if (artisan.assignments.length > 0) {
      return apiError(
        "Impossible de supprimer : cet artisan a des missions en cours. Attendez leur completion ou annulez-les d'abord."
      );
    }

    await prisma.user.delete({ where: { id: artisan.userId } });

    createAuditLog({
      action: "USER_DELETED",
      adminId: auth.payload.userId,
      targetId: id,
      targetType: "artisan",
      details: { companyName: artisan.companyName },
    }).catch(() => {});

    return apiSuccess({ deleted: true });
  } catch (err) {
    adminLogger.error({ err }, "Delete artisan error");
    return apiServerError();
  }
}
