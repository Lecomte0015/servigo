import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiServerError } from "@/lib/api-response";
import { adminLogger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const status = searchParams.get("status") ?? undefined;
  const skip = (page - 1) * limit;

  try {
    const where = status ? { status: status as never } : {};

    const [payments, total, summary] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          job: {
            select: {
              id: true,
              status: true,
              city: true,
              category: { select: { name: true } },
              client: { select: { firstName: true, lastName: true, email: true } },
              assignment: {
                include: {
                  artisan: { select: { companyName: true } },
                },
              },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
      prisma.payment.aggregate({
        _sum: { amount: true, platformFee: true },
        _count: true,
      }),
    ]);

    return apiSuccess({
      payments,
      total,
      page,
      summary: {
        totalAmount: summary._sum.amount ?? 0,
        totalFees: summary._sum.platformFee ?? 0,
        totalCount: summary._count,
      },
    });
  } catch (err) {
    adminLogger.error({ err }, "List payments error");
    return apiServerError();
  }
}
