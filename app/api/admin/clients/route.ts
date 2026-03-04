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
  const search = searchParams.get("search") ?? "";
  const skip = (page - 1) * limit;

  try {
    const where = search
      ? {
          role: "CLIENT" as const,
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : { role: "CLIENT" as const };

    const [clients, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          createdAt: true,
          _count: { select: { jobRequests: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return apiSuccess({ clients, total, page });
  } catch (err) {
    adminLogger.error({ err }, "List clients error");
    return apiServerError();
  }
}
