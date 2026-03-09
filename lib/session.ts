/**
 * GoServi — Session Revocation + User Block
 *
 * Stocke les JTI révoqués dans Upstash Redis avec TTL = durée restante du JWT.
 * Stocke aussi les userId bloqués (sans TTL) pour vérification dans le proxy (Edge).
 * Fallback no-op si Redis non configuré.
 *
 * Clés Redis :
 *   `session:revoked:{jti}`  → "1"  (auto-expire = remaining JWT lifetime)
 *   `user:blocked:{userId}`  → "1"  (permanent, supprimé au déblocage)
 */

import { sessionLogger } from "@/lib/logger";

const BLACKLIST_PREFIX  = "session:revoked:";
const BLOCKED_PREFIX    = "user:blocked:";
const DEFAULT_TTL_SEC  = 7 * 24 * 3600; // 7 jours (durée max d'un JWT GoServi)

// ─── Lazy Redis client ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _redis: any           = null;
let _redisInitialized     = false;

async function getRedis() {
  if (_redisInitialized) return _redis;
  _redisInitialized = true;

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  try {
    const { Redis } = await import("@upstash/redis");
    _redis = new Redis({ url, token });
    return _redis;
  } catch (err) {
    sessionLogger.warn({ err }, "Redis init failed — session revocation unavailable");
    return null;
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Révoque une session en ajoutant son JTI à la liste noire Redis.
 * Le TTL est calculé pour que l'entrée expire en même temps que le JWT.
 *
 * Non-bloquant en cas d'erreur Redis (la déconnexion via cookie reste effective).
 *
 * @param jti - JWT unique ID (champ `jti` du payload)
 * @param exp - Expiration du JWT en secondes epoch (champ `exp` du payload)
 */
export async function revokeSession(jti: string, exp?: number): Promise<void> {
  const redis = await getRedis();
  if (!redis) return; // Sans Redis, la révocation est assurée par le vidage du cookie

  const nowSec = Math.floor(Date.now() / 1000);
  const ttl    = exp && exp > nowSec ? exp - nowSec : DEFAULT_TTL_SEC;

  try {
    await redis.set(`${BLACKLIST_PREFIX}${jti}`, "1", { ex: ttl });
  } catch (err) {
    // Non-bloquant : l'entrée ne sera pas dans la liste noire, mais le cookie est effacé
    sessionLogger.warn({ err }, "revokeSession failed");
  }
}

/**
 * Vérifie si une session est révoquée.
 * Retourne `false` si Redis est indisponible (fail-open pour la disponibilité).
 *
 * @param jti - JWT unique ID à vérifier
 */
export async function isSessionRevoked(jti: string): Promise<boolean> {
  const redis = await getRedis();
  if (!redis) return false;

  try {
    const val = await redis.get(`${BLACKLIST_PREFIX}${jti}`);
    return val !== null;
  } catch {
    // Erreur Redis → fail-open (préférer la disponibilité à la sécurité parfaite)
    return false;
  }
}

// ─── Blocage utilisateur (Edge-compatible via Redis) ────────────────────────

/**
 * Marque un utilisateur comme bloqué dans Redis.
 * Appelé par les endpoints admin PATCH block.
 * Sans TTL : permanent jusqu'au déblocage explicite.
 */
export async function blockUser(userId: string): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;
  try {
    await redis.set(`${BLOCKED_PREFIX}${userId}`, "1");
  } catch (err) {
    sessionLogger.warn({ err }, "blockUser Redis failed");
  }
}

/**
 * Retire un utilisateur de la liste bloquée dans Redis.
 * Appelé par les endpoints admin PATCH unblock.
 */
export async function unblockUser(userId: string): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;
  try {
    await redis.del(`${BLOCKED_PREFIX}${userId}`);
  } catch (err) {
    sessionLogger.warn({ err }, "unblockUser Redis failed");
  }
}

/**
 * Vérifie si un utilisateur est bloqué (via Redis).
 * Utilisé dans proxy.ts (Edge runtime — pas de Prisma possible).
 * Retourne `false` si Redis est indisponible (fail-open).
 */
export async function isUserBlocked(userId: string): Promise<boolean> {
  const redis = await getRedis();
  if (!redis) return false;
  try {
    const val = await redis.get(`${BLOCKED_PREFIX}${userId}`);
    return val !== null;
  } catch {
    return false;
  }
}
