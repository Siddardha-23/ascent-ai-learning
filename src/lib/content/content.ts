import curriculumJson from "../../../content/curriculum.json";
import sourcesJson from "../../../content/sources.json";
import glossaryJson from "../../../content/glossary.json";
import {
  curriculumSchema,
  sourcesSchema,
  glossarySchema,
  type Curriculum,
  type Source,
  type GlossaryTerm,
  type Lesson,
} from "./schema";

/**
 * Parse + validate the canonical content once. If the shipped content is
 * malformed the app should fail loudly at import time rather than render
 * a broken course.
 */
export const curriculum: Curriculum = curriculumSchema.parse(curriculumJson);
export const sources: Source[] = sourcesSchema.parse(sourcesJson);
export const glossary: GlossaryTerm[] = glossarySchema.parse(glossaryJson);

export const CONTENT_VERSION = curriculum.contentVersion;

// Fast lookups
const lessonsByDay = new Map<number, Lesson>();
const lessonsById = new Map<string, Lesson>();
for (const lesson of curriculum.lessons) {
  lessonsByDay.set(lesson.day, lesson);
  lessonsById.set(lesson.id, lesson);
}

const sourcesById = new Map<string, Source>();
for (const s of sources) sourcesById.set(s.id, s);

export function getLessons(): Lesson[] {
  return [...curriculum.lessons].sort((a, b) => a.day - b.day);
}

export function getLessonByDay(day: number): Lesson | undefined {
  return lessonsByDay.get(day);
}

export function getLessonById(id: string): Lesson | undefined {
  return lessonsById.get(id);
}

export function getSourceById(id: string): Source | undefined {
  return sourcesById.get(id);
}

export function getSources(): Source[] {
  return sources;
}

export function getGlossary(): GlossaryTerm[] {
  return [...glossary].sort((a, b) => a.term.localeCompare(b.term));
}

/** All valid task IDs across the whole course (used for API allowlisting). */
export const ALL_TASK_IDS: string[] = curriculum.lessons.flatMap((l) =>
  l.tasks.map((t) => t.id),
);
export const ALL_TASK_ID_SET = new Set(ALL_TASK_IDS);

/** Total number of core tasks that make up 100% completion (240). */
export const TOTAL_CORE_TASKS = ALL_TASK_IDS.length;

/** Stable acceptance-check IDs, e.g. day-01-check-1. */
export function acceptanceCheckId(day: number, index: number): string {
  return `day-${String(day).padStart(2, "0")}-check-${index + 1}`;
}

export function acceptanceCheckIdsForLesson(lesson: Lesson): string[] {
  return lesson.lab.checks.map((_, i) => acceptanceCheckId(lesson.day, i));
}
