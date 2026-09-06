import { Card, SectionTitle } from "@/components/ui";

/** Simple accessible flow diagrams with text alternatives (R9, design.md). */
function Flow({ steps, label }: { steps: string[]; label: string }) {
  return (
    <div>
      <ol
        className="flex flex-wrap items-center gap-2 text-sm"
        aria-label={label}
      >
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span className="rounded-lg border border-navy-600/20 bg-surface-sunken px-3 py-1.5 text-ink">
              {s}
            </span>
            {i < steps.length - 1 && (
              <span aria-hidden className="text-ink-faint">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ArchitectureDiagrams() {
  return (
    <Card>
      <SectionTitle>Architecture comparisons</SectionTitle>
      <p className="mb-4 text-sm text-ink-muted">
        Three patterns you will build. Each is a different shape of control flow.
      </p>

      <div className="space-y-5">
        <div>
          <p className="mb-1.5 text-sm font-semibold text-navy">RAG (retrieval)</p>
          <Flow
            label="Retrieval augmented generation flow"
            steps={["Question", "Retrieve evidence", "Ground the prompt", "Model answer + citations"]}
          />
          <p className="mt-1 text-xs text-ink-faint">
            A linear pipeline. Retrieval adds grounding; it does not guarantee a
            factually correct answer.
          </p>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-navy">Tool loop (agent)</p>
          <Flow
            label="Tool-using agent loop"
            steps={["Goal", "Model decides", "Call a tool", "Observe result", "Repeat or finish"]}
          />
          <p className="mt-1 text-xs text-ink-faint">
            A loop. A proposed tool call is not permission — application code
            authorizes actions.
          </p>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-navy">State graph (LangGraph)</p>
          <Flow
            label="State graph with nodes, edges and a checkpoint"
            steps={["Node A", "Edge", "Node B", "Human approval (checkpoint)", "Node C"]}
          />
          <p className="mt-1 text-xs text-ink-faint">
            Explicit nodes, edges and durable checkpoints. Different from a
            knowledge graph (facts) or a computation graph (autograd).
          </p>
        </div>
      </div>
    </Card>
  );
}
