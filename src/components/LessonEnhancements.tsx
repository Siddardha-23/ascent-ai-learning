"use client";

import { useState } from "react";
import { getEnhancement } from "@/lib/content/v2-content";
import type { EnhancementBlock } from "@/lib/content/v2-schema";
import { useProgress } from "@/lib/progress/client-store";
import { Card, Pill, SectionTitle } from "@/components/ui";
import { CodeBlock } from "@/components/CodeBlock";
import { Visual } from "@/components/visuals/registry";
import { requestEnhancement } from "@/lib/ai/client";
import type { DepthPreference } from "@/lib/progress/v2-schema";

const KIND_LABEL: Record<string, string> = {
  "why-this-matters": "Why this matters",
  "connect-to-what-you-know": "Connect it to what you know",
  "mental-model": "Mental model",
  "worked-walkthrough": "Worked walkthrough",
  "annotated-code": "Annotated code",
  "predict-before-reveal": "Predict first",
  play: "Play with it",
  misconception: "Common misconception",
  "explain-back": "Explain it back",
};

/** Which block kinds show at each depth level. */
const DEPTH_KINDS: Record<DepthPreference, Set<string>> = {
  simple: new Set([
    "why-this-matters",
    "connect-to-what-you-know",
    "mental-model",
    "predict-before-reveal",
    "misconception",
    "play",
  ]),
  deeper: new Set([
    "why-this-matters",
    "connect-to-what-you-know",
    "mental-model",
    "worked-walkthrough",
    "predict-before-reveal",
    "play",
    "misconception",
    "explain-back",
  ]),
  implementation: new Set(Object.keys(KIND_LABEL)), // everything, incl. code
};

const DEPTHS: { id: DepthPreference; label: string }[] = [
  { id: "simple", label: "Simple" },
  { id: "deeper", label: "Deeper" },
  { id: "implementation", label: "Implementation" },
];

export function LessonEnhancements({ lessonId, lessonTitle }: { lessonId: string; lessonTitle: string }) {
  const { state, dispatch, profileId } = useProgress();
  const enhancement = getEnhancement(lessonId);
  const depth: DepthPreference = state.v2?.preferences?.depth ?? "simple";
  const aiOptIn = state.v2?.ai?.consent === true;

  if (!enhancement) return null;
  const visible = enhancement.blocks.filter((b) => DEPTH_KINDS[depth].has(b.kind));

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <SectionTitle>Learn it your way</SectionTitle>
        <div className="flex items-center gap-1.5" role="group" aria-label="Depth level">
          {DEPTHS.map((d) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={depth === d.id}
              onClick={() => dispatch({ type: "setDepthPreference", depth: d.id })}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                depth === d.id ? "border-action bg-action-soft/50 text-action" : "border-navy-600/20 text-ink"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mb-3 text-xs text-ink-faint">
        Your preferred depth is remembered. Required lab steps and sources are always
        shown below, never hidden here.
      </p>

      <div className="space-y-4">
        {visible.map((block, i) => (
          <EnhancementBlockView
            key={`${block.kind}-${i}`}
            block={block}
            lessonTitle={lessonTitle}
            aiOptIn={aiOptIn}
            profileId={profileId}
          />
        ))}
      </div>
    </Card>
  );
}

function EnhancementBlockView({
  block,
  lessonTitle,
  aiOptIn,
  profileId,
}: {
  block: EnhancementBlock;
  lessonTitle: string;
  aiOptIn: boolean;
  profileId: string;
}) {
  return (
    <section className="rounded-lg border border-navy-600/12 p-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {KIND_LABEL[block.kind] ?? block.kind}
      </p>
      <p className="text-sm text-ink">{block.body}</p>

      {block.code && <div className="mt-2"><CodeBlock code={block.code} lang={block.codeLang} /></div>}

      {block.visualId && (
        <div className="mt-3">
          <Visual id={block.visualId} />
        </div>
      )}

      {block.kind === "predict-before-reveal" && block.reveal && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm font-medium text-action">Reveal the answer</summary>
          <p className="mt-1 rounded-lg bg-surface-sunken p-2 text-sm text-ink">{block.reveal}</p>
        </details>
      )}

      {block.kind === "explain-back" && (
        <ExplainBack
          block={block}
          lessonTitle={lessonTitle}
          aiOptIn={aiOptIn}
          profileId={profileId}
        />
      )}

      {block.kind === "mental-model" && aiOptIn ? (
        <AltAnalogy lessonTitle={lessonTitle} excerpt={block.body} profileId={profileId} />
      ) : null}
    </section>
  );
}

