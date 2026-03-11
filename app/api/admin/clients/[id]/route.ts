import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiNotFound, apiServerError, apiError } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit-log";
import { blockUser, unblockUser } from "@/lib/session";
import { adminLogger } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  try {
    const client = await prisma.user.findUnique({
      where: { id, role: "CLIENT" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isBlocked: true,
        createdAt: true,
        jobRequests: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            category: { select: { name: true, slug: true, icon: true } },
            assignment: {
              include: {
                artisan: { select: { companyName: true } },
              },
            },
            payment: { select: { amount: true, status: true, platformFee: true } },
          },
        },
      },
    });

    if (!client) return apiNotFound("Client introuvable");

    const totalSpent = client.jobRequests
      .filter((j) => j.payment?.status === "CAPTURED" || j.payment?.status === "RELEASED")
      .reduce((sum, j) => sum + (j.payment?.amount ?? 0), 0);

    return apiSuccess({ ...client, totalSpent });
  } catch (err) {
    adminLogger.error({ err }, "Get client detail error");
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
    const client = await prisma.user.findUnique({
      where: { id, role: "CLIENT" },
      select: { id: true },
    });

    if (!client) return apiNotFound("Client introuvable");

    await prisma.user.update({
      where: { id },
      data: { isBlocked: blocked },
    });

    // Propagation immédiate dans Redis pour le proxy Edge (fail-silent)
    if (blocked) {
      blockUser(id).catch(() => {});
    } else {
      unblockUser(id).catch(() => {});
    }

    createAuditLog({
      action: blocked ? "USER_BLOCKED" : "USER_UNBLOCKED",
      adminId: auth.payload.userId,
      targetId: id,
      targetType: "client",
    }).catch(() => {});

    return apiSuccess({ isBlocked: blocked });
  } catch (err) {
    adminLogger.error({ err }, "Block client error");
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
    const client = await prisma.user.findUnique({
      where: { id, role: "CLIENT" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jobRequests: {
          where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
          select: { id: true },
        },
      },
    });

    if (!client) return apiNotFound("Client introuvable");

    if (client.jobRequests.length > 0) {
      return apiError(
        "Impossible de supprimer : ce client a des missions en cours. Attendez leur completion ou annulez-les d'abord."
      );
    }

    await prisma.user.delete({ where: { id } });

    createAuditLog({
      action: "USER_DELETED",
      adminId: auth.payload.userId,
      targetId: id,
      targetType: "client",
      details: { name: `${client.firstName} ${client.lastName}` },
    }).catch(() => {});

    return apiSuccess({ deleted: true });
  } catch (err) {
    adminLogger.error({ err }, "Delete client error");
    return apiServerError();
  }
}
