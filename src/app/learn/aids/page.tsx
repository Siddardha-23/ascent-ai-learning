import { ContextBudget } from "@/components/aids/ContextBudget";
import { WeightedSum } from "@/components/aids/WeightedSum";
import { Attention } from "@/components/aids/Attention";
import { ArchitectureDiagrams } from "@/components/aids/ArchitectureDiagrams";

export default function AidsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">Learning aids</h1>
        <p className="mt-1 max-w-reading text-sm text-ink-muted">
          Interactive, transparent tools that recompute from your inputs. These
          are educational computations with visible assumptions — not live model
          calls or a real tokenizer.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <WeightedSum />
        <Attention />
      </div>
      <ContextBudget />
      <ArchitectureDiagrams />
    </div>
  );
}
