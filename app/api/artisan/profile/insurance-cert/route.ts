/**
 * GET  /api/artisan/profile/insurance-cert?type={mimeType}
 *   → Génère une URL signée Supabase pour upload direct depuis le navigateur.
 *     Contourne la limite 4.5 MB de Vercel (le fichier ne transite pas par Next.js).
 *
 * POST /api/artisan/profile/insurance-cert
 *   Body : { publicUrl: string }
 *   → Appelé après l'upload direct. Enregistre l'URL en DB,
 *     supprime l'ancien fichier et réinitialise insuranceVerified = false.
 *
 * DELETE /api/artisan/profile/insurance-cert
 *   → Supprime le fichier Supabase + efface insuranceCertUrl en DB.
 *
 * Stockage : bucket "photo", sous-dossier "documents/insurance/"
 * Formats acceptés : PDF, JPG, PNG, WebP (max 10 Mo — validé côté client)
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseAdmin } from "@/lib/supabase";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const BUCKET = "photo";
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

function getDocPath(artisanId: string, mimeType: string): string {
  const ext =
    mimeType === "application/pdf" ? "pdf"
    : mimeType === "image/png"    ? "png"
    : mimeType === "image/webp"   ? "webp"
    : "jpg";
  return `documents/insurance/${artisanId}.${ext}`;
}

// ── GET — générer une URL signée pour upload direct ─────────────────────────

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;

  const mimeType = req.nextUrl.searchParams.get("type");
  if (!mimeType || !ALLOWED_TYPES.includes(mimeType)) {
    return apiError("Format non supporté. Utilisez PDF, JPG, PNG ou WebP.");
  }

  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: auth.payload.userId },
      select: { id: true },
    });
    if (!artisan) return apiError("Profil artisan introuvable");

    const path = getDocPath(artisan.id, mimeType);

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path, { upsert: true });

    if (error || !data) {
      logger.error({ error }, "createSignedUploadUrl failed");
      return apiServerError("Impossible de générer l'URL d'upload.");
    }

    const { data: pubData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

    return apiSuccess({
      signedUrl: data.signedUrl,
      path,
      publicUrl: pubData.publicUrl,
    });
  } catch (err) {
    logger.error({ err }, "Insurance cert sign URL error");
    return apiServerError();
  }
}

// ── POST — enregistrer l'URL en DB après upload direct ──────────────────────

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;

  let publicUrl: string;
  try {
    const body = await req.json();
    if (typeof body.publicUrl !== "string" || !body.publicUrl) {
      return apiError("Le champ 'publicUrl' (string) est requis.");
    }
    publicUrl = body.publicUrl;
  } catch {
    return apiError("Corps de requête invalide.");
  }

  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: auth.payload.userId },
      select: { id: true, insuranceCertUrl: true },
    });
    if (!artisan) return apiError("Profil artisan introuvable");

    // Supprimer l'ancien fichier Supabase s'il existe
    if (artisan.insuranceCertUrl) {
      const oldPath = artisan.insuranceCertUrl.split(`/${BUCKET}/`)[1];
      if (oldPath) {
        await supabaseAdmin.storage.from(BUCKET).remove([oldPath]).catch(() => {});
      }
    }

    await prisma.artisanProfile.update({
      where: { id: artisan.id },
      data: {
        insuranceCertUrl: publicUrl,
        insuranceVerified: false, // nouveau doc = re-vérification admin requise
      },
    });

    return apiSuccess({ insuranceCertUrl: publicUrl });
  } catch (err) {
    logger.error({ err }, "Insurance cert save error");
    return apiServerError();
  }
}

// ── DELETE — supprimer ───────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req, ["ARTISAN"]);
  if ("error" in auth) return auth.error;

  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: auth.payload.userId },
      select: { id: true, insuranceCertUrl: true },
    });

    if (!artisan) return apiError("Profil artisan introuvable");
    if (!artisan.insuranceCertUrl) return apiError("Aucun document à supprimer");

    const oldPath = artisan.insuranceCertUrl.split(`/${BUCKET}/`)[1];
    if (oldPath) {
      await supabaseAdmin.storage.from(BUCKET).remove([oldPath]);
    }

    await prisma.artisanProfile.update({
      where: { id: artisan.id },
      data: { insuranceCertUrl: null, insuranceVerified: false },
    });

    return apiSuccess({ message: "Document supprimé" });
  } catch (err) {
    logger.error({ err }, "Insurance cert delete error");
    return apiServerError();
  }
}
