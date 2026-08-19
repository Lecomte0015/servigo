import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { sendArtisanCampaignEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/audit-log";

// Normalise une ville : retire accents + minuscules → "Genève" = "geneve"
function normalizeCity(city: string) {
  return city.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function cityWhereClause(cityFilter: string) {
  const normalized = normalizeCity(cityFilter);
  // Cherche la valeur exacte ET la version sans accents (les artisans saisissent librement)
  const variants = Array.from(new Set([cityFilter, normalized]));
  return { city: { in: variants, mode: "insensitive" as const } };
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { subject, message, cityFilter, categoryId } = body as {
    subject: string;
    message: string;
    cityFilter?: string;
    categoryId?: string;
  };

  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Sujet et message requis" }, { status: 400 });
  }

  const artisans = await prisma.artisanProfile.findMany({
    where: {
      isApproved: true,
      ...(cityFilter ? cityWhereClause(cityFilter) : {}),
      ...(categoryId ? { services: { some: { categoryId, isActive: true } } } : {}),
    },
    include: { user: { select: { firstName: true, email: true } } },
  });

  let sent = 0;
  for (const a of artisans) {
    try {
      await sendArtisanCampaignEmail(a.user.email, a.user.firstName, subject, message);
      sent++;
    } catch {
      // non-blocking
    }
  }

  await createAuditLog({
    adminId: auth.payload.userId,
    action: "SETTINGS_UPDATED",
    details: { campaignSubject: subject, sent, total: artisans.length },
  });

  return NextResponse.json({ sent, total: artisans.length });
}

// Preview: count artisans matching filters
export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const cityFilter = searchParams.get("city") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;

  const count = await prisma.artisanProfile.count({
    where: {
      isApproved: true,
      ...(cityFilter ? cityWhereClause(cityFilter) : {}),
      ...(categoryId ? { services: { some: { categoryId, isActive: true } } } : {}),
    },
  });

  return NextResponse.json({ count });
}
