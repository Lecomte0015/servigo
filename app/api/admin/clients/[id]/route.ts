import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiNotFound, apiServerError } from "@/lib/api-response";
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
        createdAt: true,
        jobRequests: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            category: { select: { name: true, icon: true } },
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
