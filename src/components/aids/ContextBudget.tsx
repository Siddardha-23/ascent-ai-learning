"use client";

import { useState } from "react";
import { Card, SectionTitle } from "@/components/ui";

interface Row {
  label: string;
  tokens: number;
}

/**
 * Context-budget worksheet (R9). Capacities and per-item counts are clearly
 * labeled as illustrative examples. This does NOT compute a real provider
 * tokenizer count from text.
 */
export function ContextBudget() {
  const [capacity, setCapacity] = useState(8000);
  const [reserveOutput, setReserveOutput] = useState(1000);
  const [rows, setRows] = useState<Row[]>([
    { label: "System instructions", tokens: 400 },
    { label: "Tool schemas", tokens: 700 },
    { label: "Conversation so far", tokens: 1200 },
    { label: "Retrieved evidence", tokens: 2500 },
    { label: "User message", tokens: 300 },
  ]);

  const used = rows.reduce((s, r) => s + r.tokens, 0) + reserveOutput;
  const remaining = capacity - used;

  function update(i: number, tokens: number) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, tokens } : r)));
  }

  return (
    <Card>
      <SectionTitle>Context-budget worksheet</SectionTitle>
      <p className="mb-3 text-sm text-ink-muted">
        Illustrative only. These are assumed example token counts, not a real
        tokenizer measurement. A real tokenizer must name its model and be run
        on actual text.
      </p>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy">Assumed capacity (tokens)</span>
          <input
            type="number"
            min={0}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-full rounded-lg border border-navy-600/20 bg-white p-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy">Reserved for output</span>
          <input
            type="number"
            min={0}
            value={reserveOutput}
            onChange={(e) => setReserveOutput(Number(e.target.value))}
            className="w-full rounded-lg border border-navy-600/20 bg-white p-2"
          />
        </label>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink-faint">
            <th className="pb-1 font-medium">Category</th>
            <th className="pb-1 text-right font-medium">Tokens</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.label} className="border-t border-navy-600/10">
              <td className="py-1.5 text-ink">{r.label}</td>
              <td className="py-1.5 text-right">
                <input
                  type="number"
                  min={0}
                  value={r.tokens}
                  onChange={(e) => update(i, Number(e.target.value))}
                  aria-label={`${r.label} tokens`}
                  className="w-24 rounded border border-navy-600/20 bg-white p-1 text-right"
                />
              </td>
            </tr>
          ))}
          <tr className="border-t border-navy-600/10">
            <td className="py-1.5 text-ink">Reserved output</td>
            <td className="py-1.5 text-right text-ink-muted">{reserveOutput}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="border-t border-navy-600/20 font-semibold">
            <td className="pt-2 text-navy">Remaining</td>
            <td
              className={`pt-2 text-right ${remaining < 0 ? "text-red-600" : "text-progress"}`}
            >
              {remaining.toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>
      {remaining < 0 && (
        <p className="mt-2 text-sm text-red-600">
          Over budget by {Math.abs(remaining).toLocaleString()} tokens. Trim
          evidence or history, or raise capacity.
        </p>
      )}
    </Card>
  );
}
