/**
 * DEBUG ENDPOINT — À supprimer après diagnostic
 * GET /api/debug — affiche les variables d'environnement (masquées) sans toucher la DB
 */
import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? "";
  const directUrl = process.env.DIRECT_URL ?? "";

  return NextResponse.json({
    nodeVersion: process.version,
    nodeEnv: process.env.NODE_ENV,
    // Show enough of the URL to diagnose without exposing credentials
    db: {
      hasUrl: !!dbUrl,
      // Show host portion only (after @ sign)
      host: dbUrl.includes("@") ? dbUrl.split("@")[1]?.slice(0, 60) : "NO_AT_SIGN",
      hasPgbouncer: dbUrl.includes("pgbouncer=true"),
      port: dbUrl.match(/:(\d+)\//)?.[1] ?? "unknown",
      isLocalhost: dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1"),
    },
    directUrl: {
      hasUrl: !!directUrl,
      host: directUrl.includes("@") ? directUrl.split("@")[1]?.slice(0, 60) : "NOT_SET",
      isLocalhost: directUrl.includes("localhost") || directUrl.includes("127.0.0.1"),
    },
    otherEnvs: {
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
      hasNextPublicAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "NOT_SET",
    },
  });
}
