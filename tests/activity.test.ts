import { describe, it, expect } from "vitest";
import { getLessons } from "@/lib/content/content";
import { emptyState, type StudySession } from "@/lib/progress/schema";
import {
  totalStudyMinutes,
  totalActiveDays,
  currentWeekMinutes,
  activeWeeks,
} from "@/lib/progress/activity";

const day1 = getLessons()[0];

function session(date: string, minutes: number, id: string): StudySession {
  return {
    id,
    lessonId: day1.id,
    localDate: date,
    timezone: "UTC",
    minutes,
    createdAt: "t",
    updatedAt: "t",
  };
}

describe("activity", () => {
  it("sums minutes and counts distinct active days", () => {
    const s = emptyState("harshith", "test", "UTC");
    s.sessions = [
      session("2026-01-01", 30, "a"),
      session("2026-01-01", 15, "b"),
      session("2026-01-02", 45, "c"),
    ];
    expect(totalStudyMinutes(s)).toBe(90);
    expect(totalActiveDays(s)).toBe(2);
  });

  it("computes current-week minutes by iso week", () => {
    const s = emptyState("harshith", "test", "UTC");
    // 2026-01-05 (Mon) and 2026-01-07 (Wed) are the same ISO week.
    s.sessions = [
      session("2026-01-05", 30, "a"),
      session("2026-01-07", 20, "b"),
      session("2026-01-12", 60, "c"), // next week
    ];
    expect(currentWeekMinutes(s, "2026-01-06")).toBe(50);
    expect(activeWeeks(s)).toBe(2);
  });
});
