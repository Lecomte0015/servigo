/**
 * POST /api/artisan/profile/insurance-cert — Upload attestation assurance RC pro
 * DELETE /api/artisan/profile/insurance-cert — Supprimer le document
 *
 * Stockage : bucket Supabase "photo", sous-dossier "documents/insurance/"
 * Formats acceptés : PDF, JPG, PNG, WebP (max 10 Mo)
 * Uploading un nouveau document remet insuranceVerified = false (re-vérification admin requise)
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseAdmin } from "@/lib/supabase";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const BUCKET = "photo";
const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

function getDocPath(artisanId: string, mimeType: string): string {
  const ext =
    mimeType === "application/pdf" ? "pdf"
    : mimeType === "image/png"    ? "png"
    : mimeType === "image/webp"   ? "webp"
    : "jpg";
  return `documents/insurance/${artisanId}.${ext}`;
}

// ── POST — upload ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;

  const { payload } = auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return apiError("Aucun fichier fourni");
    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError("Format non supporté. Utilisez PDF, JPG, PNG ou WebP.");
    }
    if (file.size > MAX_SIZE) {
      return apiError("Fichier trop volumineux (max 10 Mo)");
    }

    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: payload.userId },
      select: { id: true, insuranceCertUrl: true },
    });

    if (!artisan) return apiError("Profil artisan introuvable");

    // Supprimer l'ancien document s'il existe
    if (artisan.insuranceCertUrl) {
      const oldPath = artisan.insuranceCertUrl.split(`/${BUCKET}/`)[1];
      if (oldPath) {
        await supabaseAdmin.storage.from(BUCKET).remove([oldPath]);
      }
    }

    const path = getDocPath(artisan.id, file.type);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      logger.error({ uploadError }, "Insurance cert upload error");
      return apiServerError("Erreur lors de l'upload du document.");
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    const insuranceCertUrl = data.publicUrl;

    // Sauvegarder l'URL + réinitialiser la vérification (nouveau doc = re-vérification)
    await prisma.artisanProfile.update({
      where: { id: artisan.id },
      data: {
        insuranceCertUrl,
        insuranceVerified: false, // Admin doit re-vérifier le nouveau document
      },
    });

    return apiSuccess({ insuranceCertUrl });
  } catch (err) {
    logger.error({ err }, "Insurance cert upload error");
    return apiServerError();
  }
}

// ── DELETE — supprimer ─────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;

  const { payload } = auth;

  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: payload.userId },
      select: { id: true, insuranceCertUrl: true },
    });

    if (!artisan) return apiError("Profil artisan introuvable");
    if (!artisan.insuranceCertUrl) return apiError("Aucun document à supprimer");

    // Supprimer du bucket Supabase
    const oldPath = artisan.insuranceCertUrl.split(`/${BUCKET}/`)[1];
    if (oldPath) {
      await supabaseAdmin.storage.from(BUCKET).remove([oldPath]);
    }

    // Effacer en DB
    await prisma.artisanProfile.update({
      where: { id: artisan.id },
      data: {
        insuranceCertUrl: null,
        insuranceVerified: false,
      },
    });

    return apiSuccess({ message: "Document supprimé" });
  } catch (err) {
    logger.error({ err }, "Insurance cert delete error");
    return apiServerError();
  }
}
