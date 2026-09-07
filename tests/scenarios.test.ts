import { describe, it, expect } from "vitest";
import { buildAssessmentResult } from "@/lib/plan/scorer";
import { composePlan } from "@/lib/plan/composer";
import { competencies } from "@/lib/content/v2-content";
import type { AssessmentAnswer, PlanRevision } from "@/lib/progress/v2-schema";

/**
 * Six starting-profile scenarios (Prompt 1 §4). This test asserts the destination
 * competency set and capstone milestone are IDENTICAL across all profiles while
 * prerequisites, revision lanes and pacing differ appropriately. It also prints a
 * readable comparison table for the audit record.
 */

function sr(id: string, level: "a" | "b" | "c" | "d"): AssessmentAnswer {
  return { questionId: id, value: level, unsure: false };
}
function pick(id: string, choice: string): AssessmentAnswer {
  return { questionId: id, value: choice, unsure: false };
}
function order(id: string, ids: string[]): AssessmentAnswer {
  return { questionId: id, value: ids, unsure: false };
}
function unsure(id: string): AssessmentAnswer {
  return { questionId: id, value: "", unsure: true };
}

const CORRECT = {
  webFlow: order("q-web-flow-order", ["a", "b", "c", "d"]),
  vectorDot: pick("q-vector-dot", "a"),
  weights: pick("q-weights-learned", "b"),
  leakage: pick("q-leakage", "b"),
  metric: pick("q-metric-choice", "b"),
  backprop: pick("q-backprop-step", "b"),
  python: pick("q-python-list-comp", "a"),
  git: pick("q-git-purpose", "b"),
  sql: pick("q-sql-select", "a"),
  frontend: pick("q-frontend-state", "b"),
  cloudResp: pick("q-cloud-responsibility", "b"),
};

const SCENARIOS: Record<string, AssessmentAnswer[]> = {
  "1-complete-beginner": [
    sr("sr-programming", "a"), sr("sr-web", "a"), sr("sr-ml", "a"),
    sr("sr-agents", "a"), sr("sr-cloud", "a"),
    unsure("q-python-list-comp"), unsure("q-web-flow-order"),
  ],
  "2-programmer-no-web": [
    sr("sr-programming", "d"), CORRECT.python, sr("sr-web", "a"),
    unsure("q-web-flow-order"), sr("sr-ml", "a"),
  ],
  "3-frontend-dev": [
    sr("sr-programming", "b"), CORRECT.frontend, sr("sr-web", "c"),
    CORRECT.webFlow, sr("sr-ml", "a"), unsure("q-python-list-comp"),
  ],
  "4-backend-cloud": [
    sr("sr-programming", "d"), CORRECT.python, sr("sr-web", "d"), CORRECT.webFlow,
    CORRECT.sql, CORRECT.git, sr("sr-cloud", "d"), CORRECT.cloudResp,
    sr("sr-ml", "a"), sr("sr-agents", "a"),
  ],
  "5-data-engineer": [
    sr("sr-programming", "c"), CORRECT.python, CORRECT.sql, CORRECT.vectorDot,
    sr("sr-web", "b"), sr("sr-agents", "a"),
  ],
  "6-ml-practitioner": [
    sr("sr-ml", "d"), CORRECT.leakage, CORRECT.metric, CORRECT.backprop,
    CORRECT.weights, sr("sr-llm", "a"), sr("sr-agents", "a"), unsure("q-rag-not-truth"),
  ],
};

const DESTINATION = competencies.map((c) => c.id).sort();
const CAPSTONE = "comp-capstone";

interface Row {
  scenario: string;
  bridges: number;
  standard: number;
  revision: number;
  optionalDepth: number;
  estHours: number;
  destinationCount: number;
  hasCapstone: boolean;
}

