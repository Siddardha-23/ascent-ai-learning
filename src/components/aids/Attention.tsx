"use client";

import { useState } from "react";
import { Card, SectionTitle } from "@/components/ui";

/**
 * Attention aid (R9): small fixed vectors, dot-product scores, optional causal
 * mask, softmax-normalized weights. Educational computation with visible
 * assumptions — not a live model.
 */
const TOKENS = ["the", "animal", "it"];
const VECTORS: number[][] = [
  [1, 0, 1],
  [0, 1, 1],
  [1, 1, 0],
];

function dot(a: number[], b: number[]) {
  return a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
}

function softmax(xs: number[]): number[] {
  const max = Math.max(...xs.filter((x) => Number.isFinite(x)));
  const exps = xs.map((x) => (Number.isFinite(x) ? Math.exp(x - max) : 0));
  const sum = exps.reduce((s, v) => s + v, 0) || 1;
  return exps.map((e) => e / sum);
}

export function Attention() {
  const [causal, setCausal] = useState(true);
  const [queryIdx, setQueryIdx] = useState(2);

  const q = VECTORS[queryIdx];
  const rawScores = VECTORS.map((k, j) => {
    if (causal && j > queryIdx) return -Infinity; // mask future
    return dot(q, k);
  });
  const weights = softmax(rawScores);

  return (
    <Card>
      <SectionTitle>Attention (single head)</SectionTitle>
      <p className="mb-3 text-sm text-ink-muted">
        Fixed example vectors. The query token compares to every key via a dot
        product; scores are normalized with softmax. A causal mask blocks future
        tokens. This shows the mechanism, not model understanding.
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-4">
        <label className="text-sm">
          <span className="mr-2 text-navy">Query token</span>
          <select
            value={queryIdx}
            onChange={(e) => setQueryIdx(Number(e.target.value))}
            className="rounded border border-navy-600/20 bg-white p-1"
          >
            {TOKENS.map((t, i) => (
              <option key={t} value={i}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={causal}
            onChange={(e) => setCausal(e.target.checked)}
            className="h-4 w-4 accent-action"
          />
          Causal mask
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="text-sm">
          <caption className="sr-only">
            Attention scores and weights from the query token to each key token
          </caption>
          <thead>
            <tr className="text-ink-faint">
              <th className="px-2 text-left">key token</th>
              <th className="px-2">raw score (q·k)</th>
              <th className="px-2">attention weight</th>
            </tr>
          </thead>
          <tbody>
            {TOKENS.map((t, j) => (
              <tr key={t} className={j === queryIdx ? "font-semibold" : ""}>
                <td className="px-2 text-ink">{t}</td>
                <td className="px-2 text-right text-ink-muted">
                  {rawScores[j] === -Infinity ? "masked" : rawScores[j].toFixed(2)}
                </td>
                <td className="px-2 text-right text-navy">
                  {(weights[j] * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-ink-faint">
        Weights sum to 100%. With the causal mask on, the query cannot attend to
        tokens that come after it.
      </p>
    </Card>
  );
}
