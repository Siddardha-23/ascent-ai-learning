"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getGlossary, getLessonByDay, getSourceById } from "@/lib/content/content";
import { Card } from "@/components/ui";

export function GlossaryBrowser() {
  const terms = getGlossary();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        (t.example ?? "").toLowerCase().includes(q),
    );
  }, [terms, query]);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="glossary-search" className="mb-1 block text-sm font-medium text-navy">
          Search terms
        </label>
        <input
          id="glossary-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. attention, embedding, RAG"
          className="w-full rounded-lg border border-navy-600/20 bg-white p-2.5 text-sm"
        />
      </div>

      <p className="text-sm text-ink-muted">
        {filtered.length} of {terms.length} terms
      </p>

      {filtered.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-muted">
            No terms match &quot;{query}&quot;. Try another spelling or a broader
            word.
          </p>
        </Card>
      ) : (
        <dl className="grid gap-3 md:grid-cols-2">
          {filtered.map((t) => {
            const lesson = t.firstDay ? getLessonByDay(t.firstDay) : undefined;
            return (
              <div key={t.id}>
                <Card className="h-full">
                  <dt className="font-semibold text-navy">{t.term}</dt>
                  <dd className="mt-1 text-sm text-ink">{t.definition}</dd>
                  {t.example && (
                    <dd className="mt-1.5 text-sm text-ink-muted">
                      <span className="font-medium">Example: </span>
                      {t.example}
                    </dd>
                  )}
                  <dd className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint">
                    {lesson && (
                      <Link
                        href={`/learn/day/${lesson.day}`}
                        className="text-action hover:underline"
                      >
                        First seen: Day {lesson.day}
                      </Link>
                    )}
                    {(t.sourceIds ?? []).map((sid) => {
                      const src = getSourceById(sid);
                      if (!src) return null;
                      return (
                        <a
                          key={sid}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {src.title}
                        </a>
                      );
                    })}
                  </dd>
                </Card>
              </div>
            );
          })}
        </dl>
      )}
    </div>
  );
}
