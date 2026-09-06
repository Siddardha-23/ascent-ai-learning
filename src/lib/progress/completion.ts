import { getLessons, TOTAL_CORE_TASKS } from "@/lib/content/content";
import type { Lesson } from "@/lib/content/schema";
import { emptyDayState, type DayState, type LearnerState } from "./schema";

/**
 * Completion semantics (R3). Progress is derived from data; we never store a
 * second mutable percentage that can drift.
 */

export function getDayState(state: LearnerState, dayKey: string): DayState {
  return state.days[dayKey] ?? emptyDayState();
}

/** The 8 core task IDs for a lesson (every supplied task is core). */
export function coreTaskIds(lesson: Lesson): string[] {
  return lesson.tasks.map((t) => t.id);
}

export function completedCoreTaskCount(state: LearnerState): number {
  let count = 0;
  for (const lesson of getLessons()) {
    const day = getDayState(state, lesson.id);
    const core = new Set(coreTaskIds(lesson));
    const done = new Set(day.completedTaskIds.filter((id) => core.has(id)));
    count += done.size;
  }
  return count;
}

export function overallPercent(state: LearnerState): number {
  if (TOTAL_CORE_TASKS === 0) return 0;
  return Math.round((completedCoreTaskCount(state) / TOTAL_CORE_TASKS) * 100);
}

/**
 * Reasons a day is not yet complete. A day is complete only when all core
 * tasks are done, an evidence note and reflection exist, and the checkpoint
 * has been attempted and self-reviewed (R3).
 */
export interface DayCompletion {
  complete: boolean;
  missing: string[];
  tasksDone: number;
  tasksTotal: number;
}

export function evaluateDay(lesson: Lesson, day: DayState): DayCompletion {
  const core = coreTaskIds(lesson);
  const doneSet = new Set(day.completedTaskIds);
  const tasksDone = core.filter((id) => doneSet.has(id)).length;
  const missing: string[] = [];

  if (tasksDone < core.length) {
    missing.push(`${core.length - tasksDone} core task(s) remaining`);
  }
  if (day.evidence.text.trim().length === 0) {
    missing.push("Evidence note is empty");
  }
  if (day.reflection.trim().length === 0) {
    missing.push("Reflection is empty");
  }
  if (day.checkpoint.answer.trim().length === 0) {
    missing.push("Checkpoint not attempted");
  } else if (!day.checkpoint.reviewed) {
    missing.push("Checkpoint answer not self-reviewed");
  }

  return {
    complete: missing.length === 0,
    missing,
    tasksDone,
    tasksTotal: core.length,
  };
}

export function completedDayCount(state: LearnerState): number {
  let count = 0;
  for (const lesson of getLessons()) {
    const day = getDayState(state, lesson.id);
    if (evaluateDay(lesson, day).complete) count += 1;
  }
  return count;
}

/** The first incomplete task in a lesson, or null if all tasks are done. */
export function firstIncompleteTask(lesson: Lesson, day: DayState): string | null {
  const doneSet = new Set(day.completedTaskIds);
  for (const t of lesson.tasks) {
    if (!doneSet.has(t.id)) return t.id;
  }
  return null;
}

/**
 * Resume target: the current in-progress lesson's first incomplete task, else
 * the next unstarted lesson. Learners may browse ahead freely, so we resume at
 * the earliest lesson that is not yet complete.
 */
export interface ResumeTarget {
  lesson: Lesson;
  taskId: string | null;
  isFresh: boolean;
}

export function resumeTarget(state: LearnerState): ResumeTarget {
  const lessons = getLessons();

  // Prefer explicit last location if it points to an incomplete lesson.
  if (state.lastLocation) {
    const lesson = lessons.find((l) => l.id === state.lastLocation!.lessonId);
    if (lesson) {
      const day = getDayState(state, lesson.id);
      if (!evaluateDay(lesson, day).complete) {
        return { lesson, taskId: firstIncompleteTask(lesson, day), isFresh: false };
      }
    }
  }

  for (const lesson of lessons) {
    const day = getDayState(state, lesson.id);
    if (!evaluateDay(lesson, day).complete) {
      const hasAnyProgress =
        day.completedTaskIds.length > 0 ||
        day.notes.trim().length > 0 ||
        day.checkpoint.answer.trim().length > 0;
      return {
        lesson,
        taskId: firstIncompleteTask(lesson, day),
        isFresh: !hasAnyProgress,
      };
    }
  }

  // Everything complete: land on the last lesson.
  const last = lessons[lessons.length - 1];
  return { lesson: last, taskId: null, isFresh: false };
}
