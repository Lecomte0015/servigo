import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseAdmin } from "@/lib/supabase";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const BUCKET = "photo";
const MAX_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("error" in auth) return auth.error;

  const { payload } = auth;

  try {
    const formData = await req.formData();
    const file = formData.get("photo") as File | null;

    if (!file) return apiError("Aucun fichier fourni");
    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError("Format non supporté. Utilisez JPG, PNG ou WebP.");
    }
    if (file.size > MAX_SIZE) {
      return apiError("Fichier trop volumineux (max 4 Mo)");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, avatarUrl: true },
    });
    if (!user) return apiError("Utilisateur introuvable");

    // Suppression ancienne photo si elle existe
    if (user.avatarUrl) {
      const oldPath = user.avatarUrl.split(`/${BUCKET}/`)[1];
      if (oldPath) {
        await supabaseAdmin.storage.from(BUCKET).remove([oldPath]);
      }
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `clients/${user.id}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      logger.error({ uploadError }, "Avatar upload error");
      return apiServerError();
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    const avatarUrl = data.publicUrl;

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl },
    });

    return apiSuccess({ avatarUrl });
  } catch (err) {
    logger.error({ err }, "Avatar upload error");
    return apiServerError();
  }
}
