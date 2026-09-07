import { describe, it, expect } from "vitest";
import {
  scoreAssessment,
  buildAssessmentResult,
  validatedFromResult,
  isAnswerCorrect,
  SCORER_VERSION,
} from "@/lib/plan/scorer";
import { composePlan, ALGORITHM_VERSION } from "@/lib/plan/composer";
import { competencies } from "@/lib/content/v2-content";
import type { AssessmentAnswer } from "@/lib/progress/v2-schema";

/** Helpers to build answers concisely. */
function sr(questionId: string, level: "a" | "b" | "c" | "d"): AssessmentAnswer {
  return { questionId, value: level, unsure: false };
}
function pick(questionId: string, choiceId: string): AssessmentAnswer {
  return { questionId, value: choiceId, unsure: false };
}
function order(questionId: string, ids: string[]): AssessmentAnswer {
  return { questionId, value: ids, unsure: false };
}
function unsure(questionId: string): AssessmentAnswer {
  return { questionId, value: "", unsure: true };
}

const DESTINATION = competencies.map((c) => c.id).sort();

// Correct diagnostic answers (from assessmentBank.json).
const CORRECT = {
  webFlow: order("q-web-flow-order", ["a", "b", "c", "d"]),
  agentPerm: pick("q-agent-permission", "b"),
  vectorDot: pick("q-vector-dot", "a"),
  weights: pick("q-weights-learned", "b"),
  leakage: pick("q-leakage", "b"),
  metric: pick("q-metric-choice", "b"),
  backprop: pick("q-backprop-step", "b"),
  tokens: pick("q-tokens-not-words", "b"),
  structured: pick("q-structured-output", "b"),
  rag: pick("q-rag-not-truth", "b"),
  toolLoop: order("q-tool-loop-order", ["a", "b", "c", "d"]),
  langgraph: pick("q-langgraph-state", "b"),
  injection: pick("q-injection-boundary", "b"),
  python: pick("q-python-list-comp", "a"),
  git: pick("q-git-purpose", "b"),
  sql: pick("q-sql-select", "a"),
  cloudResp: pick("q-cloud-responsibility", "b"),
};

// The six starting scenarios (R15).
const scenarios: Record<string, AssessmentAnswer[]> = {
  // 1. Complete beginner: low self-report, no correct diagnostics.
  beginner: [
    sr("sr-programming", "a"),
    sr("sr-web", "a"),
    sr("sr-ml", "a"),
    sr("sr-agents", "a"),
    sr("sr-cloud", "a"),
    unsure("q-python-list-comp"),
    unsure("q-web-flow-order"),
  ],
  // 2. Programmer without web/backend/API understanding.
  programmerNoWeb: [
    sr("sr-programming", "d"),
    CORRECT.python,
    sr("sr-web", "a"),
    unsure("q-web-flow-order"),
    sr("sr-ml", "a"),
  ],
  // 3. Frontend dev lacking Python/backend/data.
  frontend: [
    sr("sr-programming", "b"),
    pick("q-frontend-state", "b"),
    sr("sr-web", "c"),
    CORRECT.webFlow,
    sr("sr-ml", "a"),
    unsure("q-python-list-comp"),
  ],
  // 4. Backend/cloud dev, Python/Flask/Docker/AWS, no ML/AI.
  backendCloud: [
    sr("sr-programming", "d"),
    CORRECT.python,
    sr("sr-web", "d"),
    CORRECT.webFlow,
    CORRECT.sql,
    CORRECT.git,
    sr("sr-cloud", "d"),
    CORRECT.cloudResp,
    sr("sr-ml", "a"),
    sr("sr-agents", "a"),
  ],
  // 5. Data analyst/engineer: Python/SQL, limited app engineering.
  dataEng: [
    sr("sr-programming", "c"),
    CORRECT.python,
    CORRECT.sql,
    CORRECT.vectorDot,
    sr("sr-web", "b"),
    sr("sr-agents", "a"),
  ],
  // 6. ML practitioner new to LLM apps/RAG/agents.
  mlPractitioner: [
    sr("sr-ml", "d"),
    CORRECT.leakage,
    CORRECT.metric,
    CORRECT.backprop,
    CORRECT.weights,
    sr("sr-llm", "a"),
    sr("sr-agents", "a"),
    unsure("q-rag-not-truth"),
  ],
};

