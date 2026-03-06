/**
 * DEBUG ENDPOINT — À supprimer après diagnostic
 * GET /api/debug — teste la connexion Prisma et retourne l'erreur exacte
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const info: Record<string, unknown> = {
    nodeVersion: process.version,
    nodeEnv: process.env.NODE_ENV,
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPrefix: process.env.DATABASE_URL?.slice(0, 40) + "...",
  };

  try {
    await prisma.$queryRaw`SELECT 1 as ok`;
    return NextResponse.json({ ok: true, info });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      info,
      error: err instanceof Error ? err.message : String(err),
      errorName: err instanceof Error ? err.name : "unknown",
    }, { status: 500 });
  }
}
