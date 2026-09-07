"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress/client-store";
import { competenciesInOrder, getLessonByDayFromCompetency } from "@/lib/plan/skills";
import { SKILL_AREA_LABELS, type SkillArea } from "@/lib/content/v2-schema";
import {
  SKILL_STATE_LABELS,
  type SkillState,
} from "@/lib/progress/v2-schema";
import { Card, Pill, SectionTitle } from "@/components/ui";

const STATE_TONE: Record<SkillState, "core" | "optional" | "done" | "neutral"> = {
  "needs-foundation": "core",
  "ready-to-learn": "neutral",
  "verify-prior-knowledge": "optional",
  "validated-prior-knowledge": "done",
};

export function SkillsMap() {
  const { state, loading } = useProgress();

  if (loading) {
    return <div className="h-40 animate-pulse rounded bg-surface-sunken" />;
  }

  // Latest assessment findings by skill area (if any).
  const results = state.v2?.assessment?.results ?? [];
  const latest = results[results.length - 1];
  const stateByArea = new Map<SkillArea, SkillState>();
  for (const f of latest?.findings ?? []) stateByArea.set(f.skillArea, f.state);
  const validated = new Set((state.v2?.validatedPriorKnowledge ?? []).map((v) => v.skillArea));

  const comps = competenciesInOrder();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">Skills map</h1>
        <p className="mt-1 max-w-reading text-sm text-ink-muted">
          The competencies that make up the destination, in dependency order, with
          your evidence state. This shows what you&apos;ve verified — never a
          fabricated mastery percentage.
        </p>
      </div>

      {!latest && (
        <Card>
          <p className="text-sm text-ink-muted">
            No skills check yet. Take the optional assessment to see verified evidence
            here. The competency graph below is the same for everyone.
          </p>
          <Link
            href="/learn/assessment"
            className="mt-3 inline-block rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover"
          >
            Take the skills check
          </Link>
        </Card>
      )}

      <Card>
        <SectionTitle>Competency graph (dependency order)</SectionTitle>
        <ol className="space-y-2">
          {comps.map((c) => {
            const areaState = stateByArea.get(c.skillArea);
            const isValidated = validated.has(c.skillArea);
            return (
              <li
                key={c.id}
                className="rounded-lg border border-navy-600/12 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-navy">{c.title}</span>
                  <div className="flex items-center gap-2">
                    <Pill tone="neutral">{SKILL_AREA_LABELS[c.skillArea]}</Pill>
                    {areaState ? (
                      <Pill tone={STATE_TONE[areaState]}>
                        {isValidated ? "Verified" : SKILL_STATE_LABELS[areaState]}
                      </Pill>
                    ) : (
                      <Pill tone="neutral">Not assessed</Pill>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-sm text-ink-muted">{c.description}</p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-ink-faint">
                  {c.dependencies.length > 0 && (
                    <span>Builds on: {c.dependencies.length} earlier competenc{c.dependencies.length === 1 ? "y" : "ies"}</span>
                  )}
                  {c.taughtByLessonIds.length > 0 && (
                    <span>
                      Taught in:{" "}
                      {c.taughtByLessonIds
                        .map((lid) => {
                          const day = getLessonByDayFromCompetency(lid);
                          return day ? (
                            <Link key={lid} href={`/learn/day/${day}`} className="text-action hover:underline">
                              Day {day}
                            </Link>
                          ) : null;
                        })
                        .filter(Boolean)
                        .reduce<React.ReactNode[]>((acc, el, i) => {
                          if (i > 0) acc.push(", ");
                          acc.push(el);
                          return acc;
                        }, [])}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}
