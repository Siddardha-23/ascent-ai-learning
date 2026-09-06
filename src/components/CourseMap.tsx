"use client";

import Link from "next/link";
import { getLessons } from "@/lib/content/content";
import { PHASES } from "@/lib/content/schema";
import { useProgress } from "@/lib/progress/client-store";
import { evaluateDay, getDayState } from "@/lib/progress/completion";
import { Card, Pill, ProgressBar } from "@/components/ui";
import { formatMinutes } from "@/lib/date";

export function CourseMap() {
  const { state, loading } = useProgress();
  const lessons = getLessons();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">Course map</h1>
        <p className="mt-1 max-w-reading text-sm text-ink-muted">
          Thirty sequential learning units in four phases. Prerequisites are
          shown, but you may browse ahead freely — nothing is locked.
        </p>
      </div>

      {PHASES.map((phase) => {
        const phaseLessons = lessons.filter((l) =>
          (phase.days as readonly number[]).includes(l.day),
        );
        const done = loading
          ? 0
          : phaseLessons.filter(
              (l) => evaluateDay(l, getDayState(state, l.id)).complete,
            ).length;

        return (
          <section key={phase.id} aria-labelledby={`phase-${phase.id}`}>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id={`phase-${phase.id}`} className="text-lg font-semibold text-navy">
                {phase.label}
                <span className="ml-2 text-sm font-normal text-ink-faint">
                  Days {phase.days[0]}–{phase.days[phase.days.length - 1]}
                </span>
              </h2>
              <span className="text-sm text-ink-muted">
                {done}/{phaseLessons.length} complete
              </span>
            </div>
            <div className="mb-4">
              <ProgressBar
                value={(done / phaseLessons.length) * 100}
                label={`${phase.label} completion`}
              />
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {phaseLessons.map((lesson) => {
                const day = getDayState(state, lesson.id);
                const ev = loading
                  ? { complete: false, tasksDone: 0, tasksTotal: lesson.tasks.length }
                  : evaluateDay(lesson, day);
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/learn/day/${lesson.day}`}
                      className="flex h-full flex-col gap-2 rounded-xl border border-navy-600/12 bg-surface-raised p-4 shadow-sm transition hover:border-action hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                          Day {lesson.day}
                        </span>
                        {ev.complete ? (
                          <Pill tone="done">Complete</Pill>
                        ) : ev.tasksDone > 0 ? (
                          <Pill tone="core">In progress</Pill>
                        ) : (
                          <Pill>Not started</Pill>
                        )}
                      </div>
                      <span className="font-semibold text-navy">{lesson.title}</span>
                      <span className="text-xs text-ink-faint">
                        {formatMinutes(lesson.minutes)} core · {ev.tasksDone}/
                        {ev.tasksTotal} tasks
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
