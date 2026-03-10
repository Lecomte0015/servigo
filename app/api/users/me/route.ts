import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().max(20).optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Données invalides", 400);
    }

    const updated = await prisma.user.update({
      where: { id: auth.payload.userId },
      data: {
        ...(parsed.data.firstName && { firstName: parsed.data.firstName }),
        ...(parsed.data.lastName && { lastName: parsed.data.lastName }),
        phone: parsed.data.phone ?? undefined,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
      },
    });

    return apiSuccess(updated);
  } catch {
    return apiServerError();
  }
}
