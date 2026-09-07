"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress/client-store";
import {
  completedCoreTaskCount,
  completedDayCount,
  overallPercent,
  resumeTarget,
} from "@/lib/progress/completion";
import { TOTAL_CORE_TASKS, getLessons } from "@/lib/content/content";
import {
  currentWeekMinutes,
  totalActiveDays,
  totalStudyMinutes,
  activeWeeks,
} from "@/lib/progress/activity";
import { nextMilestone } from "@/lib/milestones";
import { localDateFor, formatMinutes } from "@/lib/date";
import { Card, ProgressBar, SectionTitle, Stat, ProgressBar as Bar, Pill } from "@/components/ui";
import { WeeklyActivity } from "@/components/WeeklyActivity";
import { activePlan } from "@/lib/plan/plan-view";

export function Dashboard() {
  const { state, loading, displayName, storageMode } = useProgress();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
        <div className="h-8 w-64 rounded bg-surface-sunken" />
        <div className="h-32 rounded bg-surface-sunken" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded bg-surface-sunken" />
          ))}
        </div>
      </div>
    );
  }

  const percent = overallPercent(state);
  const doneTasks = completedCoreTaskCount(state);
  const doneDays = completedDayCount(state);
  const resume = resumeTarget(state);
  const totalMin = totalStudyMinutes(state);
  const activeDays = totalActiveDays(state);
  const today = localDateFor(state.settings.timezone);
  const weekMin = currentWeekMinutes(state, today);
  const weeks = activeWeeks(state);
  const target = state.settings.weeklyTargetMinutes;
  const milestone = nextMilestone(state);
  const totalLessons = getLessons().length;

  const isFresh = doneTasks === 0 && totalMin === 0;
  const plan = activePlan(state);
  const hasAssessment = (state.v2?.assessment?.results?.length ?? 0) > 0;
  const showOnboardingChoice = !plan && !hasAssessment;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">
          Welcome, {displayName}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {isFresh
            ? "You're at the very start. A day is a learning unit, not a deadline — begin whenever you have time."
            : "Continue where you left off. Missing a calendar day never erases your progress."}
        </p>
      </div>

      {/* Continue card */}
      <Card className="border-action/30 bg-gradient-to-br from-surface-raised to-action-soft/30">
        <SectionTitle>{isFresh ? "Start learning" : "Continue where you left off"}</SectionTitle>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-navy">
              Day {resume.lesson.day} — {resume.lesson.title}
            </p>
            <p className="mt-0.5 text-sm text-ink-muted">
              {resume.taskId
                ? "Pick up at your next task."
                : "This day is complete — review it or move on."}
            </p>
          </div>
          <Link
            href={`/learn/day/${resume.lesson.day}`}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-action px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-action-hover"
          >
            {isFresh ? "Begin Day 1" : "Resume"}
          </Link>
        </div>
      </Card>

      {/* Onboarding choice (only before any plan/assessment exists) */}
      {showOnboardingChoice && (
        <Card>
          <SectionTitle>Two ways to start</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-navy-600/12 p-4">
              <p className="font-semibold text-navy">Standard 30-unit path</p>
              <p className="mt-1 text-sm text-ink-muted">
                Follow the full course in order. Complete on its own, no setup.
              </p>
              <Link
                href={`/learn/day/${resume.lesson.day}`}
                className="mt-3 inline-block rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover"
              >
                {isFresh ? "Start the standard path" : "Continue the standard path"}
              </Link>
            </div>
            <div className="rounded-lg border border-navy-600/12 p-4">
              <p className="font-semibold text-navy">
                Create a plan around what I know <Pill tone="core">Optional</Pill>
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                A 12–18 min check proposes a personalized route to the same goal. You
                can preview it before anything changes.
              </p>
              <Link
                href="/learn/assessment"
                className="mt-3 inline-block rounded-lg border border-action px-4 py-2 text-sm font-semibold text-action hover:bg-action-soft/40"
              >
                Take the skills check
              </Link>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-faint">
            You can dismiss this and take the check later from the My plan tab.
          </p>
        </Card>
      )}

      {/* Active plan summary */}
      {plan && (
        <Card className="border-action/30">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SectionTitle>Your personalized plan is active</SectionTitle>
            <Link href="/learn/plan" className="text-sm text-action hover:underline">
              View plan →
            </Link>
          </div>
          <p className="text-sm text-ink-muted">
            {plan.items.filter((i) => i.status === "foundation").length} bridge(s) ·{" "}
            {plan.items.filter((i) => i.refType === "lesson" && i.status === "revision").length}{" "}
            revision lane(s) · same destination as the standard course.
          </p>
        </Card>
      )}

      {/* Overall progress */}
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <SectionTitle>Course progress</SectionTitle>
          <span className="text-sm font-semibold text-navy">{percent}%</span>
        </div>
        <ProgressBar value={percent} label="Overall course completion" />
        <p className="mt-2 text-xs text-ink-faint">
          {doneTasks} of {TOTAL_CORE_TASKS} core tasks · derived from your actual
          completed work, not an estimate.
        </p>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Days complete" value={`${doneDays}/${totalLessons}`} hint="Full completion rule" />
        <Stat label="Core tasks" value={`${doneTasks}/${TOTAL_CORE_TASKS}`} />
        <Stat label="Study time" value={formatMinutes(totalMin)} hint={`${activeDays} active day(s)`} />
        <Stat label="Active weeks" value={weeks} hint="No streak penalties" />
      </div>

      {/* Weekly target + milestone */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle>This week</SectionTitle>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-ink-muted">Learning time toward your target</span>
            <span className="font-semibold text-navy">
              {formatMinutes(weekMin)} / {formatMinutes(target)}
            </span>
          </div>
          <Bar
            value={target > 0 ? (weekMin / target) * 100 : 0}
            label="Weekly target progress"
          />
          <p className="mt-2 text-xs text-ink-faint">
            The weekly target shapes encouragement only. It never affects course
            completion. Adjust it in Settings.
          </p>
        </Card>

        <Card>
          <SectionTitle>Next milestone</SectionTitle>
          {milestone ? (
            <div>
              <p className="text-sm font-semibold text-navy">Through Day {milestone.day}</p>
              <p className="mt-1 text-sm text-ink-muted">{milestone.label}</p>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">
              All milestones reached. Revisit any unit or extend your capstone.
            </p>
          )}
        </Card>
      </div>

      <Card>
        <SectionTitle>Recent activity</SectionTitle>
        <WeeklyActivity />
      </Card>

      <p className="text-xs text-ink-faint">
        Storage mode:{" "}
        <span className="font-medium">
          {storageMode === "blob"
            ? "private cloud (Vercel Blob)"
            : storageMode === "local"
              ? "this device / server (local development)"
              : "checking…"}
        </span>
        . Local mode is device-local, not cross-device sync.
      </p>
    </div>
  );
}
