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
  | { type: "replaceState"; state: LearnerState };

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
    default:
      return state;
  }
}
