/**
 * AES-256-GCM symmetric encryption for sensitive data (e.g. IBAN)
 *
 * Stored format: iv_hex:authTag_hex:ciphertext_hex
 *
 * - 96-bit random IV per encryption (GCM best practice)
 * - 128-bit authentication tag (GCM default)
 * - Key loaded from ENCRYPTION_KEY env var (64 hex chars = 32 bytes)
 *
 * Backward compatibility: if the value does not match the encrypted format
 * (i.e. no colons), it is returned as-is (plain text legacy values).
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // bytes — 96 bits recommended for GCM

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY env var is missing or invalid. " +
        "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(hex, "hex");
}

/** Returns true if the value looks like our encrypted format iv:tag:ciphertext */
function isEncrypted(value: string): boolean {
  const parts = value.split(":");
  return parts.length === 3 && parts.every((p) => /^[0-9a-f]+$/i.test(p));
}

/**
 * Encrypt a plaintext string.
 * @returns Encrypted string in format "iv_hex:authTag_hex:ciphertext_hex"
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag(); // 16 bytes by default

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypt an encrypted string.
 * If the value is not in the expected encrypted format (backward compat),
 * it is returned as-is.
 *
 * @throws Error if decryption fails (wrong key, tampered data)
 */
export function decrypt(ciphertext: string): string {
  // Backward compatibility: plain text values (e.g. IBANs stored before encryption)
  if (!isEncrypted(ciphertext)) return ciphertext;

  const key = getKey();
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
}
