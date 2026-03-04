/**
 * ServiGo — Rate Limiter
 *
 * Strategy:
 *   - If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set  → Upstash Redis (multi-instance prod)
 *   - Otherwise                                                      → In-memory sliding window (dev / single instance)
 *
 * Usage:
 *   const result = await rateLimit("login:192.0.2.1", 5, 60_000);
 *   if (!result.success) return apiTooManyRequests();
 */

import { logger } from "@/lib/logger";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface RateLimitResult {
  success:   boolean;
  remaining: number;
  resetAt:   number; // epoch ms
}

// ─── In-memory fallback ────────────────────────────────────────────────────────

interface RateLimitEntry {
  count:   number;
  resetAt: number;
}

const _store = new Map<string, RateLimitEntry>();

// Purge expired entries every 5 min to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of _store.entries()) {
      if (entry.resetAt < now) _store.delete(key);
    }
  }, 5 * 60_000);
}

function rateLimitInMemory(key: string, max: number, windowMs: number): RateLimitResult {
  const now   = Date.now();
  const entry = _store.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    _store.set(key, { count: 1, resetAt });
    return { success: true, remaining: max - 1, resetAt };
  }

  if (entry.count >= max) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

// ─── Redis (Upstash) ───────────────────────────────────────────────────────────
//
// We lazy-import @upstash/redis and @upstash/ratelimit so the module stays
// tree-shakeable in environments that don't have the env vars.

let _redisRateLimit: ((key: string, max: number, windowMs: number) => Promise<RateLimitResult>) | null = null;
let _redisInitialized = false;

async function getRedisRateLimit() {
  if (_redisInitialized) return _redisRateLimit;
  _redisInitialized = true;

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    _redisRateLimit = null;
    return null;
  }

  try {
    const { Redis }     = await import("@upstash/redis");
    const { Ratelimit } = await import("@upstash/ratelimit");

    const redis = new Redis({ url, token });

    // We create a fresh Ratelimit instance per (max, windowMs) combo on each
    // call — Upstash caches the config internally so this is fine.
    _redisRateLimit = async (key: string, max: number, windowMs: number): Promise<RateLimitResult> => {
      const limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(max, `${Math.round(windowMs / 1000)} s`),
        analytics: false,
        prefix: "servigo_rl",
      });

      const { success, remaining, reset } = await limiter.limit(key);
      return { success, remaining, resetAt: reset };
    };

    logger.info("[rate-limit] Using Upstash Redis backend");
    return _redisRateLimit;
  } catch (err) {
    logger.warn({ err }, "[rate-limit] Upstash init failed — falling back to in-memory");
    _redisRateLimit = null;
    return null;
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Check and increment rate limit counter.
 *
 * @param key      - Unique key (e.g. "login:192.168.1.1")
 * @param max      - Max allowed requests per window
 * @param windowMs - Window duration in milliseconds
 */
export async function rateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    const redisLimit = await getRedisRateLimit();
    if (redisLimit) {
      return await redisLimit(key, max, windowMs);
    }
  } catch (err) {
    // Redis error → graceful degradation to in-memory
    logger.warn({ err }, "[rate-limit] Redis error — falling back to in-memory");
  }

  return rateLimitInMemory(key, max, windowMs);
}

/**
 * Extract the real client IP from Next.js request headers.
 * Handles proxies (Vercel, nginx) via X-Forwarded-For.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
