import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { isValidProfileId } from "@/lib/progress/schema";
import { getAIProvider } from "@/lib/ai/factory";
import { aiConfig } from "@/lib/ai/config";
import {
  enhancementInputSchema,
  type EnhancementInput,
} from "@/lib/ai/provider";
import {
  allowCall,
  remainingCalls,
  cacheKey,
  getCached,
  setCached,
  dedupe,
  type CachedEnhancement,
} from "@/lib/ai/rate-limit";
import { CONTENT_VERSION } from "@/lib/content/content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function noStore(json: unknown, init?: ResponseInit) {
  const res = NextResponse.json(json, init);
  res.headers.set("Cache-Control", "private, no-store, max-age=0");
  return res;
}

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * POST /api/ai/enhance?profile=<id>
 * Body: { consent: true, input: EnhancementInput }
 *
 * Consent-gated, same-origin, rate-limited, bounded. Returns a validated
 * enhancement (or an honest deterministic fallback). Never returns the key or
 * raw provider errors.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) {
    return noStore({ error: "bad_origin" }, { status: 403 });
  }

  const url = new URL(req.url);
  const profile = url.searchParams.get("profile");
  if (!profile || !isValidProfileId(profile)) {
    return noStore({ error: "unknown_profile" }, { status: 400 });
  }

  const cfg = aiConfig();
  const maxInput = cfg.maxInputChars;

  const raw = await req.text();
  if (raw.length > maxInput) {
    return noStore({ error: "payload_too_large" }, { status: 413 });
  }

  let body: { consent?: unknown; input?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return noStore({ error: "invalid_json" }, { status: 400 });
  }

  // Consent is required for any AI call.
  if (body.consent !== true) {
    return noStore({ error: "consent_required" }, { status: 403 });
  }

  const parsed = enhancementInputSchema.safeParse(body.input);
  if (!parsed.success) {
    return noStore(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "schema error" },
      { status: 400 },
    );
  }
  const input = parsed.data;

  // Cache key from the ACTUAL validated input (server-side only; never in a
  // response or log). The salted hash means raw text is not stored in the key.
  const modelStrategy = cfg.model ?? "openrouter/free";
  const key = cacheKey({
    templateVersion: "ai-2026-09-05.1",
    modelStrategy,
    contentVersion: CONTENT_VERSION,
    sanitizedInput: canonicalInput(input),
  });

  // 1) Serve from cache without consuming the daily budget or calling out.
  const cached = getCached(key);
  if (cached) {
    return noStore({
      output: cached.output,
      fromFallback: false,
      outcome: "ok",
      model: cached.model,
      templateVersion: cached.templateVersion,
      cachedHit: true,
      remaining: remainingCalls(profile, cfg.maxCallsPerProfilePerDay),
      cacheMeta: { key, templateVersion: cached.templateVersion, model: cached.model, createdAt: new Date().toISOString(), outcome: "ok" },
    });
  }

  // 2) Per-profile daily budget. Exhausted -> honest deterministic fallback.
  if (!allowCall(profile, cfg.maxCallsPerProfilePerDay)) {
    const { DeterministicProvider } = await import("@/lib/ai/deterministic");
    const result = await new DeterministicProvider().enhance(input);
    return noStore({
      output: result.output,
      fromFallback: true,
      outcome: result.outcome,
      model: result.model,
      templateVersion: result.templateVersion,
      budgetExhausted: true,
      remaining: 0,
      cacheMeta: { key, templateVersion: result.templateVersion, model: result.model, createdAt: new Date().toISOString(), outcome: result.outcome },
    });
  }

  // 3) Dedupe concurrent identical requests, then call the provider once.
  const provider = getAIProvider();
  let outcome = "ok";
  let fromFallback = false;
  const { value, deduped } = await dedupe(key, async () => {
    const r = await provider.enhance(input);
    outcome = r.outcome;
    fromFallback = r.fromFallback;
    const v: CachedEnhancement = {
      output: r.output,
      model: r.model,
      templateVersion: r.templateVersion,
    };
    // Only cache genuine successes (never a fallback/error) so a later retry
    // can still reach the provider.
    if (r.outcome === "ok" && !r.fromFallback) setCached(key, v);
    return v;
  });

  return noStore({
    output: value.output,
    fromFallback,
    outcome,
    model: value.model,
    templateVersion: value.templateVersion,
    deduped,
    remaining: remainingCalls(profile, cfg.maxCallsPerProfilePerDay),
    cacheMeta: { key, templateVersion: value.templateVersion, model: value.model, createdAt: new Date().toISOString(), outcome },
  });
}

/**
 * Deterministic, PII-safe canonical serialization of the validated input for
 * hashing into a cache key. This value is only ever fed into a salted SHA-256
 * hash (see cacheKey); it is never returned to the client or logged.
 */
function canonicalInput(input: EnhancementInput): string {
  const stable = JSON.stringify(input, Object.keys(input).sort());
  return createHash("sha256").update(stable).digest("hex");
}
