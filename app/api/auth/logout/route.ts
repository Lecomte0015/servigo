import { NextResponse } from "next/server";
import { getRawTokenFromCookies, verifyToken } from "@/lib/jwt";
import { revokeSession } from "@/lib/session";

const COOKIE_NAME = "goservi_token";

export async function POST() {
  // Révoquer la session active (blacklist Redis) avant de vider le cookie
  const rawToken = await getRawTokenFromCookies();
  if (rawToken) {
    const payload = verifyToken(rawToken);
    if (payload?.jti) {
      try {
        await revokeSession(payload.jti, payload.exp);
      } catch {
        // ignore — le cookie sera effacé dans tous les cas
      }
    }
  }

  // Supprimer le cookie directement sur la réponse (méthode fiable sur Vercel)
  // cookies().delete() n'émet pas toujours le header Set-Cookie en Route Handler
  const response = NextResponse.json({
    success: true,
    data: { message: "Déconnexion réussie" },
  });

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
