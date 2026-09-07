import {
  assessmentBank,
  questionsForSkill,
} from "@/lib/content/v2-content";
import { SKILL_AREAS, SKILL_AREA_LABELS, type SkillArea } from "@/lib/content/v2-schema";
import {
  type AssessmentAnswer,
  type AssessmentResult,
  type SkillFinding,
  type SkillState,
  type ValidatedKnowledge,
} from "@/lib/progress/v2-schema";

/**
 * Deterministic, transparent assessment scorer (R15). Pure: identical answers
 * always produce identical findings. It never calls a model.
 *
 * Rules per skill area, using only the questions the learner answered:
 *  - No signal at all              -> "ready-to-learn" (start the standard topic)
 *  - Low self-report, no diagnostic passed on a foundation area -> "needs-foundation"
 *  - Correct diagnostics (moderate/strong evidence) -> "validated-prior-knowledge"
 *  - High self-report but no/weak diagnostic evidence -> "verify-prior-knowledge"
 *  - Otherwise -> "ready-to-learn"
 *
 * Confidence (self-report) alone never awards "validated"; only correct
 * diagnostics do. Foundation areas can drop to "needs-foundation".
 */

export const SCORER_VERSION = "scorer-2026-09-05.1";

/** Skill areas that are prerequisite foundations (can need a bridge first). */
const FOUNDATION_AREAS = new Set<SkillArea>([
  "cli-git",
  "programming-python",
  "web-http-api",
  "frontend",
  "backend-data",
  "math-data",
  "cloud-containers",
]);

/** Self-report questions map choice id -> a 0..3 level. */
const SELF_REPORT_LEVEL: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };

interface Signal {
  /** highest self-report level seen (0..3) or -1 if none. */
  selfLevel: number;
  /** number of verified diagnostics answered in this area. */
  diagnosticsAnswered: number;
  /** number answered correctly. */
  diagnosticsCorrect: number;
  /** strongest evidence among CORRECT diagnostics. */
  bestCorrectEvidence: 0 | 1 | 2; // weak/moderate/strong -> 0/1/2
  /** question ids that contributed. */
  evidenceQuestionIds: string[];
  /** whether the learner marked unsure on any diagnostic. */
  anyUnsure: boolean;
}

const EVIDENCE_RANK: Record<string, 0 | 1 | 2> = {
  weak: 0,
  moderate: 1,
  strong: 2,
};

/** Is a single answer correct for its question? Pure and deterministic. */
export function isAnswerCorrect(answer: AssessmentAnswer): boolean {
  if (answer.unsure) return false;
  const q = assessmentBank.find((x) => x.id === answer.questionId);
  if (!q) return false;
  if (q.type === "self-report") return false; // not scored as correctness

  if (q.type === "single-choice") {
    const correctId = q.choices.find((c) => c.correct)?.id;
    return typeof answer.value === "string" && answer.value === correctId;
  }
  if (q.type === "multi-choice") {
    const correctIds = q.choices.filter((c) => c.correct).map((c) => c.id).sort();
    const given = Array.isArray(answer.value) ? [...answer.value].sort() : [];
    return (
      correctIds.length > 0 &&
      given.length === correctIds.length &&
      given.every((v, i) => v === correctIds[i])
    );
  }
  if (q.type === "order") {
    // value is the ordered array of choice ids; compare to the correct order.
    const correctOrder = [...q.choices]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((c) => c.id);
    const given = Array.isArray(answer.value) ? answer.value : [];
    return (
      given.length === correctOrder.length &&
      given.every((v, i) => v === correctOrder[i])
    );
  }
  return false;
}

