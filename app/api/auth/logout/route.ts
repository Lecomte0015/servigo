import { clearAuthCookie, getRawTokenFromCookies, verifyToken } from "@/lib/jwt";
import { revokeSession } from "@/lib/session";
import { apiSuccess } from "@/lib/api-response";

export async function POST() {
  // Révoquer la session active (blacklist Redis) avant de vider le cookie
  const rawToken = await getRawTokenFromCookies();
  if (rawToken) {
    const payload = verifyToken(rawToken);
    if (payload?.jti) {
      // Non-bloquant : si Redis échoue, le cookie est quand même effacé
      await revokeSession(payload.jti, payload.exp);
    }
  }

  await clearAuthCookie();
  return apiSuccess({ message: "Déconnexion réussie" });
}
