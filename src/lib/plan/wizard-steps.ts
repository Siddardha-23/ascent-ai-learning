import { assessmentBank } from "@/lib/content/v2-content";
import { SKILL_AREAS, type SkillArea } from "@/lib/content/v2-schema";
import type { AssessmentQuestion } from "@/lib/content/v2-schema";

/**
 * Deterministic grouping of the assessment bank into wizard steps. Self-report
 * questions come first (quick), then verified diagnostics grouped by theme, so
 * the whole thing normally takes 12–18 minutes. Preferences are separate steps
 * rendered by the wizard component.
 */

export interface QuestionStep {
  kind: "questions";
  id: string;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
}

const byId = (id: string) => assessmentBank.find((q) => q.id === id)!;

function questionsInOrder(ids: string[]): AssessmentQuestion[] {
  return ids.map(byId).filter(Boolean);
}

/** Self-report questions (all sr-*), in bank order. */
const selfReport = assessmentBank.filter((q) => q.type === "self-report");

/** Verified diagnostics grouped into themed steps. */
const foundationsDiagnostics = questionsInOrder([
  "q-git-purpose",
  "q-python-list-comp",
  "q-web-flow-order",
  "q-frontend-state",
  "q-sql-select",
  "q-vector-dot",
]);

const mlDiagnostics = questionsInOrder([
  "q-weights-learned",
  "q-leakage",
  "q-metric-choice",
  "q-backprop-step",
  "q-tokens-not-words",
]);

const appDiagnostics = questionsInOrder([
  "q-context-window",
  "q-structured-output",
  "q-temperature",
  "q-embedding-similarity",
  "q-rag-not-truth",
]);

const advancedDiagnostics = questionsInOrder([
  "q-graph-types",
  "q-tool-loop-order",
  "q-agent-permission",
  "q-langgraph-state",
  "q-injection-boundary",
  "q-cache-types",
  "q-cloud-responsibility",
]);

export const QUESTION_STEPS: QuestionStep[] = [
  {
    kind: "questions",
    id: "self-report",
    title: "Where are you starting?",
    description:
      "A quick self-check. There are no wrong answers here — pick what feels closest, or choose \"I'm not sure\".",
    questions: selfReport,
  },
  {
    kind: "questions",
    id: "foundations",
    title: "Foundations check",
    description:
      "A few short questions about programming, the web, data and math. These verify prior knowledge; \"I'm not sure\" is always fine.",
    questions: foundationsDiagnostics,
  },
  {
    kind: "questions",
    id: "ml",
    title: "Machine learning & models",
    description: "Predict what happens, rather than recall trivia.",
    questions: mlDiagnostics,
  },
  {
    kind: "questions",
    id: "apps",
    title: "LLM applications & retrieval",
    description: "Reasoning about model calls, structured output and RAG.",
    questions: appDiagnostics,
  },
  {
    kind: "questions",
    id: "advanced",
    title: "Agents, security & delivery",
    description: "Boundaries, tool loops and production concerns.",
    questions: advancedDiagnostics,
  },
];

/** All diagnostic question ids covered, for sanity checks/tests. */
export const ALL_WIZARD_QUESTION_IDS = QUESTION_STEPS.flatMap((s) =>
  s.questions.map((q) => q.id),
);

/** Skill areas that have at least one self-report question (for the UI). */
export function selfReportAreas(): SkillArea[] {
  return SKILL_AREAS.filter((a) => selfReport.some((q) => q.skillArea === a));
}
