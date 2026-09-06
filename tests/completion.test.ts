import { describe, it, expect } from "vitest";
import { getLessons } from "@/lib/content/content";
import { emptyState, emptyDayState } from "@/lib/progress/schema";
import {
  overallPercent,
  completedCoreTaskCount,
  completedDayCount,
  evaluateDay,
  resumeTarget,
  firstIncompleteTask,
} from "@/lib/progress/completion";
import { reduce } from "@/lib/progress/reducer";

const CV = "test";
const lessons = getLessons();
const day1 = lessons[0];

function fresh() {
  return emptyState("harshith", CV, "UTC");
}

describe("completion rules", () => {
  it("fresh profile is 0% / 0 tasks / 0 days", () => {
    const s = fresh();
    expect(overallPercent(s)).toBe(0);
    expect(completedCoreTaskCount(s)).toBe(0);
    expect(completedDayCount(s)).toBe(0);
  });

  it("percent derives from completed core tasks / 240", () => {
    let s = fresh();
    // complete all 8 tasks of day 1
    for (const t of day1.tasks) {
      s = reduce(s, { type: "toggleTask", lessonId: day1.id, taskId: t.id });
    }
    expect(completedCoreTaskCount(s)).toBe(8);
    expect(overallPercent(s)).toBe(Math.round((8 / 240) * 100));
  });

  it("a day needs tasks + evidence + reflection + reviewed checkpoint", () => {
    let s = fresh();
    for (const t of day1.tasks) {
      s = reduce(s, { type: "toggleTask", lessonId: day1.id, taskId: t.id });
    }
    let ev = evaluateDay(day1, s.days[day1.id]);
    expect(ev.complete).toBe(false); // missing evidence/reflection/checkpoint

    s = reduce(s, { type: "setEvidenceText", lessonId: day1.id, value: "ran it" });
    s = reduce(s, { type: "setReflection", lessonId: day1.id, value: "learned x" });
    s = reduce(s, { type: "setCheckpointAnswer", lessonId: day1.id, value: "my answer" });
    ev = evaluateDay(day1, s.days[day1.id]);
    expect(ev.complete).toBe(false); // checkpoint not reviewed

    s = reduce(s, { type: "setCheckpointReviewed", lessonId: day1.id, value: true });
    ev = evaluateDay(day1, s.days[day1.id]);
    expect(ev.complete).toBe(true);
    expect(completedDayCount(s)).toBe(1);
  });

  it("unchecking a task lowers counts but preserves notes", () => {
    let s = fresh();
    for (const t of day1.tasks) {
      s = reduce(s, { type: "toggleTask", lessonId: day1.id, taskId: t.id });
    }
    s = reduce(s, { type: "setNotes", lessonId: day1.id, value: "keep me" });
    s = reduce(s, { type: "toggleTask", lessonId: day1.id, taskId: day1.tasks[0].id });
    expect(completedCoreTaskCount(s)).toBe(7);
    expect(s.days[day1.id].notes).toBe("keep me");
  });

  it("firstIncompleteTask finds the next task", () => {
    const s = fresh();
    expect(firstIncompleteTask(day1, emptyDayState())).toBe(day1.tasks[0].id);
  });

  it("resume points to day 1 for a fresh profile", () => {
    const s = fresh();
    const r = resumeTarget(s);
    expect(r.lesson.day).toBe(1);
    expect(r.isFresh).toBe(true);
  });

  it("optional-task idea: only supplied task ids count (no penalty)", () => {
    let s = fresh();
    // toggling an unknown task id does nothing
    s = reduce(s, { type: "toggleTask", lessonId: day1.id, taskId: "not-a-real-task" });
    expect(completedCoreTaskCount(s)).toBe(0);
  });
});
