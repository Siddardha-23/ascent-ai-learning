import { getLessonById } from "@/lib/content/content";
import { competenciesInOrder } from "@/lib/content/v2-content";

export { competenciesInOrder };

/** Resolve a lesson id (e.g. "day-03") to its day number for linking. */
export function getLessonByDayFromCompetency(lessonId: string): number | null {
  const lesson = getLessonById(lessonId);
  return lesson ? lesson.day : null;
}
