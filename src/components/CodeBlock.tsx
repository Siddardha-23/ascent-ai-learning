"use client";

import { useState } from "react";

/**
 * Safe code block: renders code as text only (never dangerouslySetInnerHTML),
 * scrolls horizontally on small screens, and offers a copy button with an
 * accessible, announced result.
 */
export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: non-fatal */
    }
  }

  return (
    <div className="group relative">
      {lang && (
        <span className="absolute left-2 top-2 rounded bg-navy-700/80 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-300">
          {lang}
        </span>
      )}
      <button
        type="button"
        onClick={copy}
        className="absolute right-2 top-2 rounded-md border border-white/20 bg-navy-700/80 px-2 py-1 text-xs text-slate-100 hover:bg-navy-600"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Code copied to clipboard" : ""}
      </span>
      <pre className="overflow-x-auto rounded-lg bg-navy-900 p-3 pt-9 text-sm text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
