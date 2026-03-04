import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword } from "@/lib/hash";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return apiError("Données invalides", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.payload.userId },
      select: { password: true },
    });
    if (!user) return apiError("Utilisateur non trouvé", 404);

    const valid = await comparePassword(parsed.data.currentPassword, user.password);
    if (!valid) {
      return apiError("Mot de passe actuel incorrect", 400);
    }

    const hashed = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({
      where: { id: auth.payload.userId },
      data: { password: hashed },
    });

    return apiSuccess({ message: "Mot de passe mis à jour" });
  } catch {
    return apiServerError();
  }
}