describe("scorer", () => {
  it("SCORER_VERSION is stable and findings cover all skill areas", () => {
    const findings = scoreAssessment(scenarios.beginner);
    expect(SCORER_VERSION).toBeTruthy();
    expect(findings.length).toBe(14); // one per skill area
    // deterministic order
    const again = scoreAssessment(scenarios.beginner);
    expect(again).toEqual(findings);
  });

  it("isAnswerCorrect grades each question type", () => {
    expect(isAnswerCorrect(CORRECT.agentPerm)).toBe(true);
    expect(isAnswerCorrect(pick("q-agent-permission", "a"))).toBe(false);
    expect(isAnswerCorrect(CORRECT.webFlow)).toBe(true);
    expect(isAnswerCorrect(order("q-web-flow-order", ["b", "a", "c", "d"]))).toBe(false);
    expect(isAnswerCorrect(unsure("q-agent-permission"))).toBe(false);
  });

  it("confidence alone never validates; a correct diagnostic does", () => {
    // High self-report, no diagnostic -> verify, not validated.
    const verify = scoreAssessment([sr("sr-ml", "d")]);
    const ml = verify.find((f) => f.skillArea === "ml-foundations")!;
    expect(ml.state).toBe("verify-prior-knowledge");

    // Correct strong diagnostic -> validated.
    const validated = scoreAssessment([sr("sr-ml", "d"), CORRECT.leakage]);
    const ml2 = validated.find((f) => f.skillArea === "ml-foundations")!;
    expect(ml2.state).toBe("validated-prior-knowledge");
    expect(ml2.evidenceQuestionIds).toContain("q-leakage");
  });

  it("beginner needs foundations in prerequisite areas", () => {
    const findings = scoreAssessment(scenarios.beginner);
    const prog = findings.find((f) => f.skillArea === "programming-python")!;
    expect(prog.state).toBe("needs-foundation");
    expect(prog.explanation).toContain("prerequisite");
  });

  it("every finding has a non-empty explanation", () => {
    for (const answers of Object.values(scenarios)) {
      for (const f of scoreAssessment(answers)) {
        expect(f.explanation.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("composer determinism", () => {
  it("is byte-identical for identical inputs", () => {
    const result = buildAssessmentResult("r1", "2026-01-01T00:00:00.000Z", scenarios.backendCloud);
    const a = composePlan({ id: "p1", createdAt: "2026-01-01T00:00:00.000Z", result, preferences: null });
    const b = composePlan({ id: "p1", createdAt: "2026-01-01T00:00:00.000Z", result, preferences: null });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.algorithmVersion).toBe(ALGORITHM_VERSION);
  });

  it("stamps the supplied id/createdAt (no internal clock)", () => {
    const plan = composePlan({ id: "px", createdAt: "2020-05-05T05:05:05.000Z", result: null, preferences: null });
    expect(plan.id).toBe("px");
    expect(plan.createdAt).toBe("2020-05-05T05:05:05.000Z");
  });
});

describe("six scenarios converge on the same destination", () => {
  for (const [name, answers] of Object.entries(scenarios)) {
    it(`${name}: valid plan, same destination competencies + capstone`, () => {
      const result = buildAssessmentResult(`r-${name}`, "2026-01-01T00:00:00.000Z", answers);
      const plan = composePlan({
        id: `p-${name}`,
        createdAt: "2026-01-01T00:00:00.000Z",
        result,
        preferences: null,
      });
      // Same fixed destination graph for everyone.
      expect([...plan.destinationCompetencyIds].sort()).toEqual(DESTINATION);
      // Capstone competency is always present.
      expect(plan.destinationCompetencyIds).toContain("comp-capstone");
      // All 30 canonical lessons appear as plan items (browsable, never removed).
      const lessonItems = plan.items.filter((i) => i.refType === "lesson");
      expect(lessonItems.length).toBe(30);
      // Estimated total is positive.
      expect(plan.estimatedTotalMinutes).toBeGreaterThan(0);
    });
  }

  it("beginner gets prerequisite bridges; backend/cloud gets fewer or none in known areas", () => {
    const beginnerPlan = composePlan({
      id: "pb",
      createdAt: "t",
      result: buildAssessmentResult("rb", "t", scenarios.beginner),
      preferences: null,
    });
    const bridges = beginnerPlan.items.filter((i) => i.refType === "prerequisite");
    expect(bridges.length).toBeGreaterThan(0);

    const backendPlan = composePlan({
      id: "pc",
      createdAt: "t",
      result: buildAssessmentResult("rc", "t", scenarios.backendCloud),
      preferences: null,
    });
    // backend/cloud validated python/git/sql/cloud, so no python/cli/backend bridges
    const backendBridgeAreas = backendPlan.items
      .filter((i) => i.refType === "prerequisite")
      .map((i) => i.refId);
    expect(backendBridgeAreas).not.toContain("pre-python");
  });

  it("mlPractitioner keeps ML lessons as revision but never auto-completes tasks", () => {
    const plan = composePlan({
      id: "pm",
      createdAt: "t",
      result: buildAssessmentResult("rm", "t", scenarios.mlPractitioner),
      preferences: null,
    });
    // A validated area yields a revision lane on its lessons.
    const revisionItems = plan.items.filter((i) => i.status === "revision");
    expect(revisionItems.length).toBeGreaterThan(0);
    // Composer output has no notion of completed tasks — it's plan structure only.
    expect(JSON.stringify(plan)).not.toContain("completedTaskIds");
  });
});

describe("validatedFromResult", () => {
  it("extracts only validated areas with evidence", () => {
    const result = buildAssessmentResult("r", "t", scenarios.backendCloud);
    const validated = validatedFromResult(result);
    for (const v of validated) {
      expect(v.state).toBe("validated-prior-knowledge");
      expect(v.assessmentResultId).toBe("r");
    }
  });
});
