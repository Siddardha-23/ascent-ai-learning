import { getLessonById } from "@/lib/content/content";
import {
  emptyDayState,
  LIMITS,
  type Competency,
  type DayState,
  type ExecutionStatus,
  type LearnerState,
  type StudySession,
} from "./schema";
import {
  emptyV2Block,
  V2_LIMITS,
  type AssessmentDraft,
  type AssessmentResult,
  type DepthPreference,
  type LearningPreferences,
  type PlanRevision,
  type V2Block,
  type ValidatedKnowledge,
} from "./v2-schema";

/**
 * Pure, immutable mutations of LearnerState. The UI dispatches these; tests
 * exercise them directly. Every mutation stamps updatedAt.
 */

export type Action =
  | { type: "toggleTask"; lessonId: string; taskId: string }
  | { type: "setAcceptanceCheck"; lessonId: string; checkId: string; value: boolean }
  | { type: "setNotes"; lessonId: string; value: string }
  | { type: "setEvidenceText"; lessonId: string; value: string }
  | { type: "setEvidenceExecution"; lessonId: string; value: ExecutionStatus }
  | { type: "addEvidenceLink"; lessonId: string; url: string }
  | { type: "removeEvidenceLink"; lessonId: string; index: number }
  | { type: "setReflection"; lessonId: string; value: string }
  | { type: "setCheckpointAnswer"; lessonId: string; value: string }
  | { type: "setCheckpointReviewed"; lessonId: string; value: boolean }
  | { type: "setCheckpointUnderstood"; lessonId: string; value: boolean | null }
  | { type: "setCompetency"; lessonId: string; value: Competency | null }
  | { type: "setLastLocation"; lessonId: string; taskId?: string }
  | { type: "addSession"; session: StudySession }
  | { type: "updateSessionMinutes"; sessionId: string; minutes: number }
  | { type: "removeSession"; sessionId: string }
  | { type: "setWeeklyTarget"; minutes: number }
  | { type: "setTimezone"; timezone: string }
  | { type: "replaceState"; state: LearnerState }
  // ---- v2 actions (additive; never auto-complete canonical tasks) ----
  | { type: "saveAssessmentDraft"; draft: AssessmentDraft }
  | { type: "clearAssessmentDraft" }
  | { type: "submitAssessment"; result: AssessmentResult; validated: ValidatedKnowledge[] }
  | { type: "setPreferences"; preferences: LearningPreferences }
  | { type: "setDepthPreference"; depth: DepthPreference }
  | { type: "addPlanRevision"; revision: PlanRevision }
  | { type: "activatePlan"; revisionId: string | null }
  | { type: "returnToStandardPath" }
  | { type: "setAiConsent"; consent: boolean };

const SAFE_URL = /^(https?:|mailto:|file:)/i;

function withDay(
  state: LearnerState,
  lessonId: string,
  fn: (day: DayState) => DayState,
): LearnerState {
  const existing = state.days[lessonId] ?? emptyDayState();
  const nextDay = fn(existing);
  return {
    ...state,
    days: { ...state.days, [lessonId]: nextDay },
    updatedAt: new Date().toISOString(),
  };
}

function clamp(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) : s;
}

/** Apply a change to the additive v2 block, initializing it if absent. */
function withV2(state: LearnerState, fn: (v2: V2Block) => V2Block): LearnerState {
  const current = state.v2 ?? emptyV2Block();
  return {
    ...state,
    v2: fn(current),
    updatedAt: new Date().toISOString(),
  };
}

