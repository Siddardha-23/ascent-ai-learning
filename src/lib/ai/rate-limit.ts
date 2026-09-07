import "server-only";
import { createHash } from "node:crypto";

/**
 * Minimal in-memory per-profile daily rate limiter for the AI endpoint. This
 * is a soft guard for a low-volume personal app; it resets on server restart
 * and is not a distributed limiter. The learner's own stored ai.cache also
 * bounds usage. Never logs raw learner text.
 */

interface Bucket {
  day: string; // YYYY-MM-DD (UTC)
  count: number;
}

const buckets = new Map<string, Bucket>();

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns true if the call is allowed and increments the counter. */
export function allowCall(profileId: string, maxPerDay: number): boolean {
  const day = today();
  const existing = buckets.get(profileId);
  if (!existing || existing.day !== day) {
    buckets.set(profileId, { day, count: 1 });
    return 1 <= maxPerDay;
  }
  if (existing.count >= maxPerDay) return false;
  existing.count += 1;
  return true;
}

export function remainingCalls(profileId: string, maxPerDay: number): number {
  const b = buckets.get(profileId);
  if (!b || b.day !== today()) return maxPerDay;
  return Math.max(0, maxPerDay - b.count);
}

/**
 * Salted hash for cache keys / logs. Combines a server salt with the parts so
 * raw learner text is never stored in a key. Uses OPENROUTER_APP_NAME + a
 * process-stable salt; good enough to avoid storing plaintext, not a security
 * boundary.
 */
const SALT = process.env.AI_CACHE_SALT || "ascent-ai-cache-v1";

export function cacheKey(parts: {
  templateVersion: string;
  modelStrategy: string;
  contentVersion: string;
  sanitizedInput: string;
}): string {
  const h = createHash("sha256");
  h.update(SALT);
  h.update("|");
  h.update(parts.templateVersion);
  h.update("|");
  h.update(parts.modelStrategy);
  h.update("|");
  h.update(parts.contentVersion);
  h.update("|");
  h.update(parts.sanitizedInput);
  return h.digest("hex").slice(0, 32);
}

/**
 * Server-side response cache + in-flight request deduplication for AI
 * enhancements. Bounded and in-memory (a soft optimization for a low-volume
 * personal app; resets on restart). The cache key is the salted hash above, so
 * NO raw learner text is stored in keys. Cached values contain only the
 * already-returned (validated, non-PII) enhancement output.
 */
export interface CachedEnhancement {
  output: { text: string; points: string[] };
  model: string;
  templateVersion: string;
}

const MAX_CACHE_ENTRIES = 500;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
  value: CachedEnhancement;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<CachedEnhancement>>();

export function getCached(key: string): CachedEnhancement | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  // LRU-ish: refresh recency.
  responseCache.delete(key);
  responseCache.set(key, entry);
  return entry.value;
}

export function setCached(key: string, value: CachedEnhancement): void {
  responseCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  // Evict oldest when over capacity.
  while (responseCache.size > MAX_CACHE_ENTRIES) {
    const oldest = responseCache.keys().next().value;
    if (oldest === undefined) break;
    responseCache.delete(oldest);
  }
}

/**
 * Deduplicate concurrent identical requests: if a call with the same key is
 * already in flight, await it instead of issuing a second provider call.
 * Returns { value, deduped }.
 */
export async function dedupe(
  key: string,
  producer: () => Promise<CachedEnhancement>,
): Promise<{ value: CachedEnhancement; deduped: boolean }> {
  const existing = inFlight.get(key);
  if (existing) {
    return { value: await existing, deduped: true };
  }
  const p = producer();
  inFlight.set(key, p);
  try {
    const value = await p;
    return { value, deduped: false };
  } finally {
    inFlight.delete(key);
  }
}

/** Test-only: clear caches between cases. */
export function __resetAiCaches(): void {
  responseCache.clear();
  inFlight.clear();
  buckets.clear();
}
