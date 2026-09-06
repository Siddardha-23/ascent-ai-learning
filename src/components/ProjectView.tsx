"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress/client-store";
import { getLessons } from "@/lib/content/content";
import { getDayState, evaluateDay } from "@/lib/progress/completion";
import { COMPETENCY_LABELS } from "@/lib/progress/schema";
import { MILESTONES, milestoneReached } from "@/lib/milestones";
import { Card, Pill, SectionTitle } from "@/components/ui";

const EXEC_LABEL: Record<string, string> = {
  actual: "Actually executed",
  mock: "Mocked / simulated",
  "not-run": "Not run",
  mixed: "Mixed",
};

export function ProjectView() {
  const { state, loading } = useProgress();
  const lessons = getLessons();

  const withEvidence = lessons
    .map((l) => ({ lesson: l, day: getDayState(state, l.id) }))
    .filter(
      ({ day }) =>
        day.evidence.text.trim() ||
        day.evidence.links.length > 0 ||
        day.reflection.trim() ||
        day.competency,
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">
          Project &amp; evidence
        </h1>
        <p className="mt-1 max-w-reading text-sm text-ink-muted">
          Your Atlas Support build log. This collects the evidence, code links,
          reflections and self-assessed levels you record on each day.
          Self-reported completion is shown as such — it is not a verified test
          result.
        </p>
      </div>

      {/* Milestones */}
      <Card>
        <SectionTitle>Milestones</SectionTitle>
        <ul className="space-y-2">
          {MILESTONES.map((m) => {
            const reached = loading ? false : milestoneReached(state, m.day);
            return (
              <li key={m.day} className="flex items-start gap-3">
                <span className="mt-0.5">
                  {reached ? <Pill tone="done">Reached</Pill> : <Pill>Pending</Pill>}
                </span>
                <span className="text-sm text-ink">
                  <span className="font-medium text-navy">Through Day {m.day}: </span>
                  {m.label}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Evidence log */}
      <div>
        <SectionTitle>Evidence log</SectionTitle>
        {withEvidence.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-muted">
              No evidence recorded yet. As you complete labs, your notes, code
              links and reflections will appear here.
            </p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {withEvidence.map(({ lesson, day }) => {
              const ev = evaluateDay(lesson, day);
              return (
                <li key={lesson.id}>
                  <Card>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/learn/day/${lesson.day}`}
                        className="font-semibold text-action hover:underline"
                      >
                        Day {lesson.day} — {lesson.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        {ev.complete && <Pill tone="done">Day complete</Pill>}
                        <Pill>{EXEC_LABEL[day.evidence.execution]}</Pill>
                      </div>
                    </div>
                    {day.evidence.text.trim() && (
                      <p className="whitespace-pre-wrap text-sm text-ink">
                        {day.evidence.text}
                      </p>
                    )}
                    {day.evidence.links.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {day.evidence.links.map((url) => (
                          <li key={url}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="break-all text-sm text-action hover:underline"
                            >
                              {url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                    {day.reflection.trim() && (
                      <p className="mt-2 border-l-2 border-navy-600/20 pl-3 text-sm italic text-ink-muted">
                        {day.reflection}
                      </p>
                    )}
                    {day.competency && (
                      <p className="mt-2 text-xs text-ink-faint">
                        Self-assessed: {COMPETENCY_LABELS[day.competency]}
                      </p>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
