import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiError, apiNotFound, apiServerError } from "@/lib/api-response";

/** PATCH /api/jobs/[id]/messages/[msgId]/flag — Signaler un message */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; msgId: string }> }
) {
  const auth = requireAuth(req, ["CLIENT", "ARTISAN"]);
  if ("error" in auth) return auth.error;

  const { id: jobId, msgId } = await params;

  try {
    const job = await prisma.jobRequest.findUnique({
      where: { id: jobId },
      include: {
        assignment: { select: { artisan: { select: { userId: true } } } },
      },
    });

    if (!job) return apiNotFound("Mission introuvable");

    // Access control: client ou artisan de la mission
    const artisanUserId = job.assignment?.artisan.userId ?? null;
    let isAllowed =
      job.clientId === auth.payload.userId ||
      artisanUserId === auth.payload.userId;

    if (!isAllowed && job.status === "MATCHING" && auth.payload.role === "ARTISAN") {
      const artisanProfile = await prisma.artisanProfile.findFirst({
        where: {
          userId: auth.payload.userId,
          isApproved: true,
          ...(job.targetArtisanId
            ? { id: job.targetArtisanId }
            : {
                city: job.city,
                services: { some: { categoryId: job.categoryId, isActive: true } },
              }),
        },
        select: { id: true },
      });
      isAllowed = !!artisanProfile;
    }

    if (!isAllowed) {
      return apiError("Accès refusé à cette conversation", 403);
    }

    // Vérifier que le message appartient bien à la mission
    const message = await prisma.message.findFirst({
      where: { id: msgId, jobId },
    });

    if (!message) return apiNotFound("Message introuvable");

    // Impossible de signaler son propre message
    if (message.senderId === auth.payload.userId) {
      return apiError("Vous ne pouvez pas signaler votre propre message");
    }

    // Déjà signalé : idempotent
    if (message.flagged) {
      return apiSuccess({ flagged: true });
    }

    await prisma.message.update({
      where: { id: msgId },
      data: { flagged: true, flaggedAt: new Date() },
    });

    return apiSuccess({ flagged: true });
  } catch (err) {
    console.error("Flag message error:", err);
    return apiServerError();
  }
}
