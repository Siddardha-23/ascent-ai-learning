import { describe, it, expect } from "vitest";
import { QUESTION_STEPS, ALL_WIZARD_QUESTION_IDS } from "@/lib/plan/wizard-steps";
import { assessmentBank } from "@/lib/content/v2-content";

describe("assessment wizard steps", () => {
  it("covers every diagnostic and self-report question exactly once", () => {
    const ids = ALL_WIZARD_QUESTION_IDS;
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length); // no duplicates
    // Every question in the bank appears in some step.
    for (const q of assessmentBank) {
      expect(unique.has(q.id), `missing ${q.id}`).toBe(true);
    }
    // Every step id referenced is a real question.
    const bankIds = new Set(assessmentBank.map((q) => q.id));
    for (const id of ids) expect(bankIds.has(id)).toBe(true);
  });

  it("puts self-report first and has stable step ids", () => {
    expect(QUESTION_STEPS[0].id).toBe("self-report");
    expect(QUESTION_STEPS[0].questions.every((q) => q.type === "self-report")).toBe(true);
    expect(QUESTION_STEPS.map((s) => s.id)).toEqual([
      "self-report",
      "foundations",
      "ml",
      "apps",
      "advanced",
    ]);
  });
});
