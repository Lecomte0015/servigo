/**
 * DEBUG ENDPOINT — À supprimer après diagnostic
 * GET  /api/debug — teste les composants individuels
 * POST /api/debug — rejoue le login step-by-step pour isoler l'erreur
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. DB user count
  try {
    const count = await prisma.user.count();
    results.userCount = count;
    results.dbUserQuery = "OK";
  } catch (err) {
    results.dbUserQuery = "FAILED: " + String(err);
  }

  // 2. findFirst with artisanProfile include
  try {
    const user = await prisma.user.findFirst({ include: { artisanProfile: true } });
    results.findUniqueWithInclude = user ? "OK — found " + user.email : "OK — no user";
  } catch (err) {
    results.findUniqueWithInclude = "FAILED: " + String(err);
  }

  // 3. JWT sign
  try {
    jwt.sign({ test: true }, process.env.JWT_SECRET!, { expiresIn: "1m" });
    results.jwtSign = "OK";
  } catch (err) {
    results.jwtSign = "FAILED: " + String(err);
  }

  // 4. otplib
  try {
    await import("otplib");
    results.otplib = "OK";
  } catch (err) {
    results.otplib = "FAILED: " + String(err);
  }

  // 5. lib/totp
  try {
    await import("@/lib/totp");
    results.libTotp = "OK";
  } catch (err) {
    results.libTotp = "FAILED: " + String(err);
  }

  // 6. lib/validations
  try {
    const { loginSchema } = await import("@/lib/validations");
    const r = loginSchema.safeParse({ email: "test@test.com", password: "Test123!" });
    results.libValidations = r.success ? "OK" : "parse failed";
  } catch (err) {
    results.libValidations = "FAILED: " + String(err);
  }

  // 7. cookies
  try {
    const { cookies } = await import("next/headers");
    await cookies();
    results.cookies = "OK";
  } catch (err) {
    results.cookies = "FAILED: " + String(err);
  }

  results.env = {
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
    hasDirectUrl: !!process.env.DIRECT_URL,
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json(results);
}

// POST — Rejoue le login step by step pour identifier où ça plante
export async function POST(req: NextRequest) {
  const steps: Record<string, unknown> = {};

  try {
    // Step 1: Parse body
    const body = await req.json();
    steps.s1_parseBody = "OK";

    // Step 2: Zod validation
    try {
      const { loginSchema } = await import("@/lib/validations");
      const parsed = loginSchema.safeParse(body);
      steps.s2_zod = parsed.success ? "OK" : "FAILED: " + parsed.error?.issues?.[0]?.message;
      if (!parsed.success) return NextResponse.json(steps);
    } catch (err) {
      steps.s2_zod = "EXCEPTION: " + String(err);
      return NextResponse.json(steps);
    }

    // Step 3: Prisma findUnique by email
    let user: { id: string; email: string; role: string; password: string; isVerified: boolean; firstName: string; lastName: string } | null = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: body.email },
        select: { id: true, email: true, role: true, password: true, isVerified: true, firstName: true, lastName: true },
      });
      steps.s3_findUser = user ? "OK — " + user.email + " / role=" + user.role : "NOT FOUND";
      if (!user) return NextResponse.json(steps);
    } catch (err) {
      steps.s3_findUser = "EXCEPTION: " + String(err);
      return NextResponse.json(steps);
    }

    // Step 4: bcrypt compare
    try {
      const bcrypt = await import("bcryptjs");
      const valid = await bcrypt.compare(body.password, user.password);
      steps.s4_bcrypt = valid ? "OK — password matches" : "WRONG PASSWORD";
      if (!valid) return NextResponse.json(steps);
    } catch (err) {
      steps.s4_bcrypt = "EXCEPTION: " + String(err);
      return NextResponse.json(steps);
    }

    // Step 5: isVerified
    steps.s5_isVerified = user.isVerified ? "OK" : "BLOCKED — not verified";
    if (!user.isVerified) return NextResponse.json(steps);

    // Step 6: signToken
    try {
      const { signToken } = await import("@/lib/jwt");
      const token = signToken({ userId: user.id, role: user.role as "CLIENT" | "ARTISAN" | "ADMIN", email: user.email });
      steps.s6_signToken = token ? "OK (len=" + token.length + ")" : "EMPTY TOKEN";
    } catch (err) {
      steps.s6_signToken = "EXCEPTION: " + String(err);
      return NextResponse.json(steps);
    }

    // Step 7: setAuthCookie
    try {
      const { setAuthCookie } = await import("@/lib/jwt");
      await setAuthCookie({ userId: user.id, role: user.role as "CLIENT" | "ARTISAN" | "ADMIN", email: user.email });
      steps.s7_setAuthCookie = "OK";
    } catch (err) {
      steps.s7_setAuthCookie = "EXCEPTION: " + String(err);
      return NextResponse.json(steps);
    }

    steps.conclusion = "ALL STEPS PASSED";
    return NextResponse.json(steps);
  } catch (err) {
    steps.uncaughtException = String(err);
    return NextResponse.json(steps, { status: 500 });
  }
}