function summarize(name: string, plan: PlanRevision): Row {
  const lessonItems = plan.items.filter((i) => i.refType === "lesson");
  return {
    scenario: name,
    bridges: plan.items.filter((i) => i.status === "foundation").length,
    standard: lessonItems.filter((i) => i.status === "standard").length,
    revision: lessonItems.filter((i) => i.status === "revision").length,
    optionalDepth: plan.items.filter((i) => i.status === "optional-depth").length,
    estHours: Math.round((plan.estimatedTotalMinutes / 60) * 10) / 10,
    destinationCount: plan.destinationCompetencyIds.length,
    hasCapstone: plan.destinationCompetencyIds.includes(CAPSTONE),
  };
}

describe("six starting scenarios", () => {
  const rows: Row[] = [];
  const plans: Record<string, PlanRevision> = {};

  for (const [name, answers] of Object.entries(SCENARIOS)) {
    const result = buildAssessmentResult(`r-${name}`, "2026-01-01T00:00:00.000Z", answers);
    const plan = composePlan({
      id: `p-${name}`,
      createdAt: "2026-01-01T00:00:00.000Z",
      result,
      preferences: null,
    });
    plans[name] = plan;
    rows.push(summarize(name, plan));
  }

  it("prints a readable comparison table", () => {
    const header =
      "scenario".padEnd(22) + "bridges  standard  revision  depth  ~hours  destComp  capstone";
    const lines = rows.map(
      (r) =>
        r.scenario.padEnd(22) +
        String(r.bridges).padEnd(9) +
        String(r.standard).padEnd(10) +
        String(r.revision).padEnd(10) +
        String(r.optionalDepth).padEnd(7) +
        String(r.estHours).padEnd(8) +
        String(r.destinationCount).padEnd(10) +
        (r.hasCapstone ? "yes" : "NO"),
    );
    // eslint-disable-next-line no-console
    console.log("\n=== Six-scenario plan comparison ===\n" + header + "\n" + lines.join("\n") + "\n");
    expect(rows).toHaveLength(6);
  });

  it("ALL scenarios share the identical destination competency set", () => {
    for (const name of Object.keys(SCENARIOS)) {
      expect([...plans[name].destinationCompetencyIds].sort()).toEqual(DESTINATION);
    }
  });

  it("ALL scenarios include the capstone milestone", () => {
    for (const name of Object.keys(SCENARIOS)) {
      expect(plans[name].destinationCompetencyIds).toContain(CAPSTONE);
    }
  });

  it("ALL scenarios keep every one of the 30 canonical lessons browsable", () => {
    for (const name of Object.keys(SCENARIOS)) {
      const lessonItems = plans[name].items.filter((i) => i.refType === "lesson");
      expect(lessonItems).toHaveLength(30);
    }
  });

  it("prerequisites/emphasis DIFFER appropriately across profiles", () => {
    // Complete beginner should get the most prerequisite bridges.
    const beginner = summarize("1", plans["1-complete-beginner"]);
    const backend = summarize("4", plans["4-backend-cloud"]);
    const mlPractitioner = summarize("6", plans["6-ml-practitioner"]);

    // Beginner needs more bridges than the backend/cloud developer.
    expect(beginner.bridges).toBeGreaterThan(backend.bridges);
    // ML practitioner earns revision lanes (validated ML/DL) that a beginner does not.
    expect(mlPractitioner.revision).toBeGreaterThan(beginner.revision);
    // Not every profile is identical: at least two distinct (bridges,revision) shapes.
    const shapes = new Set(
      Object.values(plans).map((p) => {
        const l = p.items;
        const b = l.filter((i) => i.status === "foundation").length;
        const rev = l.filter((i) => i.refType === "lesson" && i.status === "revision").length;
        return `${b}:${rev}`;
      }),
    );
    expect(shapes.size).toBeGreaterThan(1);
  });

  it("no scenario auto-completes canonical tasks (plan has no completion state)", () => {
    for (const name of Object.keys(SCENARIOS)) {
      expect(JSON.stringify(plans[name])).not.toContain("completedTaskIds");
    }
  });
});
