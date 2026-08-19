import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

// GET — liste tous les brouillons et campagnes programmées
export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const drafts = await prisma.campaignDraft.findMany({
    where: { status: { in: ["DRAFT", "SCHEDULED"] } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ drafts });
}

// POST — créer un brouillon ou programmer un envoi
export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { subject, message, cityFilter, categoryId, artisanId, scheduledAt } = body as {
    subject: string;
    message: string;
    cityFilter?: string;
    categoryId?: string;
    artisanId?: string;
    scheduledAt?: string;
  };

  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Sujet et message requis" }, { status: 400 });
  }

  const draft = await prisma.campaignDraft.create({
    data: {
      subject,
      message,
      cityFilter: cityFilter || null,
      categoryId: categoryId || null,
      artisanId: artisanId || null,
      status: scheduledAt ? "SCHEDULED" : "DRAFT",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      createdBy: auth.payload.userId,
    },
  });

  return NextResponse.json({ draft });
}
