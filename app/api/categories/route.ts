import { prisma } from "@/lib/prisma";
import { apiSuccess, apiServerError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { name: "asc" },
    });
    return apiSuccess(categories);
  } catch (err) {
    logger.error({ err }, "List categories error");
    return apiServerError();
  }
}
