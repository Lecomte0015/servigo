import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiForbidden, apiServerError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;
  if (auth.payload.role !== "ADMIN") return apiForbidden();

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = (page - 1) * limit;

    const where = status ? { status: status as never } : {};

    const [jobs, total] = await Promise.all([
      prisma.jobRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          category: { select: { name: true } },
          client: { select: { firstName: true, lastName: true, email: true } },
          assignment: {
            include: {
              artisan: {
                select: {
                  companyName: true,
                  user: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
          payment: { select: { amount: true, status: true, platformFee: true } },
        },
      }),
      prisma.jobRequest.count({ where }),
    ]);

    return apiSuccess({ jobs, total, page, limit });
  } catch {
    return apiServerError();
  }
}
