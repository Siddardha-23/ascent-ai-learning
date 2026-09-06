import { GlossaryBrowser } from "@/components/GlossaryBrowser";

export default function GlossaryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">Glossary</h1>
        <p className="mt-1 max-w-reading text-sm text-ink-muted">
          Definitions with examples, the first lesson each term appears in, and
          linked sources. Distinct concepts (LangChain vs LangGraph, knowledge
          graphs vs computation graphs, memory vs cache) are kept separate.
        </p>
      </div>
      <GlossaryBrowser />
    </div>
  );
}
