import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiServerError } from "@/lib/api-response";
import { adminLogger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const approved  = searchParams.get("approved");
  const hasCert   = searchParams.get("hasCert");   // "pending" → insuranceCertUrl non-null ET non vérifiée
  const page  = parseInt(searchParams.get("page")  ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  try {
    let where: Record<string, unknown> = {};
    if (approved !== null) where.isApproved = approved === "true";
    if (hasCert === "pending") {
      where.insuranceCertUrl  = { not: null };
      where.insuranceVerified = false;
    }

    const [artisans, total] = await Promise.all([
      prisma.artisanProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { email: true, firstName: true, lastName: true, phone: true, createdAt: true, isBlocked: true } },
          services: { include: { category: true } },
        },
      }),
      prisma.artisanProfile.count({ where }),
    ]);

    return apiSuccess({ artisans, total, page });
  } catch (err) {
    adminLogger.error({ err }, "List artisans error");
    return apiServerError();
  }
}