/** Explain-back: learner writes an answer, sees the reference, optional AI feedback. */
function ExplainBack({
  block,
  lessonTitle,
  aiOptIn,
  profileId,
}: {
  block: EnhancementBlock;
  lessonTitle: string;
  aiOptIn: boolean;
  profileId: string;
}) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fromFallback, setFromFallback] = useState(false);

  async function getFeedback() {
    if (!block.reveal) return;
    setBusy(true);
    const res = await requestEnhancement(profileId, {
      kind: "explain-back-feedback",
      question: block.body,
      referenceAnswer: block.reveal,
      learnerAnswer: answer.slice(0, 3000),
    });
    setBusy(false);
    if (res) {
      setFeedback(res.output.text);
      setFromFallback(res.fromFallback);
    } else {
      setFeedback("Feedback is unavailable right now. Compare your answer to the reference below yourself.");
      setFromFallback(true);
    }
  }

  return (
    <div className="mt-2">
      <label className="mb-1 block text-sm font-medium text-navy" htmlFor={`eb-${lessonTitle}`}>
        Your explanation
      </label>
      <textarea
        id={`eb-${lessonTitle}`}
        rows={3}
        value={answer}
        maxLength={3000}
        onChange={(e) => setAnswer(e.target.value)}
        className="w-full rounded-lg border border-navy-600/20 bg-white p-2 text-sm"
        placeholder="Explain it in your own words…"
      />
      {block.reveal && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm font-medium text-action">Show a reference answer</summary>
          <p className="mt-1 rounded-lg bg-surface-sunken p-2 text-sm text-ink">{block.reveal}</p>
        </details>
      )}
      {aiOptIn && (
        <div className="mt-2">
          <button
            type="button"
            onClick={getFeedback}
            disabled={busy || answer.trim().length === 0}
            className="rounded-md bg-action px-3 py-1.5 text-xs font-medium text-white hover:bg-action-hover disabled:opacity-60"
          >
            {busy ? "Getting feedback…" : "Get AI feedback"}
          </button>
          {feedback && (
            <div className="mt-2 rounded-lg border border-navy-600/12 bg-surface-sunken p-2 text-sm text-ink">
              <div className="mb-1 flex items-center gap-2">
                <Pill tone="neutral">{fromFallback ? "Reflection guide" : "AI feedback"}</Pill>
                <span className="text-xs text-ink-faint">Not a grade or proof of mastery.</span>
              </div>
              {feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Optional AI alternate analogy for a lesson (only when opted in). */
function AltAnalogy({
  lessonTitle,
  excerpt,
  profileId,
}: {
  lessonTitle: string;
  excerpt: string;
  profileId: string;
}) {
  const [text, setText] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fromFallback, setFromFallback] = useState(false);

  async function get() {
    setBusy(true);
    const res = await requestEnhancement(profileId, {
      kind: "alt-analogy",
      lessonTitle,
      lessonExcerpt: excerpt.slice(0, 3000),
    });
    setBusy(false);
    if (res) {
      setText(res.output.text);
      setFromFallback(res.fromFallback);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={get}
        disabled={busy}
        className="rounded-md border border-action px-3 py-1.5 text-xs font-medium text-action hover:bg-action-soft/40 disabled:opacity-60"
      >
        {busy ? "Thinking…" : "Try another explanation (AI)"}
      </button>
      {text && (
        <div className="mt-2 rounded-lg border border-navy-600/12 bg-surface-sunken p-2 text-sm text-ink">
          <Pill tone="neutral">{fromFallback ? "Study tip" : "AI analogy"}</Pill>
          <p className="mt-1">{text}</p>
        </div>
      )}
    </div>
  );
}
