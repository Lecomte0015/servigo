import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "servigo_token";

export interface JwtPayload {
  userId: string;
  role:   "CLIENT" | "ARTISAN" | "ADMIN";
  email:  string;
  jti:    string;  // JWT unique ID — utilisé pour la révocation de session
  exp?:   number;  // Standard JWT expiration (secondes epoch)
}

/**
 * Signe un nouveau JWT.
 * Le `jti` est toujours généré automatiquement (UUID v4).
 * Le `exp` est géré par `expiresIn: "7d"`.
 */
export function signToken(payload: Omit<JwtPayload, "jti" | "exp">): string {
  return jwt.sign(
    { ...payload, jti: randomUUID() },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(payload: Omit<JwtPayload, "jti" | "exp">): Promise<void> {
  const token = signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 7, // 7 jours
    path:     "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getTokenFromCookies(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Retourne le token JWT brut depuis le cookie (nécessaire pour la révocation).
 */
export async function getRawTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}
