import { describe, it, expect } from "vitest";
import { getLessons } from "@/lib/content/content";
import { emptyState } from "@/lib/progress/schema";
import { reduce } from "@/lib/progress/reducer";

const day1 = getLessons()[0];
function fresh() {
  return emptyState("aparna", "test", "UTC");
}

describe("reducer", () => {
  it("rejects unsafe evidence link protocols", () => {
    let s = fresh();
    s = reduce(s, {
      type: "addEvidenceLink",
      lessonId: day1.id,
      url: "javascript:alert(1)",
    });
    expect(s.days[day1.id]?.evidence.links ?? []).toHaveLength(0);

    s = reduce(s, {
      type: "addEvidenceLink",
      lessonId: day1.id,
      url: "https://github.com/x/y",
    });
    expect(s.days[day1.id].evidence.links).toEqual(["https://github.com/x/y"]);
  });

  it("dedupes evidence links", () => {
    let s = fresh();
    s = reduce(s, { type: "addEvidenceLink", lessonId: day1.id, url: "https://a.com" });
    s = reduce(s, { type: "addEvidenceLink", lessonId: day1.id, url: "https://a.com" });
    expect(s.days[day1.id].evidence.links).toHaveLength(1);
  });

  it("dedupes sessions by id and clamps minutes", () => {
    let s = fresh();
    const base = {
      id: "s1",
      lessonId: day1.id,
      localDate: "2026-01-01",
      timezone: "UTC",
      minutes: 30,
      createdAt: "t",
      updatedAt: "t",
    };
    s = reduce(s, { type: "addSession", session: base });
    s = reduce(s, { type: "addSession", session: base });
    expect(s.sessions).toHaveLength(1);

    s = reduce(s, { type: "updateSessionMinutes", sessionId: "s1", minutes: 99999 });
    expect(s.sessions[0].minutes).toBe(720); // clamped to max
  });

  it("clamps weekly target to valid range", () => {
    let s = fresh();
    s = reduce(s, { type: "setWeeklyTarget", minutes: -5 });
    expect(s.settings.weeklyTargetMinutes).toBe(0);
    s = reduce(s, { type: "setWeeklyTarget", minutes: 99999 });
    expect(s.settings.weeklyTargetMinutes).toBe(10080);
  });

  it("toggle is reversible", () => {
    let s = fresh();
    const tid = day1.tasks[0].id;
    s = reduce(s, { type: "toggleTask", lessonId: day1.id, taskId: tid });
    expect(s.days[day1.id].completedTaskIds).toContain(tid);
    s = reduce(s, { type: "toggleTask", lessonId: day1.id, taskId: tid });
    expect(s.days[day1.id].completedTaskIds).not.toContain(tid);
  });
});
