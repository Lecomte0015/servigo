import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiServerError } from "@/lib/api-response";

/** GET /api/admin/messages — Liste toutes les conversations (admin uniquement) */
export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status"); // MATCHING | ASSIGNED | IN_PROGRESS | etc.
  const onlyFlagged = searchParams.get("flagged") === "true";

  try {
    const jobs = await prisma.jobRequest.findMany({
      where: {
        messages: onlyFlagged
          ? { some: { flagged: true } }
          : { some: {} }, // seulement missions avec au moins un message
        ...(statusFilter ? { status: statusFilter as never } : {}),
      },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, email: true } },
        targetArtisan: { select: { companyName: true } },
        assignment: {
          include: {
            artisan: { select: { companyName: true } },
          },
        },
        category: { select: { name: true, slug: true } },
        _count: { select: { messages: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: { select: { firstName: true, lastName: true, role: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Compter les messages signalés et les fichiers par mission
    const jobIds = jobs.map((j) => j.id);

    const [flaggedCounts, fileCounts] = await Promise.all([
      prisma.message.groupBy({
        by: ["jobId"],
        where: { jobId: { in: jobIds }, flagged: true },
        _count: { _all: true },
      }),
      prisma.message.groupBy({
        by: ["jobId"],
        where: { jobId: { in: jobIds }, fileUrl: { not: null } },
        _count: { _all: true },
      }),
    ]);

    const flaggedMap = new Map(flaggedCounts.map((r) => [r.jobId, r._count._all]));
    const fileMap = new Map(fileCounts.map((r) => [r.jobId, r._count._all]));

    const result = jobs.map((job) => ({
      ...job,
      flaggedCount: flaggedMap.get(job.id) ?? 0,
      fileCount: fileMap.get(job.id) ?? 0,
    }));

    return apiSuccess(result);
  } catch (err) {
    console.error("Admin messages list error:", err);
    return apiServerError();
  }
}
