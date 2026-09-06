"use client";

import { useMemo, useState } from "react";
import { getSources, getLessons } from "@/lib/content/content";
import { Card, Pill } from "@/components/ui";

export function ResourcesBrowser() {
  const sources = getSources();
  const lessons = getLessons();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [coreOnly, setCoreOnly] = useState(false);

  // Which lessons assign each source, and whether any assignment is core.
  const usage = useMemo(() => {
    const map = new Map<string, { days: number[]; core: boolean }>();
    for (const lesson of lessons) {
      for (const a of lesson.resourceAssignments) {
        const entry = map.get(a.sourceId) ?? { days: [], core: false };
        entry.days.push(lesson.day);
        if (a.priority.toLowerCase().startsWith("core")) entry.core = true;
        map.set(a.sourceId, entry);
      }
    }
    return map;
  }, [lessons]);

  const types = useMemo(
    () => ["all", ...Array.from(new Set(sources.map((s) => s.type))).sort()],
    [sources],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sources.filter((s) => {
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (coreOnly && !usage.get(s.id)?.core) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.publisher.toLowerCase().includes(q) ||
        (s.why ?? "").toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q)
      );
    });
  }, [sources, query, typeFilter, coreOnly, usage]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="res-search" className="mb-1 block text-sm font-medium text-navy">
            Search resources
          </label>
          <input
            id="res-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title, publisher or topic"
            className="w-full rounded-lg border border-navy-600/20 bg-white p-2.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="res-type" className="mb-1 block text-sm font-medium text-navy">
            Type
          </label>
          <select
            id="res-type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-navy-600/20 bg-white p-2.5 text-sm"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "All types" : t}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 pb-2.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={coreOnly}
            onChange={(e) => setCoreOnly(e.target.checked)}
            className="h-4 w-4 accent-action"
          />
          Core only
        </label>
      </div>

      <p className="text-sm text-ink-muted">
        {filtered.length} of {sources.length} sources
      </p>

      {filtered.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-muted">
            No sources match your search. Try a different term or clear the
            filters.
          </p>
        </Card>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {filtered.map((s) => {
            const use = usage.get(s.id);
            return (
              <li key={s.id}>
                <Card className="h-full">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Pill tone={use?.core ? "core" : "optional"}>
                      {use?.core ? "Core" : "Optional / reference"}
                    </Pill>
                    <span className="text-xs text-ink-faint">{s.type}</span>
                  </div>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-action hover:underline"
                  >
                    {s.title}
                  </a>
                  <p className="text-xs text-ink-faint">{s.publisher}</p>
                  {s.why && <p className="mt-1.5 text-sm text-ink-muted">{s.why}</p>}
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-faint">
                    <span>
                      {s.publishedOrUpdated
                        ? `Updated: ${s.publishedOrUpdated}`
                        : s.dateNote ?? "No date recorded"}
                    </span>
                    {s.verifiedOn && <span>Checked: {s.verifiedOn}</span>}
                  </div>
                  {use && (
                    <p className="mt-2 text-xs text-ink-faint">
                      Used on day(s): {[...new Set(use.days)].sort((a, b) => a - b).join(", ")}
                    </p>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
