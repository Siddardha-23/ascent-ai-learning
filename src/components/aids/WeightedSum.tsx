"use client";

import { useState } from "react";
import { Card, SectionTitle } from "@/components/ui";

/** Weighted-sum aid (R9). Editable features and weights; computed output. */
export function WeightedSum() {
  const [features, setFeatures] = useState([3, 5, 1]);
  const [weights, setWeights] = useState([0.4, -0.2, 0.9]);
  const [bias, setBias] = useState(0.5);

  const terms = features.map((f, i) => f * (weights[i] ?? 0));
  const output = terms.reduce((s, t) => s + t, bias);

  function setF(i: number, v: number) {
    setFeatures((p) => p.map((x, idx) => (idx === i ? v : x)));
  }
  function setW(i: number, v: number) {
    setWeights((p) => p.map((x, idx) => (idx === i ? v : x)));
  }

  return (
    <Card>
      <SectionTitle>Weighted sum</SectionTitle>
      <p className="mb-3 text-sm text-ink-muted">
        The building block behind a single neuron: output = Σ(featureᵢ ×
        weightᵢ) + bias. Change any value and the result recomputes.
      </p>
      <div className="overflow-x-auto">
        <table className="text-sm">
          <thead>
            <tr className="text-ink-faint">
              <th className="px-2 text-left">i</th>
              <th className="px-2">feature</th>
              <th className="px-2">weight</th>
              <th className="px-2">product</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => (
              <tr key={i}>
                <td className="px-2 text-ink-faint">{i}</td>
                <td className="px-2">
                  <input
                    type="number"
                    step="0.1"
                    value={f}
                    aria-label={`feature ${i}`}
                    onChange={(e) => setF(i, Number(e.target.value))}
                    className="w-20 rounded border border-navy-600/20 bg-white p-1 text-right"
                  />
                </td>
                <td className="px-2">
                  <input
                    type="number"
                    step="0.1"
                    value={weights[i]}
                    aria-label={`weight ${i}`}
                    onChange={(e) => setW(i, Number(e.target.value))}
                    className="w-20 rounded border border-navy-600/20 bg-white p-1 text-right"
                  />
                </td>
                <td className="px-2 text-right text-ink-muted">
                  {(f * (weights[i] ?? 0)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-navy">bias</span>
          <input
            type="number"
            step="0.1"
            value={bias}
            onChange={(e) => setBias(Number(e.target.value))}
            className="w-20 rounded border border-navy-600/20 bg-white p-1 text-right"
          />
        </label>
      </div>
      <p className="mt-3 text-lg font-semibold text-navy">
        Output = {output.toFixed(2)}
      </p>
      <p className="mt-1 text-xs text-ink-faint">
        Dimensions: {features.length} features × {features.length} weights → 1
        scalar output.
      </p>
    </Card>
  );
}
