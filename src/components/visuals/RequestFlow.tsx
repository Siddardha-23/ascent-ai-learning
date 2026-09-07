"use client";

import { useEffect, useState } from "react";
import { VisualFrame, useReducedMotion } from "./VisualFrame";

const STEPS = [
  { label: "Browser", detail: "sends an HTTP request" },
  { label: "API / route", detail: "matches a handler" },
  { label: "Model / retrieval / tool", detail: "produces a result" },
  { label: "Response", detail: "returned to the browser" },
];

/** request-flow: browser -> API -> model/retrieval/tool -> response. */
export function RequestFlow() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing || reduced) return;
    const t = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 1100);
    return () => clearInterval(t);
  }, [playing, reduced]);

  return (
    <VisualFrame
      title="How a request reaches a model"
      textAlt="A request flows left to right: the browser sends an HTTP request, the API matches a handler, the handler calls a model, retrieval or a tool, and a response returns to the browser. A model call is just one step behind a handler."
      controls={{
        playing,
        onToggle: () => setPlaying((p) => !p),
        onReset: () => {
          setActive(0);
          setPlaying(false);
        },
      }}
    >
      <ol className="flex flex-wrap items-stretch gap-2">
        {STEPS.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-lg border p-2.5 text-left text-sm transition ${
                active === i
                  ? "border-action bg-action-soft/50"
                  : "border-navy-600/15 bg-surface-sunken"
              }`}
            >
              <span className="block font-medium text-navy">{s.label}</span>
              <span className="block text-xs text-ink-faint">{s.detail}</span>
            </button>
            {i < STEPS.length - 1 && <span aria-hidden className="text-ink-faint">→</span>}
          </li>
        ))}
      </ol>
    </VisualFrame>
  );
}
