"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress/client-store";
import { QUESTION_STEPS } from "@/lib/plan/wizard-steps";
import { buildAssessmentResult, validatedFromResult } from "@/lib/plan/scorer";
import { composePlan } from "@/lib/plan/composer";
import type { AssessmentQuestion } from "@/lib/content/v2-schema";
import {
  teachingModeSchema,
  computeConstraintSchema,
  cloudPreferenceSchema,
  type AssessmentAnswer,
  type LearningPreferences,
} from "@/lib/progress/v2-schema";
import { Card, ProgressBar, Pill } from "@/components/ui";

const TEACHING_MODES = teachingModeSchema.options;
const COMPUTE = computeConstraintSchema.options;
const CLOUDS = cloudPreferenceSchema.options;
const TEACHING_LABELS: Record<string, string> = {
  "concise-text": "Concise text",
  "detailed-text": "Detailed text",
  "annotated-code": "Annotated code",
  diagrams: "Diagrams & animation",
  "video-resources": "Video / resources",
  "build-first": "Build-first labs",
};
const COMPUTE_LABELS: Record<string, string> = {
  "browser-cpu": "Browser / local CPU",
  "local-gpu": "A local GPU",
  "free-apis-only": "Free APIs only",
  "paid-apis": "Paid services available",
};
const CLOUD_LABELS: Record<string, string> = {
  aws: "AWS",
  gcp: "Google Cloud",
  azure: "Azure",
  none: "No preference",
};

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

type AnswerMap = Record<string, AssessmentAnswer>;

// Steps: [intro] + question steps + [preferences] + [review].
const TOTAL_STEPS = QUESTION_STEPS.length + 3;

export function AssessmentWizard() {
  const router = useRouter();
  const { state, dispatch, loading } = useProgress();
  const existingDraft = state.v2?.assessment?.draft;

  const [step, setStep] = useState<number>(existingDraft?.step ?? 0);
  const [answers, setAnswers] = useState<AnswerMap>(() => {
    const map: AnswerMap = {};
    for (const a of existingDraft?.answers ?? []) map[a.questionId] = a;
    return map;
  });
  const [prefs, setPrefs] = useState<LearningPreferences>(() => ({
    role: (existingDraft?.partialPreferences?.role as string) ?? "",
    languages: [],
    weeklyMinutes: state.settings.weeklyTargetMinutes ?? 300,
    sessionMinutes: 45,
    teachingModes: [],
    compute: [],
    cloud: "none",
    depth: state.v2?.preferences?.depth ?? "simple",
  }));

  const progressPercent = Math.round((step / (TOTAL_STEPS - 1)) * 100);

  function persistDraft(nextStep: number, nextAnswers: AnswerMap) {
    dispatch({
      type: "saveAssessmentDraft",
      draft: {
        startedAt: existingDraft?.startedAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        step: nextStep,
        answers: Object.values(nextAnswers),
        partialPreferences: { role: prefs.role },
      },
    });
  }

  function setAnswer(questionId: string, value: string | string[], unsure = false) {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: { questionId, value, unsure } };
      return next;
    });
  }

  function goTo(next: number) {
    const clamped = Math.max(0, Math.min(TOTAL_STEPS - 1, next));
    setStep(clamped);
    persistDraft(clamped, answers);
    // Scroll to top of the wizard for orientation.
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function finish() {
    const answerList = Object.values(answers);
    const result = buildAssessmentResult(newId("asmt"), new Date().toISOString(), answerList);
    const validated = validatedFromResult(result);
    dispatch({ type: "submitAssessment", result, validated });
    dispatch({ type: "setPreferences", preferences: prefs });
    // Compose a plan revision but DO NOT activate it — user reviews on /learn/plan.
    const plan = composePlan({
      id: newId("plan"),
      createdAt: new Date().toISOString(),
      result,
      preferences: prefs,
    });
    dispatch({ type: "addPlanRevision", revision: plan });
    router.push("/learn/plan?preview=" + encodeURIComponent(plan.id));
    router.refresh();
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
        <div className="h-8 w-64 rounded bg-surface-sunken" />
        <div className="h-48 rounded bg-surface-sunken" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-navy">Skills check</span>
          <span className="text-ink-faint">
            Step {step + 1} of {TOTAL_STEPS} · about 12–18 min
          </span>
        </div>
        <ProgressBar value={progressPercent} label="Assessment progress" />
        <p className="mt-1 text-xs text-ink-faint">
          Your answers save automatically. You can leave and resume any time.
        </p>
      </div>

      {step === 0 && <IntroStep onNext={() => goTo(1)} onSkip={() => router.push("/learn")} />}

      {QUESTION_STEPS.map((qs, i) =>
        step === i + 1 ? (
          <QuestionsStep
            key={qs.id}
            title={qs.title}
            description={qs.description}
            questions={qs.questions}
            answers={answers}
            onAnswer={setAnswer}
            onBack={() => goTo(step - 1)}
            onNext={() => goTo(step + 1)}
          />
        ) : null,
      )}

      {step === QUESTION_STEPS.length + 1 && (
        <PreferencesStep
          prefs={prefs}
          setPrefs={setPrefs}
          onBack={() => goTo(step - 1)}
          onNext={() => goTo(step + 1)}
        />
      )}

      {step === TOTAL_STEPS - 1 && (
        <ReviewStep
          answers={answers}
          onBack={() => goTo(step - 1)}
          onFinish={finish}
        />
      )}
    </div>
  );
}

function IntroStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <Card>
      <h1 className="text-2xl font-bold text-navy">Build a plan around what you know</h1>
      <p className="mt-2 max-w-reading text-sm text-ink-muted">
        This optional check takes about 12–18 minutes. It mixes a quick
        self-report with short questions that verify prior knowledge, then
        proposes a personalized route to the same destination as the standard
        course. Nothing here changes your existing progress, and you can return
        to the standard path at any time.
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-muted">
        <li>Everyone reaches the same generative-AI and agentic-AI goal.</li>
        <li>Confidence alone never marks a topic complete — only correct answers verify prior knowledge.</li>
        <li>You can retake it later and compare plans.</li>
      </ul>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-action px-5 py-2.5 text-sm font-semibold text-white hover:bg-action-hover"
        >
          Start the check
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-lg border border-navy-600/20 px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface-sunken"
        >
          Not now — go to the standard path
        </button>
      </div>
    </Card>
  );
}

function QuestionsStep({
  title,
  description,
  questions,
  answers,
  onAnswer,
  onBack,
  onNext,
}: {
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  answers: AnswerMap;
  onAnswer: (id: string, value: string | string[], unsure?: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-navy">{title}</h2>
      <p className="mt-1 text-sm text-ink-muted">{description}</p>
      <ol className="mt-4 space-y-6">
        {questions.map((q, i) => (
          <li key={q.id}>
            <QuestionField
              index={i + 1}
              question={q}
              answer={answers[q.id]}
              onAnswer={onAnswer}
            />
          </li>
        ))}
      </ol>
      <StepNav onBack={onBack} onNext={onNext} />
    </Card>
  );
}

function QuestionField({
  index,
  question,
  answer,
  onAnswer,
}: {
  index: number;
  question: AssessmentQuestion;
  answer: AssessmentAnswer | undefined;
  onAnswer: (id: string, value: string | string[], unsure?: boolean) => void;
}) {
  const groupName = `q-${question.id}`;
  const isUnsure = answer?.unsure ?? false;
  const selected = !isUnsure ? answer?.value : undefined;

  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">
        <span className="mr-2 text-ink-faint">{index}.</span>
        {question.prompt}
      </legend>

      {question.type === "order" ? (
        <OrderChoices question={question} value={Array.isArray(selected) ? selected : []} onAnswer={onAnswer} />
      ) : (
        <div className="mt-2 space-y-1.5">
          {question.choices.map((c) => (
            <label
              key={c.id}
              className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 text-sm ${
                selected === c.id
                  ? "border-action bg-action-soft/40"
                  : "border-navy-600/15 hover:bg-surface-sunken"
              }`}
            >
              <input
                type="radio"
                name={groupName}
                checked={selected === c.id}
                onChange={() => onAnswer(question.id, c.id, false)}
                className="mt-0.5 h-4 w-4 accent-action"
              />
              <span className="text-ink">{c.text}</span>
            </label>
          ))}
        </div>
      )}

      {question.allowUnsure && (
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-ink-muted">
          <input
            type="radio"
            name={groupName}
            checked={isUnsure}
            onChange={() => onAnswer(question.id, "", true)}
            className="h-4 w-4 accent-ink-faint"
          />
          I&apos;m not sure
        </label>
      )}
    </fieldset>
  );
}

/** Ordering question: click choices to build a sequence; reset clears it. */
function OrderChoices({
  question,
  value,
  onAnswer,
}: {
  question: AssessmentQuestion;
  value: string[];
  onAnswer: (id: string, value: string | string[], unsure?: boolean) => void;
}) {
  const remaining = question.choices.filter((c) => !value.includes(c.id));
  return (
    <div className="mt-2">
      <p className="mb-1 text-xs text-ink-faint">
        Click items in the correct order (first to last).
      </p>
      <ol className="mb-2 space-y-1">
        {value.map((id, i) => {
          const c = question.choices.find((x) => x.id === id);
          return (
            <li
              key={id}
              className="flex items-center gap-2 rounded-lg border border-action bg-action-soft/40 p-2 text-sm"
            >
              <span className="font-semibold text-action">{i + 1}.</span>
              <span className="text-ink">{c?.text}</span>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap gap-1.5">
        {remaining.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onAnswer(question.id, [...value, c.id], false)}
            className="rounded-lg border border-navy-600/15 px-2.5 py-1.5 text-sm text-ink hover:bg-surface-sunken"
          >
            {c.text}
          </button>
        ))}
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onAnswer(question.id, [], false)}
            className="rounded-lg px-2.5 py-1.5 text-xs text-ink-faint underline"
          >
            Reset order
          </button>
        )}
      </div>
    </div>
  );
}

function PreferencesStep({
  prefs,
  setPrefs,
  onBack,
  onNext,
}: {
  prefs: LearningPreferences;
  setPrefs: (p: LearningPreferences) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  function toggle<T extends string>(list: T[], v: T): T[] {
    return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-navy">How do you like to learn?</h2>
      <p className="mt-1 text-sm text-ink-muted">
        These shape pacing and presentation — never the destination.
      </p>

      <div className="mt-4 space-y-5">
        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium text-navy">
            Your role or background (optional)
          </label>
          <input
            id="role"
            type="text"
            maxLength={120}
            value={prefs.role ?? ""}
            onChange={(e) => setPrefs({ ...prefs, role: e.target.value })}
            placeholder="e.g. Backend developer"
            className="w-full rounded-lg border border-navy-600/20 bg-white p-2.5 text-sm"
          />
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-navy">Time per week</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={10080}
              step={30}
              value={prefs.weeklyMinutes}
              onChange={(e) => setPrefs({ ...prefs, weeklyMinutes: Number(e.target.value) })}
              className="w-28 rounded-lg border border-navy-600/20 bg-white p-2 text-sm"
              aria-label="Minutes per week"
            />
            <span className="text-sm text-ink-faint">minutes / week</span>
          </div>
        </div>

        <fieldset>
          <legend className="mb-1 text-sm font-medium text-navy">
            Preferred teaching modes (choose any)
          </legend>
          <div className="flex flex-wrap gap-2">
            {TEACHING_MODES.map((m) => (
              <label key={m} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-navy-600/15 px-3 py-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={prefs.teachingModes.includes(m)}
                  onChange={() => setPrefs({ ...prefs, teachingModes: toggle(prefs.teachingModes, m) })}
                  className="h-4 w-4 accent-action"
                />
                {TEACHING_LABELS[m]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-sm font-medium text-navy">
            Available compute / APIs (choose any)
          </legend>
          <div className="flex flex-wrap gap-2">
            {COMPUTE.map((m) => (
              <label key={m} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-navy-600/15 px-3 py-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={prefs.compute.includes(m)}
                  onChange={() => setPrefs({ ...prefs, compute: toggle(prefs.compute, m) })}
                  className="h-4 w-4 accent-action"
                />
                {COMPUTE_LABELS[m]}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="cloud" className="mb-1 block text-sm font-medium text-navy">
            Preferred cloud for examples
          </label>
          <select
            id="cloud"
            value={prefs.cloud}
            onChange={(e) => setPrefs({ ...prefs, cloud: e.target.value as LearningPreferences["cloud"] })}
            className="rounded-lg border border-navy-600/20 bg-white p-2 text-sm"
          >
            {CLOUDS.map((c) => (
              <option key={c} value={c}>
                {CLOUD_LABELS[c]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-ink-faint">
            You&apos;ll still see a three-cloud responsibility map regardless of choice.
          </p>
        </div>
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </Card>
  );
}

function ReviewStep({
  answers,
  onBack,
  onFinish,
}: {
  answers: AnswerMap;
  onBack: () => void;
  onFinish: () => void;
}) {
  const answered = Object.values(answers).filter((a) => !a.unsure).length;
  const unsure = Object.values(answers).filter((a) => a.unsure).length;
  return (
    <Card>
      <h2 className="text-lg font-semibold text-navy">Ready to see your plan</h2>
      <p className="mt-1 text-sm text-ink-muted">
        You answered {answered} question{answered === 1 ? "" : "s"}
        {unsure > 0 ? ` and marked ${unsure} as unsure` : ""}. We&apos;ll compute
        a transparent result for each skill area and propose a plan you can
        preview before anything changes.
      </p>
      <div className="mt-3">
        <Pill tone="core">Deterministic</Pill>{" "}
        <span className="text-xs text-ink-faint">
          The result is computed locally from your answers — no AI decides your path.
        </span>
      </div>
      <StepNav onBack={onBack} onNext={onFinish} nextLabel="See my findings & plan" />
    </Card>
  );
}

function StepNav({
  onBack,
  onNext,
  nextLabel = "Next",
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-2">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-navy-600/20 px-4 py-2 text-sm font-medium text-ink hover:bg-surface-sunken"
        >
          ← Back
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onNext}
        className="rounded-lg bg-action px-5 py-2 text-sm font-semibold text-white hover:bg-action-hover"
      >
        {nextLabel}
      </button>
    </div>
  );
}
