import { describe, it, expect } from "vitest";
import { getLessons } from "@/lib/content/content";
import { emptyState } from "@/lib/progress/schema";
import { validateIncomingState } from "@/lib/progress/validate-state";
import { reduce } from "@/lib/progress/reducer";

const day1 = getLessons()[0];

describe("server-side state validation", () => {
  it("accepts a valid state", () => {
    let s = emptyState("harshith", "test", "UTC");
    s = reduce(s, { type: "toggleTask", lessonId: day1.id, taskId: day1.tasks[0].id });
    expect(validateIncomingState(s).ok).toBe(true);
  });

  it("rejects an unknown lesson id", () => {
    const s = emptyState("harshith", "test", "UTC");
    (s.days as Record<string, unknown>)["not-a-lesson"] = {
      completedTaskIds: [],
      acceptanceChecks: {},
      notes: "",
      evidence: { text: "", links: [], execution: "not-run" },
      reflection: "",
      checkpoint: { answer: "", reviewed: false, understood: null },
      competency: null,
    };
    const result = validateIncomingState(s);
    expect(result.ok).toBe(false);
  });

  it("rejects an unknown task id", () => {
    const s = emptyState("harshith", "test", "UTC");
    s.days[day1.id] = {
      completedTaskIds: ["bogus-task"],
      acceptanceChecks: {},
      notes: "",
      evidence: { text: "", links: [], execution: "not-run" },
      reflection: "",
      checkpoint: { answer: "", reviewed: false, understood: null },
      competency: null,
    };
    expect(validateIncomingState(s).ok).toBe(false);
  });
});
