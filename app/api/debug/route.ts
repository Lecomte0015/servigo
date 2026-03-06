/**
 * DEBUG ENDPOINT — À supprimer après diagnostic
 * GET /api/debug — teste chaque étape du login pour isoler l'erreur
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. Test DB — User query
  try {
    const count = await prisma.user.count();
    results.userCount = count;
    results.dbUserQuery = "OK";
  } catch (err) {
    results.dbUserQuery = "FAILED";
    results.dbUserError = String(err);
  }

  // 2. Test findUnique with include
  try {
    const user = await prisma.user.findFirst({
      include: { artisanProfile: true },
    });
    results.findUniqueWithInclude = user ? "OK — user found" : "OK — no user";
  } catch (err) {
    results.findUniqueWithInclude = "FAILED";
    results.findUniqueError = String(err);
  }

  // 3. Test JWT sign
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      results.jwtSign = "FAILED — no JWT_SECRET";
    } else {
      jwt.sign({ test: true }, secret, { expiresIn: "1m" });
      results.jwtSign = "OK";
    }
  } catch (err) {
    results.jwtSign = "FAILED";
    results.jwtError = String(err);
  }

  // 4. Test bcrypt import
  try {
    const { comparePassword } = await import("@/lib/hash");
    await comparePassword("test", "$2a$12$wronghash123456789012345678901234");
    results.bcrypt = "OK";
  } catch (err) {
    // comparePassword throws on bad hash — that's OK, import worked
    const msg = String(err);
    results.bcrypt = msg.includes("Invalid") || msg.includes("hash") ? "OK — import works" : "FAILED: " + msg;
  }

  // 5. Test cookies import
  try {
    const { cookies } = await import("next/headers");
    await cookies();
    results.cookies = "OK";
  } catch (err) {
    results.cookies = "FAILED: " + String(err);
  }

  // 6. Env summary
  results.env = {
    hasJwtSecret: !!process.env.JWT_SECRET,
    jwtSecretLength: process.env.JWT_SECRET?.length ?? 0,
    hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
    encryptionKeyLength: process.env.ENCRYPTION_KEY?.length ?? 0,
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json(results);
}
