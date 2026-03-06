/**
 * GoServi — TOTP (Time-based One-Time Password) helper
 *
 * Utilise otplib (RFC 6238 / Google Authenticator compatible).
 * Le secret est chiffré AES-256-GCM avant stockage en DB.
 *
 * Flux setup :
 *   1. generateTotpSecret()       → secret base32
 *   2. getTotpUri(secret, email)  → otpauth:// URI pour QR code
 *   3. Admin scanne le QR + saisit le code
 *   4. verifyTotpCode(code, secret) → boolean
 *   5. Si valide → encryptTotpSecret(secret) → stocker en DB
 *
 * Flux login :
 *   1. decryptTotpSecret(user.totpSecret) → secret
 *   2. verifyTotpCode(code, secret) → boolean
 */

import { generateSecret, generateURI, verifySync } from "otplib";
import { encrypt, decrypt } from "@/lib/encryption";

// ─── Génération ────────────────────────────────────────────────────────────────

/**
 * Génère un nouveau secret TOTP (base32, 20 octets = 160 bits).
 * À stocker chiffré dans DB après vérification du premier code.
 */
export function generateTotpSecret(): string {
  return generateSecret({ length: 20 });
}

/**
 * Construit l'URI otpauth:// pour générer le QR code.
 * Compatible Google Authenticator, Authy, 1Password, etc.
 */
export function getTotpUri(secret: string, adminEmail: string): string {
  return generateURI({
    issuer: "GoServi Admin",
    label:  adminEmail,
    secret,
  });
}

// ─── Vérification ──────────────────────────────────────────────────────────────

/**
 * Vérifie un code TOTP à 6 chiffres contre le secret.
 * Retourne true si le code est valide dans la fenêtre de tolérance (±30s).
 *
 * @param code   - Code à 6 chiffres saisi par l'admin
 * @param secret - Secret TOTP en clair (base32), PAS chiffré
 */
export function verifyTotpCode(code: string, secret: string): boolean {
  try {
    const result = verifySync({
      token:          code.replace(/\s/g, ""),
      secret,
      epochTolerance: 30, // ±30 secondes (±1 période) pour compenser le décalage d'horloge
    });
    return result.valid;
  } catch {
    return false;
  }
}

// ─── Chiffrement ───────────────────────────────────────────────────────────────

/**
 * Chiffre un secret TOTP pour stockage sécurisé en DB (AES-256-GCM).
 */
export function encryptTotpSecret(secret: string): string {
  return encrypt(secret);
}

/**
 * Déchiffre un secret TOTP stocké en DB.
 */
export function decryptTotpSecret(encrypted: string): string {
  return decrypt(encrypted);
}

// ─── Pending-2FA JWT ──────────────────────────────────────────────────────────
//
// Après mot de passe valide mais avant vérification TOTP, on émet
// un token court (5 min) qui ne donne PAS accès au back-office.
// Payload: { sub: userId, purpose: "2fa_pending" }

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const PENDING_PURPOSE = "2fa_pending" as const;

export interface Pending2FAPayload {
  sub:     string; // userId
  purpose: typeof PENDING_PURPOSE;
}

/** Génère un token "en attente de 2FA" (expire dans 5 min). */
export function signPending2FAToken(userId: string): string {
  return jwt.sign({ sub: userId, purpose: PENDING_PURPOSE }, JWT_SECRET, {
    expiresIn: "5m",
  });
}

/**
 * Vérifie et décode un token "en attente de 2FA".
 * Retourne null si invalide, expiré ou mauvais purpose.
 */
export function verifyPending2FAToken(token: string): Pending2FAPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as Pending2FAPayload;
    if (payload.purpose !== PENDING_PURPOSE) return null;
    return payload;
  } catch {
    return null;
  }
}
