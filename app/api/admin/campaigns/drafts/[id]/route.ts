import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { sendArtisanCampaignEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/audit-log";

function normalizeCity(city: string) {
  return city.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
function cityWhereClause(cityFilter: string) {
  const normalized = normalizeCity(cityFilter);
  const variants = Array.from(new Set([cityFilter, normalized]));
  return { city: { in: variants, mode: "insensitive" as const } };
}

// DELETE — supprimer un brouillon
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.campaignDraft.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// PATCH — modifier ou envoyer maintenant
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await req.json();
  const { action, subject, message, cityFilter, categoryId, artisanId, scheduledAt } = body as {
    action?: "send";
    subject?: string;
    message?: string;
    cityFilter?: string;
    categoryId?: string;
    artisanId?: string;
    scheduledAt?: string | null;
  };

  const draft = await prisma.campaignDraft.findUnique({ where: { id } });
  if (!draft) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  // Envoi immédiat
  if (action === "send") {
    const artisans = await prisma.artisanProfile.findMany({
      where: {
        isApproved: true,
        ...(draft.artisanId
          ? { id: draft.artisanId }
          : {
              ...(draft.cityFilter ? cityWhereClause(draft.cityFilter) : {}),
              ...(draft.categoryId ? { services: { some: { categoryId: draft.categoryId, isActive: true } } } : {}),
            }),
      },
      include: { user: { select: { firstName: true, email: true } } },
    });

    let sent = 0;
    for (const a of artisans) {
      try {
        await sendArtisanCampaignEmail(a.user.email, a.user.firstName, draft.subject, draft.message);
        sent++;
      } catch { /* non-blocking */ }
    }

    await prisma.campaignDraft.update({
      where: { id },
      data: { status: "SENT", sentAt: new Date(), sentCount: sent, totalCount: artisans.length },
    });

    await createAuditLog({
      adminId: auth.payload.userId,
      action: "SETTINGS_UPDATED",
      details: { campaignSubject: draft.subject, sent, total: artisans.length, source: "draft" },
    });

    return NextResponse.json({ sent, total: artisans.length });
  }

  // Mise à jour brouillon / reprogrammation
  const updated = await prisma.campaignDraft.update({
    where: { id },
    data: {
      ...(subject !== undefined ? { subject } : {}),
      ...(message !== undefined ? { message } : {}),
      cityFilter: cityFilter !== undefined ? (cityFilter || null) : undefined,
      categoryId: categoryId !== undefined ? (categoryId || null) : undefined,
      artisanId: artisanId !== undefined ? (artisanId || null) : undefined,
      scheduledAt: scheduledAt !== undefined ? (scheduledAt ? new Date(scheduledAt) : null) : undefined,
      status: scheduledAt !== undefined ? (scheduledAt ? "SCHEDULED" : "DRAFT") : undefined,
    },
  });

  return NextResponse.json({ draft: updated });
}
