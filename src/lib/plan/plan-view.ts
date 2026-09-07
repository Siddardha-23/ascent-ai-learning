import { getLessonById } from "@/lib/content/content";
import {
  getPrerequisiteModule,
  getCompetency,
  competencies,
} from "@/lib/content/v2-content";
import { standardPathItems } from "./composer";
import type { LearnerState } from "@/lib/progress/schema";
import type { PlanItem, PlanRevision } from "@/lib/progress/v2-schema";

/** The plan revision currently active, or null when on the standard path. */
export function activePlan(state: LearnerState): PlanRevision | null {
  const plan = state.v2?.plan;
  if (!plan?.activeRevisionId) return null;
  return plan.revisions.find((r) => r.id === plan.activeRevisionId) ?? null;
}

/** All plan revisions, newest last (as stored). */
export function planRevisions(state: LearnerState): PlanRevision[] {
  return state.v2?.plan?.revisions ?? [];
}

export function getRevision(state: LearnerState, id: string): PlanRevision | null {
  return state.v2?.plan?.revisions.find((r) => r.id === id) ?? null;
}

/** A display-ready view of a plan item. */
export interface PlanItemView {
  item: PlanItem;
  title: string;
  href: string | null; // link target (canonical lesson) or null
  subtitle: string;
}

export function describeItem(item: PlanItem): PlanItemView {
  if (item.refType === "lesson") {
    const lesson = getLessonById(item.refId);
    return {
      item,
      title: lesson ? `Day ${lesson.day} — ${lesson.title}` : item.refId,
      href: lesson ? `/learn/day/${lesson.day}` : null,
      subtitle: lesson ? lesson.level : "",
    };
  }
  if (item.refType === "prerequisite") {
    const mod = getPrerequisiteModule(item.refId);
    return {
      item,
      title: mod ? `Bridge — ${mod.title}` : item.refId,
      href: mod ? `/learn/prerequisite/${mod.id}` : null,
      subtitle: mod ? mod.targetGap : "",
    };
  }
  // variant (e.g. optional depth for a lesson)
  const baseLessonId = item.refId.split("::")[0];
  const lesson = getLessonById(baseLessonId);
  return {
    item,
    title: lesson ? `Optional depth — Day ${lesson.day}` : item.refId,
    href: lesson ? `/learn/day/${lesson.day}` : null,
    subtitle: "Stretch content",
  };
}

/** Summary comparing a plan revision to the standard path (for the preview). */
export interface PlanComparison {
  prerequisiteCount: number;
  standardLessonCount: number;
  revisionLessonCount: number;
  optionalDepthCount: number;
  estimatedTotalMinutes: number;
  destinationCompetencyCount: number;
  standardLessonTotal: number;
}

export function comparePlan(rev: PlanRevision): PlanComparison {
  const prerequisiteCount = rev.items.filter((i) => i.status === "foundation").length;
  const standardLessonCount = rev.items.filter(
    (i) => i.refType === "lesson" && i.status === "standard",
  ).length;
  const revisionLessonCount = rev.items.filter(
    (i) => i.refType === "lesson" && i.status === "revision",
  ).length;
  const optionalDepthCount = rev.items.filter((i) => i.status === "optional-depth").length;
  return {
    prerequisiteCount,
    standardLessonCount,
    revisionLessonCount,
    optionalDepthCount,
    estimatedTotalMinutes: rev.estimatedTotalMinutes,
    destinationCompetencyCount: rev.destinationCompetencyIds.length,
    standardLessonTotal: standardPathItems().length,
  };
}

/** Competency titles for a plan's destination (for display). */
export function destinationCompetencyTitles(rev: PlanRevision): string[] {
  return rev.destinationCompetencyIds
    .map((id) => getCompetency(id)?.title)
    .filter((t): t is string => Boolean(t));
}

export { competencies };
