import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseAdmin } from "@/lib/supabase";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const BUCKET = "photo";
const MAX_SIZE = 4 * 1024 * 1024; // 4 MB (cohérent avec la limite Vercel free plan)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ["ARTISAN"]);
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

    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!artisan) return apiError("Profil artisan introuvable");

    // Delete old photo if exists
    if (artisan.photoUrl) {
      const oldPath = artisan.photoUrl.split(`/${BUCKET}/`)[1];
      if (oldPath) {
        await supabaseAdmin.storage.from(BUCKET).remove([oldPath]);
      }
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `artisans/${artisan.id}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      logger.error({ uploadError }, "Photo upload error");
      return apiServerError();
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    const photoUrl = data.publicUrl;

    await prisma.artisanProfile.update({
      where: { id: artisan.id },
      data: { photoUrl },
    });

    return apiSuccess({ photoUrl });
  } catch (err) {
    logger.error({ err }, "Photo upload error");
    return apiServerError();
  }
}
