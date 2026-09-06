"use client";

import { useProgress } from "@/lib/progress/client-store";

const LABELS: Record<string, { text: string; cls: string }> = {
  idle: { text: "Up to date", cls: "bg-white/10 text-slate-200" },
  saving: { text: "Saving…", cls: "bg-amber-400/20 text-amber-100" },
  "saved-cloud": { text: "Saved to cloud", cls: "bg-progress-soft/30 text-green-100" },
  "saved-local": { text: "Saved on this device", cls: "bg-white/10 text-slate-200" },
  "offline-pending": { text: "Offline · will retry", cls: "bg-amber-400/20 text-amber-100" },
  conflict: { text: "Conflict", cls: "bg-red-500/30 text-red-100" },
  error: { text: "Save failed", cls: "bg-red-500/30 text-red-100" },
};

export function SaveStatusBadge() {
  const { saveStatus, storageMode } = useProgress();
  const info = LABELS[saveStatus] ?? LABELS.idle;

  // Honest labelling: never say "cloud" when running local.
  let text = info.text;
  if (saveStatus === "idle") {
    text = storageMode === "blob" ? "Cloud storage" : "Device storage";
  }

  return (
    <span
      role="status"
      aria-live="polite"
      className={`hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline ${info.cls}`}
    >
      {text}
    </span>
  );
}
