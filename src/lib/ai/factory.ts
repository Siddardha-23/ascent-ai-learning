import "server-only";
import type { AIEnhancementProvider } from "./provider";
import { DeterministicProvider } from "./deterministic";
import { OpenRouterProvider } from "./openrouter";
import { aiConfig } from "./config";

/**
 * Select the AI provider. OpenRouter only when the feature is explicitly
 * enabled AND a key is present; otherwise the deterministic provider, so the
 * app behaves identically (minus AI flavor) with no configuration.
 */
export function getAIProvider(): AIEnhancementProvider {
  const cfg = aiConfig();
  if (cfg.enabled && cfg.apiKey) return new OpenRouterProvider();
  return new DeterministicProvider();
}
