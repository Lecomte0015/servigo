import { NextRequest } from "next/server";
import { verifyToken, type JwtPayload } from "@/lib/jwt";
import { apiForbidden, apiUnauthorized } from "@/lib/api-response";
import type { NextResponse } from "next/server";

const COOKIE_NAME = "goservi_token";

type Role = "CLIENT" | "ARTISAN" | "ADMIN";

export function getAuth(req: NextRequest): JwtPayload | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(
  req: NextRequest,
  allowedRoles?: Role[]
): { payload: JwtPayload } | { error: NextResponse } {
  const payload = getAuth(req);

  if (!payload) {
    return { error: apiUnauthorized() };
  }

  if (allowedRoles && !allowedRoles.includes(payload.role as Role)) {
    return { error: apiForbidden() };
  }

  return { payload };
}