export function reduce(state: LearnerState, action: Action): LearnerState {
  switch (action.type) {
    case "toggleTask": {
      const lesson = getLessonById(action.lessonId);
      if (!lesson || !lesson.tasks.some((t) => t.id === action.taskId)) return state;
      return withDay(state, action.lessonId, (day) => {
        const set = new Set(day.completedTaskIds);
        if (set.has(action.taskId)) set.delete(action.taskId);
        else set.add(action.taskId);
        return { ...day, completedTaskIds: [...set] };
      });
    }
    case "setAcceptanceCheck":
      return withDay(state, action.lessonId, (day) => ({
        ...day,
        acceptanceChecks: { ...day.acceptanceChecks, [action.checkId]: action.value },
      }));
    case "setNotes":
      return withDay(state, action.lessonId, (day) => ({
        ...day,
        notes: clamp(action.value, LIMITS.notes),
      }));
    case "setEvidenceText":
      return withDay(state, action.lessonId, (day) => ({
        ...day,
        evidence: { ...day.evidence, text: clamp(action.value, LIMITS.evidenceText) },
      }));
    case "setEvidenceExecution":
      return withDay(state, action.lessonId, (day) => ({
        ...day,
        evidence: { ...day.evidence, execution: action.value },
      }));
    case "addEvidenceLink":
      return withDay(state, action.lessonId, (day) => {
        const url = action.url.trim();
        if (!url || !SAFE_URL.test(url)) return day;
        if (day.evidence.links.length >= LIMITS.linksPerDay) return day;
        if (day.evidence.links.includes(url)) return day;
        return {
          ...day,
          evidence: {
            ...day.evidence,
            links: [...day.evidence.links, clamp(url, LIMITS.linkLength)],
          },
        };
      });
    case "removeEvidenceLink":
      return withDay(state, action.lessonId, (day) => ({
        ...day,
        evidence: {
          ...day.evidence,
          links: day.evidence.links.filter((_, i) => i !== action.index),
        },
      }));
    case "setReflection":
      return withDay(state, action.lessonId, (day) => ({
        ...day,
        reflection: clamp(action.value, LIMITS.reflection),
      }));
    case "setCheckpointAnswer":
      return withDay(state, action.lessonId, (day) => ({
        ...day,
        checkpoint: {
          ...day.checkpoint,
          answer: clamp(action.value, LIMITS.checkpointAnswer),
        },
      }));
    case "setCheckpointReviewed":
      return withDay(state, action.lessonId, (day) => ({
        ...day,
        checkpoint: { ...day.checkpoint, reviewed: action.value },
      }));
    case "setCheckpointUnderstood":
      return withDay(state, action.lessonId, (day) => ({
        ...day,
        checkpoint: { ...day.checkpoint, understood: action.value },
      }));
    case "setCompetency":
      return withDay(state, action.lessonId, (day) => ({
        ...day,
        competency: action.value,
      }));
    case "setLastLocation":
      return {
        ...state,
        lastLocation: { lessonId: action.lessonId, taskId: action.taskId },
        updatedAt: new Date().toISOString(),
      };
    case "addSession": {
      // Deduplicate by id.
      if (state.sessions.some((s) => s.id === action.session.id)) return state;
      if (state.sessions.length >= LIMITS.maxSessions) return state;
      return {
        ...state,
        sessions: [...state.sessions, action.session],
        updatedAt: new Date().toISOString(),
      };
    }
    case "updateSessionMinutes": {
      const minutes = Math.max(
        LIMITS.sessionMinMinutes,
        Math.min(LIMITS.sessionMaxMinutes, Math.round(action.minutes)),
      );
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.sessionId
            ? { ...s, minutes, updatedAt: new Date().toISOString() }
            : s,
        ),
        updatedAt: new Date().toISOString(),
      };
    }
    case "removeSession":
      return {
        ...state,
        sessions: state.sessions.filter((s) => s.id !== action.sessionId),
        updatedAt: new Date().toISOString(),
      };
    case "setWeeklyTarget":
      return {
        ...state,
        settings: {
          ...state.settings,
          weeklyTargetMinutes: Math.max(0, Math.min(10_080, Math.round(action.minutes))),
        },
        updatedAt: new Date().toISOString(),
      };
    case "setTimezone":
      return {
        ...state,
        settings: { ...state.settings, timezone: action.timezone },
        updatedAt: new Date().toISOString(),
      };
    case "replaceState":
      return { ...action.state, updatedAt: new Date().toISOString() };

    // ---- v2 handlers ----
    case "saveAssessmentDraft":
      return withV2(state, (v2) => ({
        ...v2,
        assessment: { results: v2.assessment?.results ?? [], draft: action.draft },
      }));
    case "clearAssessmentDraft":
      return withV2(state, (v2) => ({
        ...v2,
        assessment: { results: v2.assessment?.results ?? [], draft: undefined },
      }));
    case "submitAssessment":
      return withV2(state, (v2) => {
        const prior = v2.assessment?.results ?? [];
        // Cap retake history; keep the most recent.
        const results = [...prior, action.result].slice(-V2_LIMITS.maxAssessmentResults);
        // Merge validated prior knowledge (latest wins per skill area).
        const byArea = new Map<string, ValidatedKnowledge>();
        for (const v of v2.validatedPriorKnowledge ?? []) byArea.set(v.skillArea, v);
        for (const v of action.validated) byArea.set(v.skillArea, v);
        return {
          ...v2,
          assessment: { results, draft: undefined },
          validatedPriorKnowledge: [...byArea.values()],
        };
      });
    case "setPreferences":
      return withV2(state, (v2) => ({ ...v2, preferences: action.preferences }));
    case "setDepthPreference":
      return withV2(state, (v2) => ({
        ...v2,
        preferences: {
          ...(v2.preferences ?? {
            languages: [],
            weeklyMinutes: 300,
            sessionMinutes: 45,
            teachingModes: [],
            compute: [],
            cloud: "none" as const,
            depth: "simple" as const,
          }),
          depth: action.depth,
        },
      }));
    case "addPlanRevision":
      return withV2(state, (v2) => {
        const existing = v2.plan ?? { activeRevisionId: null, revisions: [] };
        const revisions = [...existing.revisions, action.revision].slice(
          -V2_LIMITS.maxPlanRevisions,
        );
        return { ...v2, plan: { ...existing, revisions } };
      });
    case "activatePlan":
      return withV2(state, (v2) => {
        const existing = v2.plan ?? { activeRevisionId: null, revisions: [] };
        // Only activate a revision that exists (or null for standard path).
        if (
          action.revisionId !== null &&
          !existing.revisions.some((r) => r.id === action.revisionId)
        ) {
          return v2;
        }
        return { ...v2, plan: { ...existing, activeRevisionId: action.revisionId } };
      });
    case "returnToStandardPath":
      return withV2(state, (v2) => {
        const existing = v2.plan ?? { activeRevisionId: null, revisions: [] };
        return { ...v2, plan: { ...existing, activeRevisionId: null } };
      });
    case "setAiConsent":
      return withV2(state, (v2) => ({
        ...v2,
        ai: {
          consent: action.consent,
          consentAt: action.consent ? new Date().toISOString() : v2.ai?.consentAt,
          revokedAt: action.consent ? undefined : new Date().toISOString(),
          cache: v2.ai?.cache ?? [],
        },
      }));
    default:
      return state;
  }
}
