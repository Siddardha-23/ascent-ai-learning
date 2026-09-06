import type { Source } from "@/lib/content/schema";
import { Pill } from "@/components/ui";

export function ResourceCard({
  source,
  priority,
  instruction,
}: {
  source: Source | undefined;
  priority?: string;
  instruction?: string;
}) {
  if (!source) {
    // Honest unavailable state (R7): do not fabricate a replacement.
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
        A referenced resource could not be found in the source list. This is a
        content issue, not a completed resource.
      </div>
    );
  }

  const isCore = (priority ?? "").toLowerCase().startsWith("core");

  return (
    <div className="rounded-lg border border-navy-600/12 bg-surface-raised p-4">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Pill tone={isCore ? "core" : "optional"}>{priority ?? source.type}</Pill>
        <span className="text-xs text-ink-faint">{source.type}</span>
      </div>
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-action hover:underline"
      >
        {source.title}
      </a>
      <p className="mt-0.5 text-xs text-ink-faint">{source.publisher}</p>
      {instruction && (
        <p className="mt-2 text-sm text-ink-muted">{instruction}</p>
      )}
      {source.why && (
        <p className="mt-1 text-xs text-ink-faint">Why: {source.why}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-faint">
        <span>
          {source.publishedOrUpdated
            ? `Published/updated: ${source.publishedOrUpdated}`
            : source.dateNote ?? "No publication date recorded"}
        </span>
        {source.verifiedOn && <span>Checked: {source.verifiedOn}</span>}
      </div>
      {source.access && (
        <p className="mt-1 text-xs text-ink-faint">{source.access}</p>
      )}
      <p className="mt-2 text-xs text-ink-faint">
        Opening a link does not mark a video or reading complete.
      </p>
    </div>
  );
}
