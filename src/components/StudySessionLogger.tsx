"use client";

import { useState } from "react";
import { useProgress } from "@/lib/progress/client-store";
import { localDateFor, formatMinutes } from "@/lib/date";
import { LIMITS } from "@/lib/progress/schema";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function StudySessionLogger({ lessonId }: { lessonId: string }) {
  const { state, dispatch } = useProgress();
  const [minutes, setMinutes] = useState(30);
  const tz = state.settings.timezone;

  const todaysSessions = state.sessions.filter(
    (s) => s.lessonId === lessonId,
  );
  const total = todaysSessions.reduce((sum, s) => sum + s.minutes, 0);

  function log() {
    const m = Math.max(
      LIMITS.sessionMinMinutes,
      Math.min(LIMITS.sessionMaxMinutes, Math.round(minutes)),
    );
    const now = new Date().toISOString();
    dispatch({
      type: "addSession",
      session: {
        id: makeId(),
        lessonId,
        localDate: localDateFor(tz),
        timezone: tz,
        minutes: m,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  return (
    <div>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor={`min-${lessonId}`} className="mb-1 block text-sm text-ink-muted">
            Minutes
          </label>
          <input
            id={`min-${lessonId}`}
            type="number"
            min={LIMITS.sessionMinMinutes}
            max={LIMITS.sessionMaxMinutes}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-full rounded-lg border border-navy-600/20 bg-white p-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={log}
          className="rounded-lg bg-action px-3 py-2 text-sm font-medium text-white hover:bg-action-hover"
        >
          Log
        </button>
      </div>
      {total > 0 && (
        <p className="mt-2 text-xs text-ink-faint">
          {formatMinutes(total)} logged on this lesson.
        </p>
      )}
      {todaysSessions.length > 0 && (
        <ul className="mt-2 space-y-1">
          {todaysSessions.slice(-5).reverse().map((s) => (
            <li key={s.id} className="flex items-center justify-between text-xs text-ink-muted">
              <span>
                {s.localDate} · {formatMinutes(s.minutes)}
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: "removeSession", sessionId: s.id })}
                className="text-ink-faint hover:text-red-600"
              >
                remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-ink-faint">
        Timezone: {tz}. Sessions are dated in your local time.
      </p>
    </div>
  );
}
