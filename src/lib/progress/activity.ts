import type { LearnerState, StudySession } from "./schema";

/**
 * Timezone-aware activity helpers (R6). Local dates are learner-context values
 * recorded explicitly on each session, not inferred from UTC string slicing.
 */

export function totalStudyMinutes(state: LearnerState): number {
  return state.sessions.reduce((sum, s) => sum + s.minutes, 0);
}

/** Distinct local dates that have at least one recorded session. */
export function activeDays(state: LearnerState): string[] {
  const set = new Set<string>();
  for (const s of state.sessions) set.add(s.localDate);
  return [...set].sort();
}

export function totalActiveDays(state: LearnerState): number {
  return activeDays(state).length;
}

/** Minutes recorded in the last `days` local dates, keyed by date. */
export function minutesByDate(state: LearnerState): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of state.sessions) {
    out[s.localDate] = (out[s.localDate] ?? 0) + s.minutes;
  }
  return out;
}

/** ISO week key (year-Www) using the local date string of each session. */
function isoWeekKey(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((date.getTime() - firstThursday.getTime()) / 86_400_000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Minutes in the current week, computed from a supplied "today" local date. */
export function currentWeekMinutes(state: LearnerState, todayLocalDate: string): number {
  const target = isoWeekKey(todayLocalDate);
  return state.sessions
    .filter((s) => isoWeekKey(s.localDate) === target)
    .reduce((sum, s) => sum + s.minutes, 0);
}

/**
 * Weekly consistency: number of distinct weeks with any recorded activity.
 * A precise, non-punishing measure (R6): missing a calendar week never removes
 * previously earned progress.
 */
export function activeWeeks(state: LearnerState): number {
  const set = new Set<string>();
  for (const s of state.sessions) set.add(isoWeekKey(s.localDate));
  return set.size;
}

export function sortSessions(sessions: StudySession[]): StudySession[] {
  return [...sessions].sort((a, b) => {
    if (a.localDate !== b.localDate) return b.localDate.localeCompare(a.localDate);
    return b.createdAt.localeCompare(a.createdAt);
  });
}
