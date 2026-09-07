"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress/client-store";
import { fetchAIStatus, type AIStatusResponse } from "@/lib/ai/client";
import { Card, Pill, SectionTitle } from "@/components/ui";

const STATUS_LABEL: Record<string, string> = {
  disabled: "Disabled",
  unavailable: "Not configured",
  configured: "Configured",
  active: "Active",
};

/**
 * Consent + status panel for optional AI enhancement (R18). The learner must
 * opt in before any call; consent is revocable. Shows honest status and the
 * last routed model. The API key is NEVER shown or entered here.
 */
export function AIConsentPanel() {
  const { state, dispatch } = useProgress();
  const consent = state.v2?.ai?.consent ?? null;
  const [status, setStatus] = useState<AIStatusResponse | null>(null);

  useEffect(() => {
    let alive = true;
    fetchAIStatus().then((s) => {
      if (alive) setStatus(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  const lastModel = (() => {
    const cache = state.v2?.ai?.cache ?? [];
    return cache.length > 0 ? cache[cache.length - 1].model : null;
  })();

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionTitle>AI enhancement (optional)</SectionTitle>
        <Pill tone={status?.status === "configured" ? "core" : "neutral"}>
          {status ? STATUS_LABEL[status.status] : "Checking…"}
        </Pill>
      </div>

      <p className="text-sm text-ink-muted">
        Ascent works fully without AI — your plan and course never depend on it.
        If you opt in, selected non-personal facts (like skill-area IDs or an
        approved lesson excerpt) may be sent through OpenRouter to a third-party
        model to generate a friendlier explanation, an alternate analogy, or
        feedback on an explain-back answer. Free routed models may vary. Your
        name, notes, evidence and progress are never sent.
      </p>

      {status?.status === "disabled" && (
        <p className="mt-2 rounded-lg bg-surface-sunken p-2 text-xs text-ink-faint">
          AI enhancement is turned off for this deployment. You can still opt in
          here; calls will use the built-in deterministic explanations until it
          is enabled by configuration.
        </p>
      )}
      {status?.status === "unavailable" && (
        <p className="mt-2 rounded-lg bg-surface-sunken p-2 text-xs text-ink-faint">
          No AI provider key is configured on the server, so enhancements use the
          built-in deterministic explanations.
        </p>
      )}
      {status?.model && (
        <p className="mt-2 text-xs text-ink-faint">
          Routed model: <span className="font-mono">{status.model}</span>
          {lastModel && lastModel !== "deterministic" && (
            <> · last used: <span className="font-mono">{lastModel}</span></>
          )}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {consent === true ? (
          <>
            <span className="text-sm font-medium text-progress">You&apos;ve opted in.</span>
            <button
              type="button"
              onClick={() => dispatch({ type: "setAiConsent", consent: false })}
              className="rounded-lg border border-navy-600/20 px-4 py-2 text-sm font-medium text-ink hover:bg-surface-sunken"
            >
              Turn off AI enhancement
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => dispatch({ type: "setAiConsent", consent: true })}
              className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover"
            >
              Enable AI enhancement
            </button>
            <span className="text-sm text-ink-muted">
              {consent === false ? "Currently off." : "Off by default."}
            </span>
          </>
        )}
      </div>
    </Card>
  );
}
