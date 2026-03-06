import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/hash";
import { setAuthCookie } from "@/lib/jwt";
import { loginSchema } from "@/lib/validations";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { signPending2FAToken } from "@/lib/totp";
import { authLogger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting: 5 attempts per IP per 15 minutes ────────────────────
    const ip = getClientIp(req);
    const rl = await rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
    if (!rl.success) {
      return apiError("Trop de tentatives de connexion. Réessayez dans 15 minutes.", 429);
    }

    // ── Parse body (req.text() + JSON.parse pour exposer le body brut en cas d'erreur) ──
    const rawText = await req.text();
    let body: unknown;
    try {
      body = JSON.parse(rawText);
    } catch (parseErr) {
      authLogger.error({ parseErr, rawText }, "Login body JSON parse failed");
      return apiServerError(`JSON parse error: ${String(parseErr)} | rawBody[:200]="${rawText.slice(0, 200)}"`);
    }

    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { artisanProfile: true },
    });

    if (!user) {
      return apiError("Email ou mot de passe incorrect", 401);
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return apiError("Email ou mot de passe incorrect", 401);
    }

    if (!user.isVerified) {
      return apiError(
        "Veuillez vérifier votre adresse email avant de vous connecter.",
        403,
        { needsVerification: true, email: user.email }
      );
    }

    // ── 2FA admin : si activée → retourner un pending token (pas de cookie) ──
    if (user.role === "ADMIN" && user.totpEnabled) {
      const pendingToken = signPending2FAToken(user.id);
      return apiSuccess({ requires2FA: true, pendingToken });
    }

    // Connexion normale
    await setAuthCookie({ userId: user.id, role: user.role, email: user.email });

    return apiSuccess({
      id:         user.id,
      email:      user.email,
      role:       user.role,
      firstName:  user.firstName,
      lastName:   user.lastName,
      isApproved: user.artisanProfile?.isApproved ?? null,
    });
  } catch (err) {
    // TEMP DEBUG — remove after diagnosis
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack?.slice(0, 500) : undefined;
    authLogger.error({ err }, "Login error");
    return apiServerError(msg + " ||| " + stack);
  }
}
