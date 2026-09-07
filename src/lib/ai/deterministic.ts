import "server-only";
import {
  PROMPT_TEMPLATE_VERSION,
  type AIEnhancementProvider,
  type EnhancementInput,
  type EnhancementResult,
  type EnhancementOutput,
} from "./provider";

/**
 * Deterministic fallback provider. Produces honest, authored text with no
 * network call. Used whenever AI is disabled/keyless/failed. It never claims
 * to be AI and never grades competence.
 */

function build(input: EnhancementInput): EnhancementOutput {
  switch (input.kind) {
    case "plan-explanation": {
      const needs = input.findings.filter((f) => f.state === "needs-foundation").length;
      const validated = input.findings.filter(
        (f) => f.state === "validated-prior-knowledge",
      ).length;
      const points = [
        input.prerequisiteCount > 0
          ? `${input.prerequisiteCount} short bridge module(s) come first to cover foundations.`
          : `No prerequisite bridges are needed — you can start the standard lessons.`,
        input.revisionCount > 0
          ? `${input.revisionCount} lesson(s) are offered as a faster revision lane because you verified related prior knowledge.`
          : `All lessons are recommended in full.`,
        `Estimated core time: about ${input.estimatedHours} hours to the same destination as the standard course.`,
      ];
      return {
        text: `Your plan keeps the same goal as the standard course. It adapts pacing based on what your answers showed: ${needs} area(s) need a foundation first and ${validated} area(s) were validated for a quicker pass. Nothing in your existing progress changes.`,
        points,
      };
    }
    case "connect-skills": {
      return {
        text: `You can lean on what you already know for "${input.lessonTitle}". The ideas you're comfortable with connect directly to the new ones — treat the new concept as a variation on a familiar pattern, then focus your attention on what's genuinely different.`,
        points: [
          "Start from the familiar idea, then name the one thing that changes.",
          "Build the smallest working example before adding detail.",
        ],
      };
    }
    case "alt-analogy": {
      return {
        text: `Here's another way to picture "${input.lessonTitle}": read the lesson's worked example slowly, then restate each step in your own words. If a step doesn't click, that's the exact spot to slow down and experiment with the interactive aid.`,
        points: [],
      };
    }
    case "explain-back-feedback": {
      return {
        text: `Compare your explanation to the reference answer yourself: did you name the key idea, and did you get the cause-and-effect right? Self-review is a reliable way to find gaps. This is guidance for reflection — it is not a grade or proof of mastery.`,
        points: [
          "Underline any term in the reference answer you didn't use.",
          "Re-explain just that part out loud.",
        ],
      };
    }
  }
}

export class DeterministicProvider implements AIEnhancementProvider {
  readonly id = "deterministic" as const;

  async enhance(input: EnhancementInput): Promise<EnhancementResult> {
    return {
      output: build(input),
      fromFallback: true,
      outcome: "fallback",
      model: "deterministic",
      templateVersion: PROMPT_TEMPLATE_VERSION,
    };
  }
}

/** Convenience: a fallback result for a given input + outcome reason. */
export function deterministicResult(
  input: EnhancementInput,
  outcome: EnhancementResult["outcome"] = "fallback",
): EnhancementResult {
  return {
    output: build(input),
    fromFallback: true,
    outcome,
    model: "deterministic",
    templateVersion: PROMPT_TEMPLATE_VERSION,
  };
}
