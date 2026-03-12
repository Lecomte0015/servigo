/**
 * GET /api/jobs/[id]/messages/upload-url?type={mimeType}&name={fileName}
 *
 * Génère une URL signée Supabase pour upload direct d'un fichier depuis le
 * navigateur (photos, PDF, docs). Contourne la limite 4.5 MB de Vercel.
 * Le fichier est stocké dans bucket "photo" sous "chat/{jobId}/{timestamp}-{name}".
 *
 * Formats acceptés : JPG, PNG, WebP, GIF, PDF, HEIC (max 15 Mo — validé côté client)
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseAdmin } from "@/lib/supabase";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { jobLogger } from "@/lib/logger";

const BUCKET = "photo";
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "application/pdf",
];

function getExt(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/heic": "heic",
    "application/pdf": "pdf",
  };
  return map[mimeType] ?? "bin";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ["CLIENT", "ARTISAN"]);
  if ("error" in auth) return auth.error;

  const { id: jobId } = await params;
  const mimeType = req.nextUrl.searchParams.get("type") ?? "";
  const originalName = req.nextUrl.searchParams.get("name") ?? "file";

  if (!ALLOWED_TYPES.includes(mimeType)) {
    return apiError("Format non supporté. Utilisez JPG, PNG, WebP, GIF, PDF.");
  }

  try {
    // Verify user has access to this job
    const job = await prisma.jobRequest.findUnique({
      where: { id: jobId },
      include: {
        assignment: { select: { artisan: { select: { userId: true } } } },
        targetArtisan: { select: { userId: true } },
      },
    });

    if (!job) return apiError("Mission introuvable", 404);

    const artisanUserId =
      job.assignment?.artisan.userId ?? job.targetArtisan?.userId ?? null;
    const isClient = job.clientId === auth.payload.userId;
    const isArtisan = artisanUserId === auth.payload.userId;

    if (!isClient && !isArtisan) {
      return apiError("Accès refusé", 403);
    }

    // Build unique path to avoid collisions
    const ext = getExt(mimeType);
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
    const path = `chat/${jobId}/${Date.now()}-${safeName}.${ext}`;

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path, { upsert: false });

    if (error || !data) {
      jobLogger.error({ error }, "createSignedUploadUrl chat failed");
      return apiServerError("Impossible de générer l'URL d'upload.");
    }

    const { data: pubData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

    return apiSuccess({
      signedUrl: data.signedUrl,
      path,
      publicUrl: pubData.publicUrl,
    });
  } catch (err) {
    jobLogger.error({ err }, "Chat upload-url error");
    return apiServerError();
  }
}
