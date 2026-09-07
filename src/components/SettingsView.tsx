"use client";

import { useRef, useState } from "react";
import { useProgress } from "@/lib/progress/client-store";
import { CONTENT_VERSION } from "@/lib/content/content";
import {
  createBackup,
  parseBackup,
  stateFromBackup,
  resetState,
  type ImportPreview,
} from "@/lib/progress/backup";
import { Card, SectionTitle } from "@/components/ui";
import { formatMinutes } from "@/lib/date";
import { completedCoreTaskCount } from "@/lib/progress/completion";
import { AIConsentPanel } from "@/components/ai/AIConsentPanel";

export function SettingsView() {
  const { state, dispatch, replaceState, profileId, displayName, storageMode } =
    useProgress();
  const [target, setTarget] = useState(state.settings.weeklyTargetMinutes);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function exportBackup() {
    const backup = createBackup(state);
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ascent-backup-${profileId}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setImportError(null);
    setPreview(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const result = parseBackup(text, profileId, CONTENT_VERSION);
    if (!result.ok) {
      setImportError(result.message);
      return;
    }
    setPreview(result);
  }

  function applyImport() {
    if (!preview) return;
    replaceState(stateFromBackup(preview.backup, CONTENT_VERSION));
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function doReset() {
    replaceState(
      resetState(profileId, CONTENT_VERSION, state.settings.timezone, displayName),
    );
    setConfirmReset(false);
  }

  const currentTasks = completedCoreTaskCount(state);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-ink-muted">
          For {displayName}. Storage mode:{" "}
          <span className="font-medium">
            {storageMode === "blob"
              ? "private cloud (Vercel Blob)"
              : storageMode === "local"
                ? "local development (this device / server)"
                : "checking…"}
          </span>
          .
        </p>
      </div>

      {/* Weekly target */}
      <Card>
        <SectionTitle>Weekly learning target</SectionTitle>
        <p className="mb-3 text-sm text-ink-muted">
          Sets your encouragement goal only. It never changes course completion.
        </p>
        <div className="flex items-end gap-3">
          <div>
            <label htmlFor="weekly-target" className="mb-1 block text-sm text-ink-muted">
              Minutes per week
            </label>
            <input
              id="weekly-target"
              type="number"
              min={0}
              max={10080}
              step={15}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-32 rounded-lg border border-navy-600/20 bg-white p-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: "setWeeklyTarget", minutes: target })}
            className="rounded-lg bg-action px-4 py-2 text-sm font-medium text-white hover:bg-action-hover"
          >
            Save target
          </button>
          <span className="pb-2 text-sm text-ink-faint">
            = {formatMinutes(target)} / week
          </span>
        </div>
      </Card>

      {/* Timezone */}
      <Card>
        <SectionTitle>Timezone</SectionTitle>
        <p className="text-sm text-ink-muted">
          Sessions are dated in your local time. Detected:{" "}
          <span className="font-medium">{state.settings.timezone}</span>.
        </p>
      </Card>

      {/* AI enhancement consent + status */}
      <AIConsentPanel />

      {/* Backup */}
      <Card>
        <SectionTitle>Backup &amp; restore</SectionTitle>
        <p className="mb-3 text-sm text-ink-muted">
          Export a versioned JSON backup of this profile, or import one. Import
          shows a preview and requires confirmation before replacing your state.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={exportBackup}
            className="rounded-lg border border-navy-600/20 px-4 py-2 text-sm font-medium text-ink hover:bg-surface-sunken"
          >
            Export backup
          </button>
          <label className="cursor-pointer rounded-lg border border-navy-600/20 px-4 py-2 text-sm font-medium text-ink hover:bg-surface-sunken">
            Choose backup file…
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              onChange={onFile}
              className="sr-only"
            />
          </label>
        </div>

        {importError && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {importError}
          </p>
        )}

        {preview && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">Import preview</p>
            <ul className="mt-1 text-sm text-amber-800">
              <li>Profile: {preview.backup.profileId}</li>
              <li>Exported: {new Date(preview.backup.exportedAt).toLocaleString()}</li>
              <li>
                Completed core tasks in backup:{" "}
                {completedCoreTaskCount(preview.backup.state)} (current: {currentTasks})
              </li>
            </ul>
            {preview.warnings.map((w) => (
              <p key={w} className="mt-1 text-xs text-amber-700">
                {w}
              </p>
            ))}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={applyImport}
                className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
              >
                Replace my current state
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="rounded-md border border-amber-400 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Reset */}
      <Card className="border-red-200">
        <SectionTitle>Reset this profile</SectionTitle>
        <p className="mb-3 text-sm text-ink-muted">
          Clears all progress, notes and sessions for{" "}
          {displayName} only. Other profiles are untouched. Export
          a backup first if you might want it back.
        </p>
        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Reset {displayName}&apos;s progress…
          </button>
        ) : (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">
              This cannot be undone. Are you sure?
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={exportBackup}
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
              >
                Export backup first
              </button>
              <button
                type="button"
                onClick={doReset}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Yes, reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-md border border-navy-600/20 px-3 py-1.5 text-sm text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
