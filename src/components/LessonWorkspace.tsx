"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Lesson } from "@/lib/content/schema";
import { phaseForDay } from "@/lib/content/schema";
import {
  getLessonByDay,
  getSourceById,
  acceptanceCheckId,
} from "@/lib/content/content";
import { useProgress } from "@/lib/progress/client-store";
import { evaluateDay, getDayState } from "@/lib/progress/completion";
import {
  COMPETENCY_LABELS,
  competencySchema,
  type Competency,
  type ExecutionStatus,
} from "@/lib/progress/schema";
import { Card, Pill, SectionTitle } from "@/components/ui";
import { AutoTextarea } from "@/components/fields";
import { ResourceCard } from "@/components/ResourceCard";
import { StudySessionLogger } from "@/components/StudySessionLogger";
import { LessonEnhancements } from "@/components/LessonEnhancements";
import { formatMinutes } from "@/lib/date";

const TASK_KIND_LABEL: Record<string, string> = {
  learn: "Read / watch",
  lab: "Build",
  verify: "Verify",
  recall: "Checkpoint",
  reflect: "Reflect",
};

const EXECUTION_OPTIONS: { value: ExecutionStatus; label: string }[] = [
  { value: "not-run", label: "Not run yet" },
  { value: "actual", label: "Actually executed" },
  { value: "mock", label: "Mocked / simulated" },
  { value: "mixed", label: "Mixed" },
];

