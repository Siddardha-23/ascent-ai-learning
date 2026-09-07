"use client";

import type { EnhancementInput, EnhancementOutput } from "./provider";

/**
 * Client helper to call the AI enhance endpoint. Only used after the learner
 * has given consent (enforced again server-side). Never handles the key.
 */

export interface EnhanceResponse {
  output: EnhancementOutput;
  fromFallback: boolean;
  outcome: string;
  model: string;
  remaining?: number;
  budgetExhausted?: boolean;
}

export async function requestEnhancement(
  profileId: string,
  input: EnhancementInput,
): Promise<EnhanceResponse | null> {
  try {
    const res = await fetch(`/api/ai/enhance?profile=${encodeURIComponent(profileId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consent: true, input }),
    });
    if (!res.ok) return null;
    return (await res.json()) as EnhanceResponse;
  } catch {
    return null;
  }
}

export interface AIStatusResponse {
  status: "disabled" | "configured" | "active" | "unavailable";
  model: string | null;
}

export async function fetchAIStatus(): Promise<AIStatusResponse | null> {
  try {
    const res = await fetch("/api/ai/status", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as AIStatusResponse;
  } catch {
    return null;
  }
}
