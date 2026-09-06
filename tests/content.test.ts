import { describe, it, expect } from "vitest";
import {
  curriculum,
  sources,
  glossary,
  getLessons,
  getSourceById,
  ALL_TASK_IDS,
  TOTAL_CORE_TASKS,
} from "@/lib/content/content";

describe("content integrity", () => {
  it("has exactly 30 lessons numbered 1..30", () => {
    const lessons = getLessons();
    expect(lessons).toHaveLength(30);
    expect(lessons.map((l) => l.day)).toEqual(
      Array.from({ length: 30 }, (_, i) => i + 1),
    );
  });

  it("has unique lesson ids and unique task ids", () => {
    const lessonIds = new Set(curriculum.lessons.map((l) => l.id));
    expect(lessonIds.size).toBe(30);
    const taskIds = new Set(ALL_TASK_IDS);
    expect(taskIds.size).toBe(ALL_TASK_IDS.length);
  });

  it("totals 240 core tasks (8 per day)", () => {
    expect(TOTAL_CORE_TASKS).toBe(240);
    for (const l of curriculum.lessons) {
      expect(l.tasks.length).toBe(8);
    }
  });

  it("renders every required content field", () => {
    for (const l of curriculum.lessons) {
      expect(l.title.length).toBeGreaterThan(0);
      expect(l.bridge.length).toBeGreaterThan(0);
      expect(l.explain.length).toBeGreaterThan(0);
      expect(l.analogy.length).toBeGreaterThan(0);
      expect(l.goals.length).toBeGreaterThan(0);
      expect(l.lab.steps.length).toBeGreaterThan(0);
      expect(l.lab.checks.length).toBeGreaterThan(0);
      expect(l.quiz.question.length).toBeGreaterThan(0);
      expect(l.quiz.answer.length).toBeGreaterThan(0);
      expect(l.resourceAssignments.length).toBeGreaterThan(0);
    }
  });

  it("resolves every resource assignment source id", () => {
    for (const l of curriculum.lessons) {
      for (const a of l.resourceAssignments) {
        expect(getSourceById(a.sourceId), `${l.id} -> ${a.sourceId}`).toBeDefined();
      }
    }
  });

  it("resolves every glossary source id", () => {
    const ids = new Set(sources.map((s) => s.id));
    for (const t of glossary) {
      for (const sid of t.sourceIds ?? []) {
        expect(ids.has(sid), `${t.id} -> ${sid}`).toBe(true);
      }
    }
  });

  it("has 77 sources and 123 glossary terms", () => {
    expect(sources.length).toBe(77);
    expect(glossary.length).toBe(123);
  });
});
