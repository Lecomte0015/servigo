/**
 * GET /auth/logout
 *
 * Route serveur qui gère la déconnexion de façon atomique :
 * 1. Révoque la session JWT dans Redis (blacklist)
 * 2. Supprime le cookie dans les headers de la RÉPONSE de redirection
 * 3. Redirige vers /auth/login
 *
 * Avantage vs POST /api/auth/logout + client redirect :
 * - Le cookie est effacé dans la même réponse HTTP que la redirection
 * - Le navigateur suit le 302, la prochaine requête arrive SANS le cookie
 * - Aucun risque de race condition ou de middleware Next.js qui annule le Set-Cookie
 */
import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { revokeSession } from "@/lib/session";

const COOKIE_NAME = "goservi_token";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (token) {
    const payload = verifyToken(token);
    if (payload?.jti) {
      try {
        await revokeSession(payload.jti, payload.exp);
      } catch {
        // ignore — le cookie sera effacé dans tous les cas
      }
    }
  }

  // Redirection + suppression cookie dans une seule réponse HTTP
  const response = NextResponse.redirect(new URL("/auth/login", req.url));

  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
    expires: new Date(0),
  });

  return response;
}
