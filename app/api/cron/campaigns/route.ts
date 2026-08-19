import { NextRequest, NextResponse } from "next/server";
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

export async function GET(req: NextRequest) {
  // Vérification du secret Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cherche les campagnes programmées dont l'heure est passée
  const due = await prisma.campaignDraft.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: new Date() },
    },
  });

  let totalSent = 0;

  for (const draft of due) {
    try {
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
        where: { id: draft.id },
        data: { status: "SENT", sentAt: new Date(), sentCount: sent, totalCount: artisans.length },
      });

      await createAuditLog({
        adminId: draft.createdBy,
        action: "SETTINGS_UPDATED",
        details: { campaignSubject: draft.subject, sent, total: artisans.length, source: "cron" },
      });

      totalSent += sent;
    } catch { /* continue avec les suivants */ }
  }

  return NextResponse.json({ processed: due.length, sent: totalSent });
}
