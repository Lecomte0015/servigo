import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import { z } from "zod";
import { registerClientSchema, registerArtisanSchema } from "@/lib/validations";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendVerificationEmail, sendWelcomeArtisanEmail } from "@/lib/email";
import { authLogger } from "@/lib/logger";

function generateVerificationToken(): { token: string; expiry: Date } {
  const token = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  return { token, expiry };
}

export async function POST(req: NextRequest) {
  // ── Rate limiting: 3 registrations per IP per hour ───────────────────────
  const ip = getClientIp(req);
  const rl = await rateLimit(`register:${ip}`, 3, 60 * 60 * 1000);
  if (!rl.success) {
    return apiError("Trop de tentatives d'inscription. Réessayez dans 1 heure.", 429);
  }

  try {
    const body = await req.json();
    const { role = "CLIENT" } = body;

    const schema = role === "ARTISAN" ? registerArtisanSchema : registerClientSchema;
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    const data = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return apiError("Un compte existe déjà avec cet email", 409);

    const hashedPassword = await hashPassword(data.password);
    const { token, expiry } = generateVerificationToken();

    if (role === "ARTISAN") {
      const artisanData = data as z.infer<typeof registerArtisanSchema>;

      const user = await prisma.user.create({
        data: {
          role: "ARTISAN",
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: hashedPassword,
          phone: data.phone,
          verificationToken: token,
          verificationTokenExpiry: expiry,
          artisanProfile: {
            create: {
              companyName: artisanData.companyName,
              rcNumber: artisanData.rcNumber,
              city: artisanData.city,
              description: artisanData.description,
            },
          },
        },
      });

      // Send verification email (non-blocking)
      sendVerificationEmail(user.email, user.firstName, token).catch((err) => authLogger.error({ err }, "Email send failed"));
      // Also send welcome artisan info (non-blocking)
      sendWelcomeArtisanEmail(user.email, user.firstName).catch((err) => authLogger.error({ err }, "Email send failed"));

      return apiSuccess(
        { needsVerification: true, email: user.email, role: "ARTISAN" },
        201
      );
    }

    // CLIENT
    const user = await prisma.user.create({
      data: {
        role: "CLIENT",
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        verificationToken: token,
        verificationTokenExpiry: expiry,
      },
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(user.email, user.firstName, token).catch((err) => authLogger.error({ err }, "Email send failed"));

    return apiSuccess(
      { needsVerification: true, email: user.email, role: "CLIENT" },
      201
    );
  } catch (err) {
    authLogger.error({ err }, "Register error");
    return apiServerError();
  }
}
