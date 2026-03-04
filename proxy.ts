import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { isSessionRevoked } from "@/lib/session";

const COOKIE_NAME = "servigo_token";

// Route access rules
const PROTECTED_ROUTES: Record<string, string[]> = {
  "/dashboard": ["CLIENT", "ADMIN"],
  "/pro": ["ARTISAN", "ADMIN"],
  "/admin": ["ADMIN"],
};

// Public-only pages: redirect authenticated users to their home
const FRONT_PUBLIC_ONLY = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"];
const ADMIN_LOGIN = "/admin/login";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  let payload = token ? verifyToken(token) : null;

  // Vérification de révocation : si le token a un jti, on vérifie la blacklist Redis
  // Fail-open : si Redis est indisponible, on laisse passer (disponibilité > sécurité parfaite)
  if (payload?.jti) {
    const revoked = await isSessionRevoked(payload.jti);
    if (revoked) payload = null;
  }

  // Admin login page: already-logged-in ADMIN → /admin, others → allow
  if (pathname.startsWith(ADMIN_LOGIN)) {
    if (payload?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // Front-office auth pages: redirect authenticated users to their home
  if (FRONT_PUBLIC_ONLY.some((r) => pathname.startsWith(r))) {
    if (payload) {
      return NextResponse.redirect(new URL(getHomeForRole(payload.role), req.url));
    }
    return NextResponse.next();
  }

  // Check protected routes
  for (const [route, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      if (!payload) {
        // Admin routes → admin login, others → front-office login
        const loginUrl = route === "/admin"
          ? new URL(ADMIN_LOGIN, req.url)
          : new URL("/auth/login", req.url);
        if (route !== "/admin") loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (!allowedRoles.includes(payload.role)) {
        return NextResponse.redirect(new URL(getHomeForRole(payload.role), req.url));
      }

      break;
    }
  }

  // API route protection
  if (pathname.startsWith("/api/") && !isPublicApiRoute(pathname)) {
    if (!payload) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    // Role check for API routes
    if (pathname.startsWith("/api/admin") && payload.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }
    if (pathname.startsWith("/api/client") && payload.role !== "CLIENT" && payload.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }
    if (pathname.startsWith("/api/artisan") && payload.role !== "ARTISAN" && payload.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

function isPublicApiRoute(pathname: string): boolean {
  const publicRoutes = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/logout",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/verify-email",
    "/api/auth/resend-verification",
    "/api/admin/2fa/verify-login",  // 2FA login step 2 (uses pendingToken, pas de cookie)
    "/api/webhooks",
    "/api/categories",
    "/api/artisans",   // liste publique + profils publics artisans
  ];
  return publicRoutes.some((r) => pathname.startsWith(r));
}

function getHomeForRole(role: string): string {
  switch (role) {
    case "ARTISAN":
      return "/pro/dashboard";
    case "ADMIN":
      return "/admin";
    default:
      return "/dashboard";
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pro/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/api/:path*",
  ],
};
