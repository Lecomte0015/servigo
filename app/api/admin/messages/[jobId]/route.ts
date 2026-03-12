import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiNotFound, apiServerError } from "@/lib/api-response";

/** GET /api/admin/messages/[jobId] — Détail d'une conversation (admin uniquement) */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { jobId } = await params;

  try {
    const job = await prisma.jobRequest.findUnique({
      where: { id: jobId },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, email: true } },
        targetArtisan: { select: { companyName: true, userId: true } },
        assignment: {
          include: {
            artisan: { select: { companyName: true, userId: true } },
          },
        },
        category: { select: { name: true, slug: true } },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!job) return apiNotFound("Mission introuvable");

    return apiSuccess(job);
  } catch (err) {
    console.error("Admin message detail error:", err);
    return apiServerError();
  }
}
