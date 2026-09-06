import { ALL_TASK_ID_SET, getLessonById } from "@/lib/content/content";
import { learnerStateSchema, LIMITS, type LearnerState } from "./schema";

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
 * content: every referenced lesson/task ID must exist. Rejects oversized or
 * malformed payloads with friendly messages (R8, design.md).
 */
export function validateIncomingState(input: unknown): ValidationOk | ValidationFail {
  const parsed = learnerStateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: `Invalid progress payload: ${parsed.error.issues[0]?.message ?? "schema error"}` };
  }
  const state = parsed.data;

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

  return { ok: true, state };
}

export function withinSizeLimit(raw: string): boolean {
  return Buffer.byteLength(raw, "utf8") <= LIMITS.backupBytes;
}
