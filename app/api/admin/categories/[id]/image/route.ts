import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseAdmin } from "@/lib/supabase";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { adminLogger } from "@/lib/logger";

const BUCKET = "photo";
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  try {
    const category = await prisma.serviceCategory.findUnique({ where: { id } });
    if (!category) return apiError("Catégorie introuvable");

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) return apiError("Aucun fichier fourni");
    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError("Format non supporté. Utilisez JPG, PNG ou WebP.");
    }
    if (file.size > MAX_SIZE) {
      return apiError("Fichier trop volumineux (max 5 Mo)");
    }

    // Delete old image if exists
    if (category.imageUrl) {
      const oldPath = category.imageUrl.split(`/${BUCKET}/`)[1];
      if (oldPath) {
        await supabaseAdmin.storage.from(BUCKET).remove([oldPath]);
      }
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `categories/${id}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      adminLogger.error({ uploadError }, "Category image upload error");
      return apiServerError();
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    const imageUrl = data.publicUrl;

    await prisma.serviceCategory.update({ where: { id }, data: { imageUrl } });

    return apiSuccess({ imageUrl });
  } catch (err) {
    adminLogger.error({ err }, "Category image upload error");
    return apiServerError();
  }
}

/** DELETE /api/admin/categories/[id]/image — Remove image */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  try {
    const category = await prisma.serviceCategory.findUnique({ where: { id } });
    if (!category) return apiError("Catégorie introuvable");

    if (category.imageUrl) {
      const oldPath = category.imageUrl.split(`/${BUCKET}/`)[1];
      if (oldPath) await supabaseAdmin.storage.from(BUCKET).remove([oldPath]);
    }

    await prisma.serviceCategory.update({ where: { id }, data: { imageUrl: null } });
    return apiSuccess({ deleted: true });
  } catch (err) {
    adminLogger.error({ err }, "Category image delete error");
    return apiServerError();
  }
}
