import "server-only";
import { z } from "zod";

/**
 * AIEnhancementProvider: the ONLY surface the rest of the app depends on for
 * optional AI. A deterministic provider implements the same interface so the
 * full custom-plan flow works with no key, disabled flag, quota exhaustion,
 * timeout, provider rejection, or output-validation failure.
 *
 * Hard rules (R18):
 *  - Server-only. The key never reaches the browser.
 *  - AI NEVER selects prerequisites, orders the plan, changes completion, or
 *    grades competence. It only produces friendly text/analogy/feedback.
 *  - Prompts are built server-side from allowlisted structured fields; learner
 *    free text is treated as untrusted data.
 */

export const PROMPT_TEMPLATE_VERSION = "ai-2026-09-05.1";

/** The kinds of enhancement the app may request. */
export type EnhancementKind =
  | "plan-explanation"
  | "connect-skills"
  | "alt-analogy"
  | "explain-back-feedback";

// ---- Allowlisted, PII-free inputs for each kind -------------------------

export const planExplanationInputSchema = z.object({
  kind: z.literal("plan-explanation"),
  // Only skill-area ids + deterministic states; never names/notes.
  findings: z
    .array(
      z.object({
        skillArea: z.string().max(40),
        state: z.string().max(40),
      }),
    )
    .max(20),
  prerequisiteCount: z.number().int().min(0).max(50),
  revisionCount: z.number().int().min(0).max(50),
  estimatedHours: z.number().min(0).max(1000),
});

export const connectSkillsInputSchema = z.object({
  kind: z.literal("connect-skills"),
  knownSkillIds: z.array(z.string().max(40)).max(20),
  nextSkillIds: z.array(z.string().max(40)).max(20),
  lessonTitle: z.string().max(200),
});

export const altAnalogyInputSchema = z.object({
  kind: z.literal("alt-analogy"),
  lessonTitle: z.string().max(200),
  // A supplied excerpt from the canonical lesson (approved content, not PII).
  lessonExcerpt: z.string().max(4000),
});

export const explainBackFeedbackInputSchema = z.object({
  kind: z.literal("explain-back-feedback"),
  question: z.string().max(1000),
  referenceAnswer: z.string().max(2000),
  // The learner's own explanation: untrusted, delimited server-side.
  learnerAnswer: z.string().max(4000),
});

export const enhancementInputSchema = z.discriminatedUnion("kind", [
  planExplanationInputSchema,
  connectSkillsInputSchema,
  altAnalogyInputSchema,
  explainBackFeedbackInputSchema,
]);
export type EnhancementInput = z.infer<typeof enhancementInputSchema>;

// ---- Validated outputs --------------------------------------------------

export const enhancementOutputSchema = z.object({
  /** 1–4 short paragraphs of friendly, plain text. */
  text: z.string().min(1).max(4000),
  /** Optional short list of concrete suggestions/steps. */
  points: z.array(z.string().max(400)).max(6).default([]),
});
export type EnhancementOutput = z.infer<typeof enhancementOutputSchema>;

export type EnhancementOutcome = "ok" | "fallback" | "invalid" | "timeout" | "error";

export interface EnhancementResult {
  output: EnhancementOutput;
  /** True when this came from the deterministic fallback, not a live model. */
  fromFallback: boolean;
  outcome: EnhancementOutcome;
  /** The actual model that served the request (or "deterministic"). */
  model: string;
  /** Prompt template version used. */
  templateVersion: string;
  /** Provider request id when available. */
  requestId?: string;
  tokenUsage?: { prompt?: number; completion?: number; total?: number };
}

export interface AIEnhancementProvider {
  readonly id: "openrouter" | "deterministic";
  enhance(input: EnhancementInput): Promise<EnhancementResult>;
}
