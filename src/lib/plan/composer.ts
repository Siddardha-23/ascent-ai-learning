import { getLessons, CONTENT_VERSION } from "@/lib/content/content";
import {
  competencies,
  prerequisiteModules,
} from "@/lib/content/v2-content";
import type { SkillArea } from "@/lib/content/v2-schema";
import {
  type AssessmentResult,
  type LearningPreferences,
  type PlanItem,
  type PlanItemStatus,
  type PlanRevision,
  type SkillFinding,
  type SkillState,
} from "@/lib/progress/v2-schema";

/**
 * Deterministic, pure plan composer (R16). Given an assessment result and
 * preferences, it produces a versioned PlanRevision. It NEVER calls a model
 * and NEVER mutates completion state. Identical inputs (with the same supplied
 * id/createdAt) produce byte-identical output.
 *
 * The destination competency graph and capstone are constant for every plan,
 * so all learners converge on the same goal; only bridges, revision emphasis,
 * pacing and scaffolding differ.
 */

export const ALGORITHM_VERSION = "composer-2026-09-05.1";

/** The fixed destination competencies (all of them). */
function destinationCompetencyIds(): string[] {
  return competencies.map((c) => c.id).sort();
}

/** Map each canonical lesson to the skill areas of competencies it teaches. */
function lessonSkillAreas(lessonId: string): SkillArea[] {
  const areas = new Set<SkillArea>();
  for (const c of competencies) {
    if (c.taughtByLessonIds.includes(lessonId)) areas.add(c.skillArea);
  }
  return [...areas];
}

/** Worst (most-remedial) state among a set, for choosing a lesson's lane. */
const STATE_SEVERITY: Record<SkillState, number> = {
  "needs-foundation": 3,
  "verify-prior-knowledge": 2,
  "ready-to-learn": 1,
  "validated-prior-knowledge": 0,
};

function dominantState(
  areas: SkillArea[],
  findingByArea: Map<SkillArea, SkillFinding>,
): SkillState {
  // Take the most-remedial state among the lesson's areas that HAVE a finding.
  // If none have findings, default to ready-to-learn (standard path).
  let worst: SkillState | null = null;
  for (const a of areas) {
    const f = findingByArea.get(a);
    if (!f) continue;
    if (worst === null || STATE_SEVERITY[f.state] > STATE_SEVERITY[worst]) {
      worst = f.state;
    }
  }
  return worst ?? "ready-to-learn";
}

/** Choose a lesson's plan status from the dominant skill state. */
function statusForLesson(state: SkillState): PlanItemStatus {
  switch (state) {
    case "validated-prior-knowledge":
      return "revision"; // faster lane; lesson stays browsable, tasks NOT auto-completed
    case "ready-to-learn":
    case "verify-prior-knowledge":
    case "needs-foundation":
    default:
      return "standard";
  }
}

/** Revision lanes are estimated shorter, but never zero. */
function revisionMinutes(fullMinutes: number): number {
  return Math.max(15, Math.round(fullMinutes * 0.4));
}

export interface ComposeInput {
  id: string;
  createdAt: string;
  result: AssessmentResult | null; // null => standard path with no findings
  preferences: LearningPreferences | null;
}

