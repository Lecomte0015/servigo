import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiError, apiNotFound, apiServerError } from "@/lib/api-response";
import { createNotification } from "@/services/notification";
import { jobLogger } from "@/lib/logger";

/** GET /api/jobs/[id]/messages — Fetch messages for a job (client or artisan of that job) */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["CLIENT", "ARTISAN"]);
  if ("error" in auth) return auth.error;

  const { id: jobId } = await params;

  try {
    const job = await prisma.jobRequest.findUnique({
      where: { id: jobId },
      include: {
        assignment: { select: { artisan: { select: { userId: true } } } },
      },
    });

    if (!job) return apiNotFound("Mission introuvable");

    // Access control: client, assigned artisan, or eligible artisan during MATCHING phase
    const artisanUserId = job.assignment?.artisan.userId ?? null;
    let isAllowed =
      job.clientId === auth.payload.userId ||
      artisanUserId === auth.payload.userId;

    if (!isAllowed && job.status === "MATCHING" && auth.payload.role === "ARTISAN") {
      // Allow the targeted artisan (direct request) or any approved artisan
      // matching city+category (standard matching) to participate in the conversation
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

    const messages = await prisma.message.findMany({
      where: { jobId },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark messages from the other party as read
    await prisma.message.updateMany({
      where: {
        jobId,
        senderId: { not: auth.payload.userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return apiSuccess(messages);
  } catch (err) {
    jobLogger.error({ err }, "Get messages error");
    return apiServerError();
  }
}

/** POST /api/jobs/[id]/messages — Send a message */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["CLIENT", "ARTISAN"]);
  if ("error" in auth) return auth.error;

  const { id: jobId } = await params;

  try {
    const body = await req.json();
    const content = (body.content ?? "").trim();

    if (!content || content.length > 2000) {
      return apiError("Message invalide (1-2000 caractères)");
    }

    const job = await prisma.jobRequest.findUnique({
      where: { id: jobId },
      include: {
        assignment: { select: { artisan: { select: { userId: true } } } },
        targetArtisan: { select: { userId: true } },
      },
    });

    if (!job) return apiNotFound("Mission introuvable");

    // Access control: same logic as GET
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

    // Only allow messaging on active jobs
    const activeStatuses = ["ASSIGNED", "IN_PROGRESS", "MATCHING"];
    if (!activeStatuses.includes(job.status)) {
      return apiError("La messagerie n'est disponible que sur les missions actives");
    }

    const message = await prisma.message.create({
      data: {
        jobId,
        senderId: auth.payload.userId,
        content,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });

    // Notify the other party (non-blocking)
    // For assigned jobs: client ↔ assigned artisan
    // For MATCHING direct requests: client ↔ targeted artisan
    const assignedArtisanUserId = job.assignment?.artisan.userId ?? job.targetArtisan?.userId ?? null;
    const recipientId =
      auth.payload.userId === job.clientId
        ? assignedArtisanUserId
        : job.clientId;

    if (recipientId) {
      const senderName = `${message.sender.firstName} ${message.sender.lastName}`.trim();
      createNotification({
        userId: recipientId,
        type: "MESSAGE_RECEIVED",
        message: `Nouveau message de ${senderName} : "${content.slice(0, 60)}${content.length > 60 ? "…" : ""}"`,
      }).catch(() => {});
    }

    return apiSuccess(message, 201);
  } catch (err) {
    jobLogger.error({ err }, "Send message error");
    return apiServerError();
  }
}
