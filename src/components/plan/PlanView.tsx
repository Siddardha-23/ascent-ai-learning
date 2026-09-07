"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress/client-store";
import {
  activePlan,
  planRevisions,
  getRevision,
  describeItem,
  comparePlan,
  destinationCompetencyTitles,
} from "@/lib/plan/plan-view";
import { SKILL_STATE_LABELS } from "@/lib/progress/v2-schema";
import { Card, Pill, SectionTitle } from "@/components/ui";
import { formatMinutes } from "@/lib/date";

const STATUS_TONE: Record<string, "core" | "optional" | "done" | "neutral"> = {
  foundation: "core",
  standard: "neutral",
  revision: "done",
  challenge: "core",
  "optional-depth": "optional",
};
const STATUS_LABEL: Record<string, string> = {
  foundation: "Bridge",
  standard: "Standard",
  revision: "Revision lane",
  challenge: "Challenge",
  "optional-depth": "Optional depth",
};

export function PlanView() {
  const { state, dispatch, loading } = useProgress();
  const params = useSearchParams();
  const router = useRouter();
  const previewId = params.get("preview");

  if (loading) {
    return (
      <div className="animate-pulse space-y-4" aria-busy="true">
        <div className="h-8 w-56 rounded bg-surface-sunken" />
        <div className="h-40 rounded bg-surface-sunken" />
      </div>
    );
  }

  const active = activePlan(state);
  const revisions = planRevisions(state);
  const previewRev = previewId ? getRevision(state, previewId) : null;
  const shown = previewRev ?? active;

  // No plans at all: invite the assessment.
  if (revisions.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <Card>
          <SectionTitle>You&apos;re on the standard path</SectionTitle>
          <p className="text-sm text-ink-muted">
            You haven&apos;t created a personalized plan yet. The standard 30-unit
            course is active and complete on its own. If you&apos;d like a route
            shaped around what you already know, take the optional skills check.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/learn/assessment"
              className="rounded-lg bg-action px-5 py-2.5 text-sm font-semibold text-white hover:bg-action-hover"
            >
              Create a plan around what I know
            </Link>
            <Link
              href="/learn/course"
              className="rounded-lg border border-navy-600/20 px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface-sunken"
            >
              Browse the standard course
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader />

      {/* Preview banner + activation */}
      {previewRev && previewRev.id !== active?.id && (
        <Card className="border-action/40 bg-action-soft/20">
          <SectionTitle>Plan preview</SectionTitle>
          <p className="text-sm text-ink-muted">
            This is a proposal. Your existing task progress, notes and evidence stay
            exactly as they are. Activating only changes which route is suggested and
            how lessons are paced.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                dispatch({ type: "activatePlan", revisionId: previewRev.id });
                router.push("/learn/plan");
                router.refresh();
              }}
              className="rounded-lg bg-action px-5 py-2 text-sm font-semibold text-white hover:bg-action-hover"
            >
              Activate this plan
            </button>
            <Link
              href="/learn/plan"
              className="rounded-lg border border-navy-600/20 px-5 py-2 text-sm font-medium text-ink hover:bg-surface-sunken"
            >
              Keep my current path
            </Link>
          </div>
        </Card>
      )}

      {/* Active-path status */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionTitle>{active ? "Active plan" : "Active path: standard course"}</SectionTitle>
          {active && (
            <button
              type="button"
              onClick={() => {
                dispatch({ type: "returnToStandardPath" });
                router.refresh();
              }}
              className="rounded-md border border-navy-600/20 px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-sunken"
            >
              Return to standard path
            </button>
          )}
        </div>
        {!active && !previewRev && (
          <p className="text-sm text-ink-muted">
            You&apos;re following the standard 30-unit course in order. You have
            {" "}
            {revisions.length} saved plan{revisions.length === 1 ? "" : "s"} you can
            preview and activate below.
          </p>
        )}
      </Card>

      {/* The plan itself */}
      {shown && <PlanDetail rev={shown} />}

      {/* History / restore */}
      {revisions.length > 0 && (
        <Card>
          <SectionTitle>Plan history</SectionTitle>
          <ul className="space-y-2">
            {[...revisions].reverse().map((rev) => (
              <li
                key={rev.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy-600/12 p-3"
              >
                <div className="text-sm">
                  <span className="font-medium text-navy">
                    {new Date(rev.createdAt).toLocaleString()}
                  </span>
                  <span className="ml-2 text-ink-faint">
                    {comparePlan(rev).prerequisiteCount} bridge(s) ·{" "}
                    {formatMinutes(rev.estimatedTotalMinutes)}
                  </span>
                  {rev.id === active?.id && (
                    <span className="ml-2">
                      <Pill tone="done">Active</Pill>
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/learn/plan?preview=${encodeURIComponent(rev.id)}`}
                    className="rounded-md border border-navy-600/20 px-3 py-1.5 text-xs text-ink hover:bg-surface-sunken"
                  >
                    Preview
                  </Link>
                  {rev.id !== active?.id && (
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({ type: "activatePlan", revisionId: rev.id });
                        router.refresh();
                      }}
                      className="rounded-md bg-action px-3 py-1.5 text-xs font-medium text-white hover:bg-action-hover"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <Link href="/learn/assessment" className="text-sm text-action hover:underline">
              Retake the skills check →
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy sm:text-3xl">My plan</h1>
      <p className="mt-1 max-w-reading text-sm text-ink-muted">
        A personalized route to the same destination as the standard course.
        Switching plans never erases progress; completed tasks stay complete, and
        every lesson remains browsable.
      </p>
    </div>
  );
}

function PlanDetail({ rev }: { rev: ReturnType<typeof getRevision> }) {
  if (!rev) return null;
  const cmp = comparePlan(rev);
  const destinations = destinationCompetencyTitles(rev);

  return (
    <>
      <Card>
        <SectionTitle>What this plan changes vs the standard path</SectionTitle>
        <ul className="grid gap-2 sm:grid-cols-2">
          <li className="rounded-lg bg-surface-sunken p-3 text-sm">
            <span className="text-2xl font-bold text-navy">{cmp.prerequisiteCount}</span>
            <div className="text-ink-muted">Prerequisite bridges added</div>
          </li>
          <li className="rounded-lg bg-surface-sunken p-3 text-sm">
            <span className="text-2xl font-bold text-navy">{cmp.revisionLessonCount}</span>
            <div className="text-ink-muted">Lessons offered as a faster revision lane</div>
          </li>
          <li className="rounded-lg bg-surface-sunken p-3 text-sm">
            <span className="text-2xl font-bold text-navy">{cmp.standardLessonCount}</span>
            <div className="text-ink-muted">Lessons recommended in full</div>
          </li>
          <li className="rounded-lg bg-surface-sunken p-3 text-sm">
            <span className="text-2xl font-bold text-navy">
              {formatMinutes(cmp.estimatedTotalMinutes)}
            </span>
            <div className="text-ink-muted">Estimated core time</div>
          </li>
        </ul>
        <p className="mt-3 text-xs text-ink-faint">
          Destination competencies: {cmp.destinationCompetencyCount} (unchanged from
          the standard course). Your existing task progress, notes and evidence remain
          intact.
        </p>
      </Card>

      <Card>
        <SectionTitle>Your route</SectionTitle>
        <ol className="space-y-2">
          {rev.items.map((item, i) => {
            const v = describeItem(item);
            return (
              <li
                key={`${item.refId}-${i}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy-600/12 p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Pill tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Pill>
                    <span className="text-xs text-ink-faint">
                      {formatMinutes(item.estimatedMinutes)}
                    </span>
                  </div>
                  <div className="mt-1 font-medium text-navy">{v.title}</div>
                  <div className="text-xs text-ink-faint">{item.rationale}</div>
                </div>
                {v.href && (
                  <Link
                    href={v.href}
                    className="shrink-0 rounded-md border border-navy-600/20 px-3 py-1.5 text-xs text-ink hover:bg-surface-sunken"
                  >
                    Open
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </Card>

      {destinations.length > 0 && (
        <Card>
          <SectionTitle>Where this leads (unchanged goal)</SectionTitle>
          <ul className="flex flex-wrap gap-1.5">
            {destinations.map((t) => (
              <li key={t}>
                <Pill>{t}</Pill>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}

export { SKILL_STATE_LABELS };