export function composePlan(input: ComposeInput): PlanRevision {
  const { id, createdAt, result, preferences } = input;
  const findingByArea = new Map<SkillArea, SkillFinding>();
  for (const f of result?.findings ?? []) findingByArea.set(f.skillArea, f);

  const lessons = getLessons(); // sorted by day (deterministic)
  const items: PlanItem[] = [];
  const addedPrereqIds = new Set<string>();

  // 1) Insert prerequisite bridges for skill areas that need a foundation,
  //    each placed before the first canonical lesson it unlocks.
  //    Iterate prerequisiteModules in their stable file order.
  const neededAreas = new Set<SkillArea>();
  for (const [area, f] of findingByArea) {
    if (f.state === "needs-foundation") neededAreas.add(area);
  }

  // Build the ordered spine: for each lesson (in day order), first emit any
  // not-yet-added prerequisite that unlocks it and targets a needed area.
  for (const lesson of lessons) {
    for (const mod of prerequisiteModules) {
      if (addedPrereqIds.has(mod.id)) continue;
      if (!neededAreas.has(mod.skillArea)) continue;
      if (!mod.unlocksLessonIds.includes(lesson.id)) continue;
      addedPrereqIds.add(mod.id);
      const finding = findingByArea.get(mod.skillArea);
      items.push({
        refId: mod.id,
        refType: "prerequisite",
        status: "foundation",
        rationale: finding
          ? `${finding.explanation} This bridge prepares you for ${lesson.id}.`
          : `Foundation bridge for ${mod.skillArea}, added before ${lesson.id}.`,
        estimatedMinutes: mod.estimatedMinutes,
        dependencyRefIds: [],
      });
    }

    // 2) Emit the canonical lesson with a lane based on its dominant state.
    const areas = lessonSkillAreas(lesson.id);
    const state = dominantState(areas, findingByArea);
    const status = statusForLesson(state);
    const estMinutes =
      status === "revision" ? revisionMinutes(lesson.minutes) : lesson.minutes;
    const priorLesson = lessons[lesson.day - 2];
    items.push({
      refId: lesson.id,
      refType: "lesson",
      status,
      rationale:
        status === "revision"
          ? `Validated prior knowledge in a related area — offered as a faster revision lane; the full lesson stays available and no tasks are auto-completed.`
          : state === "verify-prior-knowledge"
            ? `Recommended in full; a short check first can confirm prior knowledge.`
            : `Standard lesson on the destination path.`,
      estimatedMinutes: estMinutes,
      dependencyRefIds: priorLesson ? [priorLesson.id] : [],
    });

    // 3) Offer optional depth where the lesson has stretch content and the
    //    learner validated the area (they can go deeper).
    if (status === "revision" && lesson.stretch) {
      items.push({
        refId: `${lesson.id}::depth`,
        refType: "variant",
        status: "optional-depth",
        rationale: `Optional depth for ${lesson.id} since you already know the basics.`,
        estimatedMinutes: 30,
        dependencyRefIds: [lesson.id],
      });
    }
  }

  // Any needed prerequisite that no lesson explicitly unlocked (safety net):
  for (const mod of prerequisiteModules) {
    if (neededAreas.has(mod.skillArea) && !addedPrereqIds.has(mod.id)) {
      addedPrereqIds.add(mod.id);
      items.unshift({
        refId: mod.id,
        refType: "prerequisite",
        status: "foundation",
        rationale: `Foundation bridge for ${mod.skillArea}.`,
        estimatedMinutes: mod.estimatedMinutes,
        dependencyRefIds: [],
      });
    }
  }

  // Depth preference nudges: "implementation" learners get challenge items on
  // builder lessons; this never removes destination competencies.
  if (preferences?.depth === "implementation") {
    // no-op placeholder for future challenge injection; kept deterministic.
  }

  const estimatedTotalMinutes = items
    .filter((i) => i.status !== "optional-depth")
    .reduce((sum, i) => sum + i.estimatedMinutes, 0);

  return {
    id,
    algorithmVersion: ALGORITHM_VERSION,
    contentVersion: CONTENT_VERSION,
    createdAt,
    assessmentResultId: result?.id ?? null,
    items,
    destinationCompetencyIds: destinationCompetencyIds(),
    estimatedTotalMinutes,
  };
}

/**
 * Standard-path plan: what a learner who skips personalization effectively
 * follows. Every lesson standard, in day order, no bridges. Useful for preview
 * comparisons.
 */
export function standardPathItems(): PlanItem[] {
  const lessons = getLessons();
  return lessons.map((lesson, i) => ({
    refId: lesson.id,
    refType: "lesson" as const,
    status: "standard" as const,
    rationale: "Standard lesson on the destination path.",
    estimatedMinutes: lesson.minutes,
    dependencyRefIds: i > 0 ? [lessons[i - 1].id] : [],
  }));
}
