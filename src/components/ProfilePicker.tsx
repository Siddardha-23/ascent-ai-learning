"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { normalizeProfileId } from "@/lib/progress/schema";

export function ProfilePicker() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = normalizeProfileId(name);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a name to continue.");
      return;
    }
    if (!normalizeProfileId(trimmed)) {
      setError("Please use letters or numbers in your name.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error === "invalid_name"
            ? "Please use letters or numbers in your name."
            : "Could not open that space. Try again.",
        );
      }
      router.push("/learn");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="profile-name" className="mb-1 block text-sm font-medium text-slate-200">
        Your name or username
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="profile-name"
          type="text"
          autoComplete="off"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Harshith"
          maxLength={80}
          disabled={busy}
          className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/95 p-3 text-sm text-ink shadow-sm focus:border-action focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className="shrink-0 rounded-lg bg-action px-5 py-3 text-sm font-semibold text-white transition hover:bg-action-hover disabled:opacity-60"
        >
          {busy ? "Opening…" : "Open my space"}
        </button>
      </div>
      {preview && name.trim() && (
        <p className="mt-2 text-xs text-slate-400">
          Your learning space: <span className="font-mono text-slate-300">{preview}</span>
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
