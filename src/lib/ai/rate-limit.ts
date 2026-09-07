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
