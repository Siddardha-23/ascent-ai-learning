import "server-only";

/**
 * Server-only AI configuration derived from environment variables. The key is
 * read here and never exported to the client. Bounded operational controls
 * come from env with safe defaults.
 */

export interface AIConfig {
  enabled: boolean;
  apiKey: string | undefined;
  model: string | undefined; // undefined => OpenRouter free routing
  siteUrl: string | undefined;
  appName: string;
  timeoutMs: number;
  maxCallsPerProfilePerDay: number;
  maxInputChars: number;
  maxOutputTokens: number;
}

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function aiConfig(): AIConfig {
  return {
    enabled: process.env.AI_PERSONALIZATION_ENABLED === "true",
    apiKey: process.env.OPENROUTER_API_KEY || undefined,
    model: process.env.OPENROUTER_MODEL || undefined,
    siteUrl: process.env.OPENROUTER_SITE_URL || undefined,
    appName: process.env.OPENROUTER_APP_NAME || "Ascent",
    timeoutMs: intEnv("AI_TIMEOUT_MS", 12_000),
    maxCallsPerProfilePerDay: intEnv("AI_MAX_CALLS_PER_PROFILE_PER_DAY", 5),
    maxInputChars: intEnv("AI_MAX_INPUT_CHARS", 12_000),
    maxOutputTokens: intEnv("AI_MAX_OUTPUT_TOKENS", 900),
  };
}

export type AIStatus = "disabled" | "configured" | "active" | "unavailable";

/** High-level status for the UI (never reveals the key). */
export function aiStatus(): { status: AIStatus; model: string | null } {
  const cfg = aiConfig();
  if (!cfg.enabled) return { status: "disabled", model: null };
  if (!cfg.apiKey) return { status: "unavailable", model: null };
  return { status: "configured", model: cfg.model ?? "openrouter/free (varies)" };
}
