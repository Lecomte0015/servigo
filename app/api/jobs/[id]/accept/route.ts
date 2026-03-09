import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiError, apiNotFound, apiServerError } from "@/lib/api-response";
import { createNotification } from "@/services/notification";
import { sendJobAcceptedEmail } from "@/lib/email";
import { jobLogger } from "@/lib/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;

  const { payload } = auth;
  const { id: jobId } = await params;

  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: payload.userId },
      include: { user: { select: { phone: true } } },
    });

    if (!artisan || !artisan.isApproved) {
      return apiError("Profil artisan non approuvé");
    }

    const job = await prisma.jobRequest.findUnique({
      where: { id: jobId },
      include: {
        assignment: true,
        client: { select: { email: true, firstName: true } },
      },
    });

    if (!job) return apiNotFound("Demande introuvable");
    if (job.status !== "MATCHING") {
      return apiError("Cette demande n'est plus disponible");
    }
    if (job.assignment) {
      return apiError("Demande déjà assignée");
    }

    // Assign job
    const [updatedJob] = await prisma.$transaction([
      prisma.jobRequest.update({
        where: { id: jobId },
        data: { status: "ASSIGNED" },
      }),
      prisma.jobAssignment.create({
        data: {
          jobId,
          artisanId: artisan.id,
          acceptedAt: new Date(),
        },
      }),
    ]);

    // Notify client (in-app)
    await createNotification({
      userId: job.clientId,
      type: "JOB_ASSIGNED",
      message: `Un artisan a accepté votre demande et sera bientôt chez vous.`,
    });

    // Send email to client (non-blocking)
    if (job.client?.email) {
      sendJobAcceptedEmail(
        job.client.email,
        job.client.firstName,
        artisan.companyName,
        artisan.user?.phone ?? null,
        job.city,
      ).catch(() => {});
    }

    return apiSuccess({ status: updatedJob.status });
  } catch (err) {
    jobLogger.error({ err }, "Accept job error");
    return apiServerError();
  }
}
