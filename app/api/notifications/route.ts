import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiServerError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const { payload } = auth;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return apiSuccess(notifications);
  } catch (err) {
    logger.error({ err }, "List notifications error");
    return apiServerError();
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const { payload } = auth;
  const body = await req.json();
  const { ids } = body as { ids: string[] };

  try {
    await prisma.notification.updateMany({
      where: { id: { in: ids }, userId: payload.userId },
      data: { read: true },
    });

    return apiSuccess({ updated: ids.length });
  } catch (err) {
    logger.error({ err }, "Update notifications error");
    return apiServerError();
  }
}
