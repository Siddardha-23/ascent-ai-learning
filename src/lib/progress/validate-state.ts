import { ALL_TASK_ID_SET, getLessonById } from "@/lib/content/content";
import {
  getPrerequisiteModule,
  getQuestion,
} from "@/lib/content/v2-content";
import { parseAndMigrate, LIMITS, type LearnerState } from "./schema";

export interface ValidationOk {
  ok: true;
  state: LearnerState;
}
export interface ValidationFail {
  ok: false;
  message: string;
}

/**
 * Validate a candidate learner state against the schema AND the loaded course
 * content. Accepts v1 or v2 input (migrating v1 to v2). Every referenced
 * lesson/task/prerequisite/question ID must exist. Rejects oversized or
 * malformed payloads with friendly messages (R8/R17, design.md).
 */
export function validateIncomingState(input: unknown): ValidationOk | ValidationFail {
  const state = parseAndMigrate(input);
  if (!state) {
    return { ok: false, message: "Invalid progress payload: unrecognized schema version or shape" };
  }

  // Every day key must be a real lesson id; every completed task must exist.
  for (const [lessonId, day] of Object.entries(state.days)) {
    const lesson = getLessonById(lessonId);
    if (!lesson) {
      return { ok: false, message: `Unknown lesson id: ${lessonId}` };
    }
    for (const taskId of day.completedTaskIds) {
      if (!ALL_TASK_ID_SET.has(taskId)) {
        return { ok: false, message: `Unknown task id: ${taskId}` };
      }
    }
  }

  // Session lesson ids must exist.
  for (const s of state.sessions) {
    if (!getLessonById(s.lessonId)) {
      return { ok: false, message: `Unknown lesson id in session: ${s.lessonId}` };
    }
  }

  // v2 referential integrity: plan item refs and assessment/question ids.
  const v2 = state.v2;
  if (v2?.plan) {
    for (const rev of v2.plan.revisions) {
      for (const item of rev.items) {
        const known =
          (item.refType === "lesson" && getLessonById(item.refId)) ||
          (item.refType === "prerequisite" && getPrerequisiteModule(item.refId)) ||
          item.refType === "variant"; // variants are presentation-only, id checked in UI layer
        if (!known) {
          return { ok: false, message: `Unknown plan item ref: ${item.refId}` };
        }
      }
    }
    // active revision must exist if set.
    if (
      v2.plan.activeRevisionId &&
      !v2.plan.revisions.some((r) => r.id === v2.plan!.activeRevisionId)
    ) {
      return { ok: false, message: "Active plan revision id does not exist" };
    }
  }
  if (v2?.assessment) {
    for (const result of v2.assessment.results) {
      for (const ans of result.answers) {
        if (!getQuestion(ans.questionId)) {
          return { ok: false, message: `Unknown assessment question id: ${ans.questionId}` };
        }
      }
    }
    for (const ans of v2.assessment.draft?.answers ?? []) {
      if (!getQuestion(ans.questionId)) {
        return { ok: false, message: `Unknown assessment question id: ${ans.questionId}` };
      }
    }
  }

  return { ok: true, state };
}

export function withinSizeLimit(raw: string): boolean {
  return Buffer.byteLength(raw, "utf8") <= LIMITS.backupBytes;
}