export function LessonWorkspace({ lesson }: { lesson: Lesson }) {
  const { state, dispatch, loading } = useProgress();
  const day = getDayState(state, lesson.id);
  const phase = phaseForDay(lesson.day);
  const prev = getLessonByDay(lesson.day - 1);
  const next = getLessonByDay(lesson.day + 1);

  // Record last location for resume.
  useEffect(() => {
    if (!loading) dispatch({ type: "setLastLocation", lessonId: lesson.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id, loading]);

  const completion = evaluateDay(lesson, day);
  const doneSet = new Set(day.completedTaskIds);

  const coreResources = lesson.resourceAssignments.filter((r) =>
    r.priority.toLowerCase().startsWith("core"),
  );
  const optionalResources = lesson.resourceAssignments.filter(
    (r) => !r.priority.toLowerCase().startsWith("core"),
  );

  return (
    <div className="space-y-6">
      {/* Header + breadcrumbs */}
      <div>
        <nav aria-label="Breadcrumb" className="mb-2 text-xs text-ink-faint">
          <Link href="/learn/course" className="hover:underline">
            Course
          </Link>{" "}
          / {phase.label}
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
            Day {lesson.day}
          </span>
          <Pill tone="neutral">{lesson.level}</Pill>
          <span className="text-xs text-ink-faint">
            {formatMinutes(lesson.minutes)} core estimate
          </span>
          {completion.complete && <Pill tone="done">Day complete</Pill>}
        </div>
        <h1 className="mt-1 text-2xl font-bold text-navy sm:text-3xl">
          {lesson.title}
        </h1>
        {lesson.prerequisites.length > 0 && (
          <p className="mt-1 text-sm text-ink-muted">
            Prerequisite: {lesson.prerequisites.join(", ")}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main reading column */}
        <div className="min-w-0 space-y-6">
          <Card>
            <SectionTitle>Connect to what you know</SectionTitle>
            <div className="prose-reading text-ink">{lesson.bridge}</div>
          </Card>

          <Card>
            <SectionTitle>Understand it</SectionTitle>
            <div className="prose-reading text-ink">{lesson.explain}</div>
            <div className="mt-4 rounded-lg bg-action-soft/40 p-3">
              <p className="text-sm">
                <span className="font-semibold text-navy">Real-world analogy: </span>
                <span className="text-ink">{lesson.analogy}</span>
              </p>
            </div>
            {lesson.topics.length > 0 && (
              <div className="mt-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Topics
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {lesson.topics.map((t) => (
                    <li key={t}>
                      <Pill>{t}</Pill>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <Card>
            <SectionTitle>By the end, you should be able to</SectionTitle>
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
              {lesson.goals.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </Card>

          {/* Enhanced presentation (authored blocks + interactive visuals) */}
          <LessonEnhancements lessonId={lesson.id} lessonTitle={lesson.title} />

          {/* Resources */}
          <Card>
            <SectionTitle>Read or watch with a purpose</SectionTitle>
            <div className="space-y-3">
              {coreResources.map((r) => (
                <ResourceCard
                  key={r.sourceId + r.instruction}
                  source={getSourceById(r.sourceId)}
                  priority={r.priority}
                  instruction={r.instruction}
                />
              ))}
            </div>
            {optionalResources.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-ink-muted">
                  Reference / optional resources ({optionalResources.length})
                </summary>
                <div className="mt-3 space-y-3">
                  {optionalResources.map((r) => (
                    <ResourceCard
                      key={r.sourceId + r.instruction}
                      source={getSourceById(r.sourceId)}
                      priority={r.priority}
                      instruction={r.instruction}
                    />
                  ))}
                </div>
              </details>
            )}
          </Card>

          {/* Lab */}
          <Card>
            <SectionTitle>Hands-on lab</SectionTitle>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-ink">
              {lesson.lab.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            <p className="mt-3 rounded-lg bg-surface-sunken p-3 text-sm">
              <span className="font-semibold text-navy">Save: </span>
              {lesson.lab.deliverable}
            </p>
          </Card>

          {/* Acceptance checks */}
          <Card>
            <SectionTitle>Acceptance checks</SectionTitle>
            <p className="mb-2 text-xs text-ink-faint">
              These are self-attestations (&quot;I checked this&quot;), not
              automated test results.
            </p>
            <ul className="space-y-2">
              {lesson.lab.checks.map((check, i) => {
                const checkId = acceptanceCheckId(lesson.day, i);
                const checked = day.acceptanceChecks[checkId] ?? false;
                return (
                  <li key={checkId} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id={checkId}
                      checked={checked}
                      onChange={(e) =>
                        dispatch({
                          type: "setAcceptanceCheck",
                          lessonId: lesson.id,
                          checkId,
                          value: e.target.checked,
                        })
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 accent-progress"
                    />
                    <label htmlFor={checkId} className="text-sm text-ink">
                      {check}
                    </label>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Checkpoint */}
          <Card>
            <SectionTitle>Check your understanding</SectionTitle>
            <p className="text-sm font-medium text-navy">{lesson.quiz.question}</p>
            <div className="mt-3">
              <AutoTextarea
                id={`checkpoint-${lesson.id}`}
                label="Your answer"
                hint="Answer in your own words first. Your answer is saved before the explanation is revealed."
                value={day.checkpoint.answer}
                maxLength={10_000}
                onChange={(v) =>
                  dispatch({ type: "setCheckpointAnswer", lessonId: lesson.id, value: v })
                }
              />
            </div>
            {day.checkpoint.answer.trim().length > 0 ? (
              <details className="mt-3">
                <summary
                  className="cursor-pointer text-sm font-medium text-action"
                  onClick={() =>
                    dispatch({
                      type: "setCheckpointReviewed",
                      lessonId: lesson.id,
                      value: true,
                    })
                  }
                >
                  Reveal the reference explanation
                </summary>
                <p className="mt-2 rounded-lg bg-surface-sunken p-3 text-sm text-ink">
                  {lesson.quiz.answer}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: "setCheckpointUnderstood",
                        lessonId: lesson.id,
                        value: true,
                      })
                    }
                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                      day.checkpoint.understood === true
                        ? "bg-progress text-white"
                        : "border border-navy-600/20 text-ink"
                    }`}
                  >
                    I understood this
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: "setCheckpointUnderstood",
                        lessonId: lesson.id,
                        value: false,
                      })
                    }
                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                      day.checkpoint.understood === false
                        ? "bg-amber-500 text-white"
                        : "border border-navy-600/20 text-ink"
                    }`}
                  >
                    Revisit this
                  </button>
                </div>
              </details>
            ) : (
              <p className="mt-2 text-xs text-ink-faint">
                Write an answer to unlock the reference explanation.
              </p>
            )}
          </Card>

          {lesson.stretch && (
            <Card>
              <SectionTitle>Optional depth — inside this day</SectionTitle>
              <div className="prose-reading text-sm text-ink">{lesson.stretch}</div>
            </Card>
          )}
        </div>

        {/* Sidebar: tasks, evidence, session, nav */}
        <aside className="space-y-6">
          <Card>
            <SectionTitle>Tasks ({completion.tasksDone}/{completion.tasksTotal})</SectionTitle>
            <ul className="space-y-2">
              {lesson.tasks.map((task) => (
                <li key={task.id} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id={task.id}
                    checked={doneSet.has(task.id)}
                    onChange={() =>
                      dispatch({ type: "toggleTask", lessonId: lesson.id, taskId: task.id })
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 accent-progress"
                  />
                  <label htmlFor={task.id} className="text-sm text-ink">
                    <span className="mr-1 text-xs font-semibold uppercase text-ink-faint">
                      {TASK_KIND_LABEL[task.kind] ?? task.kind}
                    </span>
                    <br />
                    {task.title}
                  </label>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <SectionTitle>Evidence &amp; reflection</SectionTitle>
            <div className="space-y-4">
              <AutoTextarea
                id={`evidence-${lesson.id}`}
                label="Evidence note"
                hint={lesson.evidencePrompt ?? "Summarize what you ran and observed."}
                value={day.evidence.text}
                maxLength={10_000}
                onChange={(v) =>
                  dispatch({ type: "setEvidenceText", lessonId: lesson.id, value: v })
                }
              />
              <div>
                <label
                  htmlFor={`exec-${lesson.id}`}
                  className="mb-1 block text-sm font-medium text-navy"
                >
                  Execution status
                </label>
                <select
                  id={`exec-${lesson.id}`}
                  value={day.evidence.execution}
                  onChange={(e) =>
                    dispatch({
                      type: "setEvidenceExecution",
                      lessonId: lesson.id,
                      value: e.target.value as ExecutionStatus,
                    })
                  }
                  className="w-full rounded-lg border border-navy-600/20 bg-white p-2 text-sm"
                >
                  {EXECUTION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <EvidenceLinks lessonId={lesson.id} links={day.evidence.links} />
              <AutoTextarea
                id={`reflection-${lesson.id}`}
                label="Reflection"
                hint="What can you explain or build now that you could not before?"
                value={day.reflection}
                maxLength={10_000}
                onChange={(v) =>
                  dispatch({ type: "setReflection", lessonId: lesson.id, value: v })
                }
              />
              <div>
                <label
                  htmlFor={`competency-${lesson.id}`}
                  className="mb-1 block text-sm font-medium text-navy"
                >
                  Self-assessed level
                </label>
                <select
                  id={`competency-${lesson.id}`}
                  value={day.competency ?? ""}
                  onChange={(e) =>
                    dispatch({
                      type: "setCompetency",
                      lessonId: lesson.id,
                      value: e.target.value
                        ? (competencySchema.parse(e.target.value) as Competency)
                        : null,
                    })
                  }
                  className="w-full rounded-lg border border-navy-600/20 bg-white p-2 text-sm"
                >
                  <option value="">Not set</option>
                  {(Object.keys(COMPETENCY_LABELS) as Competency[]).map((c) => (
                    <option key={c} value={c}>
                      {COMPETENCY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle>Log study time</SectionTitle>
            <StudySessionLogger lessonId={lesson.id} />
          </Card>

          {/* Completion status */}
          <Card
            className={completion.complete ? "border-progress/40 bg-progress-soft/30" : ""}
          >
            <SectionTitle>Day completion</SectionTitle>
            {completion.complete ? (
              <p className="text-sm font-medium text-progress">
                This day is complete. Well done.
              </p>
            ) : (
              <>
                <p className="mb-2 text-sm text-ink-muted">Still needed:</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
                  {completion.missing.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </>
            )}
          </Card>

          {/* Prev/next */}
          <div className="flex items-center justify-between gap-2">
            {prev ? (
              <Link
                href={`/learn/day/${prev.day}`}
                className="rounded-md border border-navy-600/20 px-3 py-2 text-sm text-ink hover:bg-surface-sunken"
              >
                ← Day {prev.day}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/learn/day/${next.day}`}
                className="rounded-md border border-navy-600/20 px-3 py-2 text-sm text-ink hover:bg-surface-sunken"
              >
                Day {next.day} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function EvidenceLinks({
  lessonId,
  links,
}: {
  lessonId: string;
  links: string[];
}) {
  const { dispatch } = useProgress();
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-navy">Artifact / code links</p>
      <ul className="mb-2 space-y-1">
        {links.map((url, i) => (
          <li key={url} className="flex items-center justify-between gap-2 text-sm">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-action hover:underline"
            >
              {url}
            </a>
            <button
              type="button"
              onClick={() => dispatch({ type: "removeEvidenceLink", lessonId, index: i })}
              className="shrink-0 text-xs text-ink-faint hover:text-red-600"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const input = form.elements.namedItem("url") as HTMLInputElement;
          if (input.value.trim()) {
            dispatch({ type: "addEvidenceLink", lessonId, url: input.value.trim() });
            input.value = "";
          }
        }}
        className="flex gap-2"
      >
        <input
          name="url"
          type="url"
          placeholder="https://github.com/…"
          className="min-w-0 flex-1 rounded-lg border border-navy-600/20 bg-white p-2 text-sm"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-action px-3 py-2 text-sm font-medium text-white hover:bg-action-hover"
        >
          Add
        </button>
      </form>
    </div>
  );
}
