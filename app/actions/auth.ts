"use server";

/**
 * Server Actions — Authentification
 *
 * Les Server Actions sont le seul mécanisme Next.js App Router où
 * cookies().delete() et redirect() fonctionnent de façon garantie.
 * Contrairement aux Route Handlers (POST/GET), les Server Actions
 * émettent systématiquement le header Set-Cookie dans la réponse.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import { revokeSession } from "@/lib/session";

const COOKIE_NAME = "goservi_token";

/**
 * Déconnexion : révoque la session Redis (si dispo), supprime le cookie JWT,
 * et redirige vers /auth/login.
 */
export async function logoutAction(): Promise<never> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    const payload = verifyToken(token);
    if (payload?.jti) {
      try {
        await revokeSession(payload.jti, payload.exp);
      } catch {
        // Non-bloquant — la suppression du cookie suffit
      }
    }
  }

  // Dans une Server Action, cookies().delete() est garanti de fonctionner
  cookieStore.delete(COOKIE_NAME);

  redirect("/auth/login");
}