function gatherSignal(area: SkillArea, answers: AssessmentAnswer[]): Signal {
  const areaQuestionIds = new Set(questionsForSkill(area).map((q) => q.id));
  const signal: Signal = {
    selfLevel: -1,
    diagnosticsAnswered: 0,
    diagnosticsCorrect: 0,
    bestCorrectEvidence: 0,
    evidenceQuestionIds: [],
    anyUnsure: false,
  };

  // Sort answers by questionId for deterministic evidence ordering.
  const sorted = [...answers]
    .filter((a) => areaQuestionIds.has(a.questionId))
    .sort((a, b) => a.questionId.localeCompare(b.questionId));

  for (const a of sorted) {
    const q = assessmentBank.find((x) => x.id === a.questionId);
    if (!q) continue;
    if (q.type === "self-report") {
      if (!a.unsure && typeof a.value === "string") {
        const lvl = SELF_REPORT_LEVEL[a.value] ?? -1;
        if (lvl > signal.selfLevel) signal.selfLevel = lvl;
      }
      continue;
    }
    // Verified diagnostic.
    signal.diagnosticsAnswered += 1;
    signal.evidenceQuestionIds.push(a.questionId);
    if (a.unsure) signal.anyUnsure = true;
    if (isAnswerCorrect(a)) {
      signal.diagnosticsCorrect += 1;
      const rank = EVIDENCE_RANK[q.evidenceStrength] ?? 1;
      if (rank > signal.bestCorrectEvidence) signal.bestCorrectEvidence = rank;
    }
  }
  return signal;
}

function decide(area: SkillArea, s: Signal): { state: SkillState; explanation: string } {
  const label = SKILL_AREA_LABELS[area];
  const isFoundation = FOUNDATION_AREAS.has(area);

  // No signal at all: default to starting the standard topic.
  if (s.selfLevel < 0 && s.diagnosticsAnswered === 0) {
    return {
      state: "ready-to-learn",
      explanation: `No answers were recorded for ${label}, so you start this topic on the standard path.`,
    };
  }

  // Correct diagnostics with at least moderate evidence -> validated.
  if (s.diagnosticsCorrect > 0 && s.bestCorrectEvidence >= 1) {
    return {
      state: "validated-prior-knowledge",
      explanation: `You correctly answered ${s.diagnosticsCorrect} diagnostic${s.diagnosticsCorrect > 1 ? "s" : ""} in ${label} with moderate-to-strong evidence, so this is offered as a faster revision lane rather than full lessons.`,
    };
  }

  // High self-report but weak/absent diagnostic evidence -> verify.
  if (s.selfLevel >= 2 && s.diagnosticsCorrect === 0) {
    if (s.diagnosticsAnswered > 0) {
      return {
        state: "verify-prior-knowledge",
        explanation: `You reported comfort with ${label} but the diagnostic wasn't answered correctly, so we verify prior knowledge with a short check before revising.`,
      };
    }
    return {
      state: "verify-prior-knowledge",
      explanation: `You reported comfort with ${label} but no diagnostic confirmed it, so we verify prior knowledge before shortening this area.`,
    };
  }

  // Low signal on a foundation area -> needs a bridge.
  if (isFoundation && s.selfLevel <= 0 && s.diagnosticsCorrect === 0) {
    return {
      state: "needs-foundation",
      explanation: `Your answers suggest ${label} is unfamiliar, and it is a prerequisite, so a short bridge module is added before the lessons that rely on it.`,
    };
  }

  // Everything else: ready to learn on the standard path.
  return {
    state: "ready-to-learn",
    explanation: `Your answers place ${label} at a starting level, so you learn it on the standard path.`,
  };
}

/** Score all answers into per-skill findings (deterministic). */
export function scoreAssessment(answers: AssessmentAnswer[]): SkillFinding[] {
  const findings: SkillFinding[] = [];
  // SKILL_AREAS is a fixed-order tuple -> deterministic finding order.
  for (const area of SKILL_AREAS) {
    const signal = gatherSignal(area, answers);
    const { state, explanation } = decide(area, signal);
    findings.push({
      skillArea: area,
      state,
      explanation,
      evidenceQuestionIds: signal.evidenceQuestionIds,
    });
  }
  return findings;
}

/**
 * Build a full AssessmentResult. The caller supplies id/createdAt so the
 * scorer itself stays pure (no clock/random inside scoring).
 */
export function buildAssessmentResult(
  id: string,
  createdAt: string,
  answers: AssessmentAnswer[],
): AssessmentResult {
  return {
    id,
    createdAt,
    scorerVersion: SCORER_VERSION,
    answers,
    findings: scoreAssessment(answers),
  };
}

/** Extract validated-prior-knowledge records from a result (for state). */
export function validatedFromResult(result: AssessmentResult): ValidatedKnowledge[] {
  return result.findings
    .filter((f) => f.state === "validated-prior-knowledge")
    .map((f) => ({
      skillArea: f.skillArea,
      state: f.state,
      assessmentResultId: result.id,
      evidenceQuestionIds: f.evidenceQuestionIds,
      recordedAt: result.createdAt,
    }));
}
