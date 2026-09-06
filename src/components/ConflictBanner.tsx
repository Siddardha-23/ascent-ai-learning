"use client";

import { useProgress } from "@/lib/progress/client-store";

/**
 * Conflict reconciliation UI (R8). Preserves both the local draft and the
 * remote version; never silently chooses last-write-wins for notes.
 */
export function ConflictBanner() {
  const { conflict, keepLocalOverRemote, acceptRemote } = useProgress();
  if (!conflict) return null;

  return (
    <div
      role="alertdialog"
      aria-labelledby="conflict-title"
      className="border-b border-amber-300 bg-amber-50"
    >
      <div className="mx-auto max-w-6xl px-4 py-3">
        <p id="conflict-title" className="text-sm font-semibold text-amber-900">
          This profile changed in another session
        </p>
        <p className="mt-1 text-sm text-amber-800">
          Your latest edits are kept safely on this device. Choose how to
          reconcile. Nothing is discarded until you decide.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={keepLocalOverRemote}
            className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
          >
            Keep my version and save
          </button>
          <button
            type="button"
            onClick={acceptRemote}
            className="rounded-md border border-amber-400 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
          >
            Load the other session&apos;s version
          </button>
        </div>
      </div>
    </div>
  );
}
