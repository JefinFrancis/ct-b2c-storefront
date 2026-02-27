/**
 * redis.ts — Environment-aware Redis client for the web app.
 * Uses ioredis for local development and Upstash for production.
 * Server-side only — never import in Client Components.
 *
 * Used for: cart ID per session, ISR invalidation flags.
 */
import { Redis as Upstash } from "@upstash/redis";

// We only use Upstash in the web app (for simplicity)
// Local dev with docker-compose doesn't need Redis on the web side
// Cart session is managed via API calls

let redisClient: Upstash | null = null;

export function getRedis(): Upstash | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Redis not configured - this is fine for local dev
    return null;
  }

  if (!redisClient) {
    redisClient = new Upstash({ url, token });
  }

  return redisClient;
}

export const CART_KEY = (sessionId: string) => `cart:${sessionId}`;
export const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

/**
 * Get cart ID from Redis session store
 */
export async function getCartId(sessionId: string): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  return redis.get<string>(CART_KEY(sessionId));
}

/**
 * Store cart ID in Redis session store
 */
export async function setCartId(
  sessionId: string,
  cartId: string,
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(CART_KEY(sessionId), cartId, { ex: SESSION_TTL });
}
