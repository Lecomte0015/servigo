import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiServerError } from "@/lib/api-response";
import { decrypt } from "@/lib/encryption";
import { adminLogger } from "@/lib/logger";

/** GET /api/admin/payouts — List all payouts with artisan info */
export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 20;
  const skip = (page - 1) * limit;

  try {
    const where = status && status !== "ALL"
      ? { status: status as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" }
      : {};

    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
        where,
        include: {
          artisan: {
            select: {
              companyName: true,
              city: true,
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payout.count({ where }),
    ]);

    // Summary
    const summary = await prisma.payout.groupBy({
      by: ["status"],
      _sum: { amount: true },
      _count: { id: true },
    });

    const summaryMap = Object.fromEntries(
      summary.map((s) => [s.status, { total: s._sum.amount ?? 0, count: s._count.id }])
    );

    // Decrypt IBAN for admin view (admin needs full IBAN to execute bank transfer)
    const decryptedPayouts = payouts.map((p) => ({
      ...p,
      iban: decrypt(p.iban),
    }));

    return apiSuccess({
      payouts: decryptedPayouts,
      summary: summaryMap,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    adminLogger.error({ err }, "List payouts error");
    return apiServerError();
  }
}
