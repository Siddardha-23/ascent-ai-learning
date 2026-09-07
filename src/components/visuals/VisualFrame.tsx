"use client";

import { useEffect, useRef, useState } from "react";

/** Detect the OS "reduce motion" preference. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}

/**
 * A shared, accessible wrapper for an interactive visual. Provides an optional
 * play/pause/reset control row and always exposes a text-equivalent via
 * `textAlt` (rendered in a details element and as an aria description).
 * Calculations inside visuals are real and deterministic.
 */
export function VisualFrame({
  title,
  textAlt,
  children,
  controls,
}: {
  title: string;
  textAlt: string;
  children: React.ReactNode;
  controls?: {
    playing: boolean;
    onToggle: () => void;
    onReset: () => void;
  };
}) {
  const descId = useRef(`viz-${Math.random().toString(36).slice(2, 8)}`).current;

  return (
    <figure
      className="rounded-xl border border-navy-600/12 bg-surface-raised p-4"
      role="group"
      aria-label={title}
      aria-describedby={descId}
    >
      <figcaption className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-navy">{title}</span>
        {controls && (
          <span className="flex gap-1.5">
            <button
              type="button"
              onClick={controls.onToggle}
              className="rounded-md border border-navy-600/20 px-2.5 py-1 text-xs font-medium text-ink hover:bg-surface-sunken"
              aria-pressed={controls.playing}
            >
              {controls.playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={controls.onReset}
              className="rounded-md border border-navy-600/20 px-2.5 py-1 text-xs font-medium text-ink hover:bg-surface-sunken"
            >
              Reset
            </button>
          </span>
        )}
      </figcaption>

      <div>{children}</div>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-ink-faint">
          Text description of this visual
        </summary>
        <p id={descId} className="mt-1 text-xs text-ink-muted">
          {textAlt}
        </p>
      </details>
    </figure>
  );
}
