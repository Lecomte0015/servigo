/**
 * GET /api/admin/artisans/[id]/insurance-cert-url
 * Admin only — génère une URL signée Supabase (1h) pour consulter l'attestation
 * d'assurance RC Pro de l'artisan.
 *
 * L'URL publique stockée en DB peut ne pas être accessible si le bucket Supabase
 * n'est pas configuré en public read. Une URL signée contourne ce problème.
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseAdmin } from "@/lib/supabase";
import { apiSuccess, apiError, apiNotFound, apiServerError } from "@/lib/api-response";
import { adminLogger } from "@/lib/logger";

const BUCKET = "photo";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { id },
      select: { insuranceCertUrl: true },
    });

    if (!artisan) return apiNotFound("Artisan introuvable");
    if (!artisan.insuranceCertUrl) return apiError("Aucun document d'assurance disponible.");

    // Extraire le chemin depuis l'URL publique Supabase
    // Format : https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const marker = `/object/public/${BUCKET}/`;
    const idx = artisan.insuranceCertUrl.indexOf(marker);
    if (idx === -1) {
      // URL non-standard (ancienne version) — retourner directement
      return apiSuccess({ signedUrl: artisan.insuranceCertUrl });
    }
    const path = artisan.insuranceCertUrl.slice(idx + marker.length);

    // Générer une URL signée valide 1 heure
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600);

    if (error || !data?.signedUrl) {
      adminLogger.error({ error }, "createSignedUrl for insurance cert failed");
      return apiServerError("Impossible de générer le lien de consultation.");
    }

    return apiSuccess({ signedUrl: data.signedUrl });
  } catch (err) {
    adminLogger.error({ err }, "insurance-cert-url error");
    return apiServerError();
  }
}
