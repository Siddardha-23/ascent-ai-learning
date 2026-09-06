"use client";

import { useProgress } from "@/lib/progress/client-store";
import { minutesByDate } from "@/lib/progress/activity";
import { localDateFor, formatMinutes } from "@/lib/date";

/** Last 14 local dates as a simple, honest activity strip. */
export function WeeklyActivity() {
  const { state } = useProgress();
  const byDate = minutesByDate(state);
  const tz = state.settings.timezone;

  const days: { date: string; minutes: number }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86_400_000);
    const date = localDateFor(tz, d);
    days.push({ date, minutes: byDate[date] ?? 0 });
  }

  const max = Math.max(1, ...days.map((d) => d.minutes));
  const hasAny = days.some((d) => d.minutes > 0);

  if (!hasAny) {
    return (
      <p className="text-sm text-ink-muted">
        No study sessions logged yet. Log time from any lesson to see your
        activity here.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-end gap-1.5" role="img" aria-label="Study minutes over the last 14 days">
        {days.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-action/70"
              style={{ height: `${Math.max(4, (d.minutes / max) * 64)}px` }}
              title={`${d.date}: ${formatMinutes(d.minutes)}`}
            />
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-faint">Study minutes, last 14 days.</p>
    </div>
  );
}
