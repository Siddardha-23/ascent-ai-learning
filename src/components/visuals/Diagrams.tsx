"use client";

import { useEffect, useState } from "react";
import { VisualFrame, useReducedMotion } from "./VisualFrame";

function FlowRow({ steps, active }: { steps: string[]; active?: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span
            className={`rounded-lg border px-3 py-1.5 ${
              active === i ? "border-action bg-action-soft/50" : "border-navy-600/15 bg-surface-sunken"
            } text-ink`}
          >
            {s}
          </span>
          {i < steps.length - 1 && <span aria-hidden className="text-ink-faint">→</span>}
        </li>
      ))}
    </ol>
  );
}

/** rag-pipeline: chunk -> embed -> retrieve -> rerank -> evidence -> answer/abstain. */
export function RagPipelineViz() {
  const reduced = useReducedMotion();
  const steps = ["Question", "Chunk & embed", "Retrieve top-k", "Rerank", "Evidence", "Answer or abstain"];
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing || reduced) return;
    const t = setInterval(() => setActive((a) => (a + 1) % steps.length), 1000);
    return () => clearInterval(t);
  }, [playing, reduced, steps.length]);
  return (
    <VisualFrame
      title="RAG pipeline"
      textAlt="A question is chunked and embedded, top-k relevant chunks are retrieved and optionally reranked, evidence is assembled, and the system answers with citations or abstains. Retrieval grounds the answer but does not guarantee truth."
      controls={{ playing, onToggle: () => setPlaying((p) => !p), onReset: () => { setActive(0); setPlaying(false); } }}
    >
      <FlowRow steps={steps} active={playing || active > 0 ? active : undefined} />
    </VisualFrame>
  );
}

/** tool-loop: model proposes -> policy check -> tool -> observe -> stop/continue. */
export function ToolLoopViz() {
  const steps = ["Goal", "Model proposes", "Policy check", "Tool runs", "Observe", "Stop or repeat"];
  return (
    <VisualFrame
      title="Tool-using agent loop"
      textAlt="An agent loops: the model proposes an action, the application checks policy and permissions, the tool runs, the agent observes the result, and decides to stop or repeat. The policy check between proposal and execution is where least privilege and human approval are enforced. A proposal is not permission."
    >
      <FlowRow steps={steps} />
      <p className="mt-2 text-xs text-ink-faint">
        The gate between &quot;Model proposes&quot; and &quot;Tool runs&quot; is application-enforced — not the model&apos;s decision.
      </p>
    </VisualFrame>
  );
}

/** langgraph: nodes, edges, a checkpoint/interrupt, and resume. */
export function LangGraphViz() {
  return (
    <VisualFrame
      title="LangGraph: nodes, edges, checkpoint"
      textAlt="A state graph runs Node A, an edge to Node B, then a human-approval checkpoint (interrupt) that persists state, then Node C on resume. Checkpoints make the graph durable and resumable."
    >
      <FlowRow steps={["Node A", "Node B", "Checkpoint / interrupt", "Node C"]} />
      <p className="mt-2 text-xs text-ink-faint">
        The checkpoint persists state so the graph can pause for approval and resume later.
      </p>
    </VisualFrame>
  );
}

/** graph-types: knowledge graph vs HNSW neighbor graph vs workflow graph. */
export function GraphTypesViz() {
  const [which, setWhich] = useState<"knowledge" | "hnsw" | "workflow">("knowledge");
  const copy = {
    knowledge: {
      title: "Knowledge graph",
      body: "Entities connected by explicit, typed relationships (e.g. Order —placed_by→ Customer). Answers questions about how things relate.",
    },
    hnsw: {
      title: "HNSW neighbor graph",
      body: "An approximate nearest-neighbor index over embeddings. Its edges connect vectors that are close, to make similarity search fast. It stores no business meaning.",
    },
    workflow: {
      title: "Workflow graph (LangGraph)",
      body: "Nodes are execution steps; edges are control flow. It orchestrates what runs next, not facts or similarity.",
    },
  } as const;
  return (
    <VisualFrame
      title="Three different 'graphs'"
      textAlt="Knowledge graphs store entities and typed relationships; HNSW graphs index embeddings for fast nearest-neighbor search; workflow graphs orchestrate execution steps. They solve different problems and should not be conflated."
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        {(["knowledge", "hnsw", "workflow"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setWhich(k)}
            className={`rounded-md border px-2.5 py-1 text-xs ${
              which === k ? "border-action bg-action-soft/50 text-action" : "border-navy-600/20 text-ink"
            }`}
          >
            {copy[k].title}
          </button>
        ))}
      </div>
      <p className="text-sm text-ink">
        <span className="font-semibold text-navy">{copy[which].title}: </span>
        {copy[which].body}
      </p>
    </VisualFrame>
  );
}

/** injection-boundary: untrusted data vs least-privilege action boundary. */
export function InjectionBoundaryViz() {
  return (
    <VisualFrame
      title="Prompt-injection boundary"
      textAlt="Retrieved documents and user messages are untrusted data. Instructions inside them must never gain the privileges of the system. A least-privilege boundary plus approvals means injected instructions cannot take actions."
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
          <p className="font-semibold text-amber-900">Untrusted zone</p>
          <p className="text-amber-800">Retrieved docs · user messages · tool outputs. Treated as data, never as commands.</p>
        </div>
        <div className="rounded-lg border border-progress/40 bg-progress-soft/40 p-3 text-sm">
          <p className="font-semibold text-progress">Least-privilege actions</p>
          <p className="text-ink-muted">Every action passes an application policy check and needs only the minimum permission (plus approval for risky ones).</p>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-ink-faint">
        Injected &quot;ignore your instructions&quot; text stays in the untrusted zone — it cannot cross into actions.
      </p>
    </VisualFrame>
  );
}

/** cache-taxonomy: distinguish memory/context/caches. */
export function CacheTaxonomyViz() {
  const items = [
    { name: "Model weights", desc: "Learned parameters. Fixed at inference." },
    { name: "Conversation context", desc: "The current input window sent each call." },
    { name: "Long-term memory", desc: "Durable recall the app stores and retrieves." },
    { name: "RAG index", desc: "Searchable embeddings of documents." },
    { name: "Answer cache", desc: "Reuses a final response for a repeated request." },
    { name: "Embedding cache", desc: "Reuses computed vectors." },
    { name: "KV / prefix cache", desc: "Speeds token generation within a request." },
  ];
  return (
    <VisualFrame
      title="Memory & cache taxonomy"
      textAlt="Weights, conversation context, long-term memory, the RAG index, and the various caches (answer, embedding, KV/prefix) are distinct things serving different purposes; they should not be conflated."
    >
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {items.map((i) => (
          <li key={i.name} className="rounded-lg border border-navy-600/12 p-2 text-sm">
            <span className="font-medium text-navy">{i.name}</span>
            <span className="block text-xs text-ink-faint">{i.desc}</span>
          </li>
        ))}
      </ul>
    </VisualFrame>
  );
}
