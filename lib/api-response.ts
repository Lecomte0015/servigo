import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status });
}

export function apiUnauthorized(message = "Non autorisé") {
  return apiError(message, 401);
}

export function apiForbidden(message = "Accès refusé") {
  return apiError(message, 403);
}

export function apiNotFound(message = "Ressource introuvable") {
  return apiError(message, 404);
}

export function apiServerError(message = "Erreur serveur") {
  return apiError(message, 500);
}
