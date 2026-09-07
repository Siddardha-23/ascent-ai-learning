import { NextResponse } from "next/server";
import { isValidProfileId } from "@/lib/progress/schema";
import { getAIProvider } from "@/lib/ai/factory";
import { aiConfig } from "@/lib/ai/config";
import { enhancementInputSchema } from "@/lib/ai/provider";
import { allowCall, remainingCalls, cacheKey } from "@/lib/ai/rate-limit";
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

  // Per-profile daily budget. Exhausted -> honest deterministic fallback (200).
  if (!allowCall(profile, cfg.maxCallsPerProfilePerDay)) {
    const { DeterministicProvider } = await import("@/lib/ai/deterministic");
    const result = await new DeterministicProvider().enhance(parsed.data);
    return noStore({
      ...result,
      budgetExhausted: true,
      remaining: 0,
      cacheMeta: buildCacheMeta(parsed.data.kind, result.model, result.templateVersion, result.outcome),
    });
  }

  const provider = getAIProvider();
  const result = await provider.enhance(parsed.data);

  return noStore({
    output: result.output,
    fromFallback: result.fromFallback,
    outcome: result.outcome,
    model: result.model,
    templateVersion: result.templateVersion,
    requestId: result.requestId,
    tokenUsage: result.tokenUsage,
    remaining: remainingCalls(profile, cfg.maxCallsPerProfilePerDay),
    cacheMeta: buildCacheMeta(parsed.data.kind, result.model, result.templateVersion, result.outcome),
  });
}

/** Build cache metadata (no raw learner text). Client may store this in ai.cache. */
function buildCacheMeta(
  kind: string,
  model: string,
  templateVersion: string,
  outcome: string,
) {
  const key = cacheKey({
    templateVersion,
    modelStrategy: model,
    contentVersion: CONTENT_VERSION,
    // Only the kind is used as the sanitized input marker here; the route never
    // hashes raw learner text into anything returned to the client.
    sanitizedInput: kind,
  });
  return {
    key,
    templateVersion,
    model,
    createdAt: new Date().toISOString(),
    outcome,
  };
}
