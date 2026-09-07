"use client";

import Link from "next/link";
import type { PrerequisiteModule } from "@/lib/content/v2-schema";
import { getSourceById } from "@/lib/content/content";
import { getSourceV2 } from "@/lib/content/v2-content";
import { useProgress } from "@/lib/progress/client-store";
import { Card, Pill, SectionTitle } from "@/components/ui";
import { CodeBlock } from "@/components/CodeBlock";
import { formatMinutes } from "@/lib/date";
import { SKILL_AREA_LABELS } from "@/lib/content/v2-schema";

/**
 * Renders a prerequisite bridge mod. These are foundation units that sit
 * before the canonical lessons they unlock; they add estimated time but are not
 * renamed "day 31" etc. They are self-paced and browsable.
 */
export function PrerequisiteView({ module: mod }: { module: PrerequisiteModule }) {
  const { loading } = useProgress();

  return (
    <div className="space-y-6">
      <div>
        <nav aria-label="Breadcrumb" className="mb-2 text-xs text-ink-faint">
          <Link href="/learn/plan" className="hover:underline">My plan</Link> / Bridge
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="core">Prerequisite bridge</Pill>
          <Pill tone="neutral">{SKILL_AREA_LABELS[mod.skillArea]}</Pill>
          <span className="text-xs text-ink-faint">{formatMinutes(mod.estimatedMinutes)} estimated</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold text-navy sm:text-3xl">{mod.title}</h1>
        <p className="mt-1 max-w-reading text-sm text-ink-muted">{mod.targetGap}</p>
      </div>

      {mod.unlocksLessonIds.length > 0 && (
        <Card>
          <SectionTitle>This prepares you for</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {mod.unlocksLessonIds.map((lid) => {
              const day = Number(lid.replace("day-", ""));
              return (
                <Link
                  key={lid}
                  href={`/learn/day/${day}`}
                  className="rounded-md border border-navy-600/20 px-3 py-1.5 text-sm text-action hover:bg-surface-sunken"
                >
                  Day {day}
                </Link>
              );
            })}
          </div>
        </Card>
      )}

      {mod.explanation.map((block, i) => (
        <Card key={i}>
          <SectionTitle>{block.heading}</SectionTitle>
          <div className="prose-reading text-sm text-ink">{block.body}</div>
          {block.code && <div className="mt-2"><CodeBlock code={block.code} lang={block.codeLang} /></div>}
        </Card>
      ))}

      {mod.exercises.length > 0 && (
        <Card>
          <SectionTitle>Practice</SectionTitle>
          <ul className="space-y-3">
            {mod.exercises.map((ex, i) => (
              <li key={i}>
                <p className="text-sm font-medium text-navy">{ex.prompt}</p>
                <details className="mt-1">
                  <summary className="cursor-pointer text-sm text-action">Show answer</summary>
                  <p className="mt-1 rounded-lg bg-surface-sunken p-2 text-sm text-ink">{ex.answer}</p>
                </details>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <SectionTitle>Check yourself</SectionTitle>
        <p className="text-sm font-medium text-navy">{mod.checkpoint.question}</p>
        <details className="mt-1">
          <summary className="cursor-pointer text-sm text-action">Reveal</summary>
          <p className="mt-1 rounded-lg bg-surface-sunken p-2 text-sm text-ink">{mod.checkpoint.answer}</p>
        </details>
        <p className="mt-3 rounded-lg bg-surface-sunken p-2 text-xs text-ink-faint">
          <span className="font-medium text-ink">Evidence: </span>
          {mod.evidencePrompt}
        </p>
      </Card>

      {mod.sourceIds.length > 0 && (
        <Card>
          <SectionTitle>Sources</SectionTitle>
          <ul className="space-y-2">
            {mod.sourceIds.map((sid) => {
              const s = getSourceById(sid) ?? getSourceV2(sid);
              if (!s) return null;
              return (
                <li key={sid} className="text-sm">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-action hover:underline">
                    {s.title}
                  </a>
                  <span className="text-ink-faint"> · {s.publisher}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {!loading && (
        <div className="flex justify-between">
          <Link href="/learn/plan" className="rounded-md border border-navy-600/20 px-3 py-2 text-sm text-ink hover:bg-surface-sunken">
            ← Back to plan
          </Link>
        </div>
      )}
    </div>
  );
}
