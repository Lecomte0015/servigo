import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiError, apiNotFound, apiServerError } from "@/lib/api-response";
import { jobLogger } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const { payload } = auth;
  const { id } = await params;

  try {
    const job = await prisma.jobRequest.findUnique({
      where: { id },
      include: {
        category: true,
        client: { select: { id: true, firstName: true, lastName: true, phone: true } },
        assignment: {
          include: {
            artisan: {
              include: { user: { select: { firstName: true, lastName: true, phone: true } } },
            },
          },
        },
        payment: true,
        review: true,
      },
    });

    if (!job) return apiNotFound("Demande introuvable");

    // Ownership check
    const isOwner = job.clientId === payload.userId;
    const isAssignedArtisan = job.assignment?.artisan?.userId === payload.userId;
    const isAdmin = payload.role === "ADMIN";

    if (!isOwner && !isAssignedArtisan && !isAdmin) {
      return apiError("Accès refusé", 403);
    }

    return apiSuccess(job);
  } catch (err) {
    jobLogger.error({ err }, "Get job error");
    return apiServerError();
  }
}
