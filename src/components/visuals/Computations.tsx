"use client";

import { useEffect, useState } from "react";
import { VisualFrame, useReducedMotion } from "./VisualFrame";

/** weighted-sum: features x weights + bias, recomputed live. */
export function WeightedSumViz() {
  const [features, setFeatures] = useState([3, 5, 1]);
  const [weights, setWeights] = useState([0.4, -0.2, 0.9]);
  const [bias, setBias] = useState(0.5);
  const terms = features.map((f, i) => f * (weights[i] ?? 0));
  const output = terms.reduce((s, t) => s + t, bias);

  return (
    <VisualFrame
      title="Weighted sum (one neuron)"
      textAlt={`Output equals the sum of each feature times its weight, plus a bias. With the current values the output is ${output.toFixed(2)}.`}
    >
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
                  onChange={(e) =>
                    setFeatures((p) => p.map((x, idx) => (idx === i ? Number(e.target.value) : x)))
                  }
                  className="w-20 rounded border border-navy-600/20 bg-white p-1 text-right"
                />
              </td>
              <td className="px-2">
                <input
                  type="number"
                  step="0.1"
                  value={weights[i]}
                  aria-label={`weight ${i}`}
                  onChange={(e) =>
                    setWeights((p) => p.map((x, idx) => (idx === i ? Number(e.target.value) : x)))
                  }
                  className="w-20 rounded border border-navy-600/20 bg-white p-1 text-right"
                />
              </td>
              <td className="px-2 text-right text-ink-muted">{(f * (weights[i] ?? 0)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <label className="mt-2 flex items-center gap-2 text-sm">
        <span className="text-navy">bias</span>
        <input
          type="number"
          step="0.1"
          value={bias}
          onChange={(e) => setBias(Number(e.target.value))}
          className="w-20 rounded border border-navy-600/20 bg-white p-1 text-right"
        />
      </label>
      <p className="mt-2 text-lg font-semibold text-navy">Output = {output.toFixed(2)}</p>
    </VisualFrame>
  );
}

/** forward-backprop: 1-weight loss curve + one gradient-descent step. */
export function ForwardBackpropViz() {
  const target = 2.0;
  const [w, setW] = useState(0.2);
  const [lr, setLr] = useState(0.3);
  // loss = (w - target)^2 ; gradient = 2(w - target)
  const loss = (x: number) => (x - target) ** 2;
  const grad = 2 * (w - target);
  const nextW = w - lr * grad;

  // Simple SVG loss curve.
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = -1 + (i / 40) * 5; // -1..4
    const y = loss(x);
    const px = ((x + 1) / 5) * 200;
    const py = 90 - Math.min(88, y * 12);
    pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  const dotX = ((w + 1) / 5) * 200;
  const dotY = 90 - Math.min(88, loss(w) * 12);

  return (
    <VisualFrame
      title="Loss curve & one gradient step"
      textAlt={`The loss is (w - ${target})². At w=${w.toFixed(2)} the loss is ${loss(w).toFixed(2)} and the gradient is ${grad.toFixed(2)}. One step with learning rate ${lr} moves w to ${nextW.toFixed(2)}.`}
    >
      <svg viewBox="0 0 200 100" className="h-32 w-full" role="img" aria-hidden>
        <polyline points={pts.join(" ")} fill="none" stroke="#2563eb" strokeWidth="1.5" />
        <circle cx={dotX} cy={dotY} r="3" fill="#15803d" />
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-navy">w</span>
          <input type="range" min={-1} max={4} step={0.05} value={w} onChange={(e) => setW(Number(e.target.value))} />
          <span className="w-12 text-right text-ink-muted">{w.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-navy">learning rate</span>
          <input type="range" min={0.05} max={1} step={0.05} value={lr} onChange={(e) => setLr(Number(e.target.value))} />
          <span className="w-10 text-right text-ink-muted">{lr.toFixed(2)}</span>
        </label>
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        gradient = {grad.toFixed(2)} · after one step w → <span className="font-semibold text-navy">{nextW.toFixed(2)}</span>
        {lr > 0.9 && <span className="text-red-600"> (large rate can overshoot)</span>}
      </p>
    </VisualFrame>
  );
}

/** tokenization: split text into pseudo-tokens + temperature sampling demo. */
export function TokenizationViz() {
  const [text, setText] = useState("Atlas Support handles refunds");
  // Deterministic pseudo-tokenizer: split on spaces and long words into chunks.
  const tokens = text
    .split(/(\s+)/)
    .filter((t) => t.length > 0)
    .flatMap((t) => (t.trim().length > 6 ? [t.slice(0, 4), t.slice(4)] : [t]));

  const [temp, setTemp] = useState(0.7);
  // Fixed logits for a toy next-token distribution.
  const logits = [{ t: "refund", z: 2.0 }, { t: "ticket", z: 1.2 }, { t: "reply", z: 0.8 }, { t: "escalate", z: 0.2 }];
  const scaled = logits.map((l) => ({ ...l, e: Math.exp(l.z / Math.max(0.05, temp)) }));
  const sum = scaled.reduce((s, l) => s + l.e, 0);
  const probs = scaled.map((l) => ({ t: l.t, p: l.e / sum }));

  return (
    <VisualFrame
      title="Tokens & next-token sampling (simulation)"
      textAlt={`Text is split into ${tokens.length} illustrative tokens (not a provider's exact tokenizer). Lowering temperature concentrates probability on the most likely next token; raising it spreads it out.`}
    >
      <label htmlFor="tok-input" className="mb-1 block text-sm text-ink-muted">
        Text
      </label>
      <input
        id="tok-input"
        type="text"
        value={text}
        maxLength={80}
        onChange={(e) => setText(e.target.value)}
        className="mb-2 w-full rounded-lg border border-navy-600/20 bg-white p-2 text-sm"
      />
      <div className="flex flex-wrap gap-1">
        {tokens.map((t, i) => (
          <span key={i} className="rounded bg-action-soft/60 px-1.5 py-0.5 font-mono text-xs text-action">
            {t === " " ? "␣" : t}
          </span>
        ))}
      </div>
      <p className="mt-1 text-xs text-ink-faint">
        {tokens.length} illustrative tokens (labelled simulation, not an exact tokenizer).
      </p>

      <label className="mt-3 flex items-center gap-2 text-sm">
        <span className="text-navy">temperature</span>
        <input type="range" min={0.05} max={1.5} step={0.05} value={temp} onChange={(e) => setTemp(Number(e.target.value))} />
        <span className="w-10 text-right text-ink-muted">{temp.toFixed(2)}</span>
      </label>
      <ul className="mt-1 space-y-1">
        {probs.map((p) => (
          <li key={p.t} className="flex items-center gap-2 text-xs">
            <span className="w-16 font-mono text-ink">{p.t}</span>
            <span className="h-2 rounded bg-action" style={{ width: `${p.p * 140}px` }} aria-hidden />
            <span className="text-ink-faint">{(p.p * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </VisualFrame>
  );
}

/** attention: query vs keys, softmax weights, causal mask toggle. */
export function AttentionViz() {
  const TOKENS = ["the", "animal", "it"];
  const VECTORS = [
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 0],
  ];
  const [q, setQ] = useState(2);
  const [causal, setCausal] = useState(true);
  const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
  const raw = VECTORS.map((k, j) => (causal && j > q ? -Infinity : dot(VECTORS[q], k)));
  const max = Math.max(...raw.filter(Number.isFinite));
  const exps = raw.map((x) => (Number.isFinite(x) ? Math.exp(x - max) : 0));
  const sum = exps.reduce((s, v) => s + v, 0) || 1;
  const weights = exps.map((e) => e / sum);

  return (
    <VisualFrame
      title="Attention (single head)"
      textAlt={`The query token compares to each key by dot product; scores are softmax-normalized. With the causal mask ${causal ? "on" : "off"}, the query ${causal ? "cannot" : "can"} attend to later tokens.`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-navy">query</span>
          <select value={q} onChange={(e) => setQ(Number(e.target.value))} className="rounded border border-navy-600/20 bg-white p-1">
            {TOKENS.map((t, i) => (
              <option key={t} value={i}>{t}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-ink">
          <input type="checkbox" checked={causal} onChange={(e) => setCausal(e.target.checked)} className="h-4 w-4 accent-action" />
          causal mask
        </label>
      </div>
      <table className="text-sm">
        <thead>
          <tr className="text-ink-faint">
            <th className="px-2 text-left">key</th>
            <th className="px-2">score</th>
            <th className="px-2">weight</th>
          </tr>
        </thead>
        <tbody>
          {TOKENS.map((t, j) => (
            <tr key={t} className={j === q ? "font-semibold" : ""}>
              <td className="px-2 text-ink">{t}</td>
              <td className="px-2 text-right text-ink-muted">{raw[j] === -Infinity ? "masked" : raw[j].toFixed(2)}</td>
              <td className="px-2 text-right text-navy">{(weights[j] * 100).toFixed(0)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </VisualFrame>
  );
}

/** embeddings: 2D points, cosine similarity + nearest neighbor to a query. */
export function EmbeddingsViz() {
  const POINTS = [
    { label: "refund policy", x: 0.8, y: 0.3 },
    { label: "return window", x: 0.7, y: 0.45 },
    { label: "login error", x: -0.6, y: 0.7 },
    { label: "password reset", x: -0.7, y: 0.55 },
  ];
  const [qx, setQx] = useState(0.75);
  const [qy, setQy] = useState(0.35);
  const cos = (ax: number, ay: number, bx: number, by: number) => {
    const dot = ax * bx + ay * by;
    const na = Math.hypot(ax, ay) || 1;
    const nb = Math.hypot(bx, by) || 1;
    return dot / (na * nb);
  };
  const scored = POINTS.map((p) => ({ ...p, sim: cos(qx, qy, p.x, p.y) })).sort((a, b) => b.sim - a.sim);
  const nearest = scored[0];

  return (
    <VisualFrame
      title="Embeddings & cosine similarity"
      textAlt={`Points near each other in vector space are semantically similar. The nearest neighbor to the query is "${nearest.label}". This differs from a knowledge graph, which stores explicit relationships rather than distances.`}
    >
      <svg viewBox="-1.1 -1.1 2.2 2.2" className="h-40 w-full rounded bg-surface-sunken" role="img" aria-hidden>
        <line x1="-1.1" y1="0" x2="1.1" y2="0" stroke="#cbd5e1" strokeWidth="0.01" />
        <line x1="0" y1="-1.1" x2="0" y2="1.1" stroke="#cbd5e1" strokeWidth="0.01" />
        {POINTS.map((p) => (
          <circle key={p.label} cx={p.x} cy={-p.y} r="0.04" fill={p.label === nearest.label ? "#15803d" : "#2563eb"} />
        ))}
        <circle cx={qx} cy={-qy} r="0.05" fill="#dc2626" />
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-navy">query x</span>
          <input type="range" min={-1} max={1} step={0.05} value={qx} onChange={(e) => setQx(Number(e.target.value))} />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-navy">query y</span>
          <input type="range" min={-1} max={1} step={0.05} value={qy} onChange={(e) => setQy(Number(e.target.value))} />
        </label>
      </div>
      <ol className="mt-1 space-y-0.5 text-xs">
        {scored.map((p) => (
          <li key={p.label} className="flex justify-between">
            <span className="text-ink">{p.label}</span>
            <span className="text-ink-faint">cos {p.sim.toFixed(2)}</span>
          </li>
        ))}
      </ol>
    </VisualFrame>
  );
}
