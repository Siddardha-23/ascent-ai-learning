import { describe, it, expect } from "vitest";
import { getLessons } from "@/lib/content/content";
import { emptyState } from "@/lib/progress/schema";
import { validateIncomingState } from "@/lib/progress/validate-state";
import { enhancementInputSchema } from "@/lib/ai/provider";

const day1 = getLessons()[0];

describe("v2 state referential validation (security)", () => {
  it("rejects a plan item referencing an unknown lesson", () => {
    const s = emptyState("harshith", "test", "UTC");
    s.v2!.plan = {
      activeRevisionId: null,
      revisions: [
        {
          id: "rev-1",
          algorithmVersion: "x",
          contentVersion: "test",
          createdAt: "t",
          assessmentResultId: null,
          items: [
            {
              refId: "day-999", // not a real lesson
              refType: "lesson",
              status: "standard",
              rationale: "x",
              estimatedMinutes: 30,
              dependencyRefIds: [],
            },
          ],
          destinationCompetencyIds: [],
          estimatedTotalMinutes: 30,
        },
      ],
    };
    expect(validateIncomingState(s).ok).toBe(false);
  });

  it("rejects a plan item referencing an unknown prerequisite", () => {
    const s = emptyState("harshith", "test", "UTC");
    s.v2!.plan = {
      activeRevisionId: null,
      revisions: [
        {
          id: "rev-1",
          algorithmVersion: "x",
          contentVersion: "test",
          createdAt: "t",
          assessmentResultId: null,
          items: [
            {
              refId: "pre-not-real",
              refType: "prerequisite",
              status: "foundation",
              rationale: "x",
              estimatedMinutes: 30,
              dependencyRefIds: [],
            },
          ],
          destinationCompetencyIds: [],
          estimatedTotalMinutes: 30,
        },
      ],
    };
    expect(validateIncomingState(s).ok).toBe(false);
  });

  it("rejects an assessment answer with an unknown question id", () => {
    const s = emptyState("harshith", "test", "UTC");
    s.v2!.assessment = {
      results: [
        {
          id: "r1",
          createdAt: "t",
          scorerVersion: "x",
          answers: [{ questionId: "q-not-real", value: "a", unsure: false }],
          findings: [],
        },
      ],
    };
    expect(validateIncomingState(s).ok).toBe(false);
  });

  it("accepts a valid v2 state with a real plan + assessment", () => {
    const s = emptyState("harshith", "test", "UTC");
    s.v2!.plan = {
      activeRevisionId: "rev-1",
      revisions: [
        {
          id: "rev-1",
          algorithmVersion: "x",
          contentVersion: "test",
          createdAt: "t",
          assessmentResultId: null,
          items: [
            {
              refId: day1.id,
              refType: "lesson",
              status: "standard",
              rationale: "ok",
              estimatedMinutes: 30,
              dependencyRefIds: [],
            },
          ],
          destinationCompetencyIds: [],
          estimatedTotalMinutes: 30,
        },
      ],
    };
    expect(validateIncomingState(s).ok).toBe(true);
  });

  it("rejects an active revision id that does not exist", () => {
    const s = emptyState("harshith", "test", "UTC");
    s.v2!.plan = { activeRevisionId: "ghost", revisions: [] };
    expect(validateIncomingState(s).ok).toBe(false);
  });
});

describe("AI input schema bounds (security)", () => {
  it("rejects an oversized learner answer", () => {
    const tooLong = "x".repeat(4001);
    const parsed = enhancementInputSchema.safeParse({
      kind: "explain-back-feedback",
      question: "q",
      referenceAnswer: "r",
      learnerAnswer: tooLong,
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts a bounded, well-formed input", () => {
    const parsed = enhancementInputSchema.safeParse({
      kind: "connect-skills",
      knownSkillIds: ["programming-python"],
      nextSkillIds: ["llm-apps"],
      lessonTitle: "Call models like a backend developer",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects an unknown enhancement kind", () => {
    const parsed = enhancementInputSchema.safeParse({ kind: "make-decision", foo: 1 });
    expect(parsed.success).toBe(false);
  });
});
