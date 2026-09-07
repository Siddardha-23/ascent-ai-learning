import competenciesJson from "../../../content/competencies.json";
import prerequisiteModulesJson from "../../../content/prerequisiteModules.json";
import assessmentBankJson from "../../../content/assessmentBank.json";
import lessonEnhancementsJson from "../../../content/lessonEnhancements.json";
import sourcesV2Json from "../../../content/sources-v2.json";
import {
  competenciesFileSchema,
  prerequisiteModulesFileSchema,
  assessmentBankFileSchema,
  lessonEnhancementsFileSchema,
  sourcesV2FileSchema,
  type CompetencyV2,
  type PrerequisiteModule,
  type AssessmentQuestion,
  type LessonEnhancement,
  type SourceV2,
  type SkillArea,
  SKILL_AREAS,
} from "./v2-schema";
import { getLessonById, getSourceById } from "./content";

/**
 * Parse + validate the v2 content modules once at import. Referential
 * integrity (source IDs resolve, lesson IDs exist, question IDs exist) is
 * checked here so a malformed module fails loudly at build/startup rather than
 * rendering a broken adaptive experience.
 */

export const competencies: CompetencyV2[] =
  competenciesFileSchema.parse(competenciesJson).competencies;
export const prerequisiteModules: PrerequisiteModule[] =
  prerequisiteModulesFileSchema.parse(prerequisiteModulesJson).modules;
export const assessmentBank: AssessmentQuestion[] =
  assessmentBankFileSchema.parse(assessmentBankJson).questions;
export const lessonEnhancements: LessonEnhancement[] =
  lessonEnhancementsFileSchema.parse(lessonEnhancementsJson).enhancements;
export const sourcesV2: SourceV2[] = sourcesV2FileSchema.parse(sourcesV2Json);

const sourceV2Ids = new Set(sourcesV2.map((s) => s.id));
const questionIds = new Set(assessmentBank.map((q) => q.id));

/** A source id resolves if it's in the canonical catalog or the v2 catalog. */
export function resolveSourceId(id: string): boolean {
  return Boolean(getSourceById(id)) || sourceV2Ids.has(id);
}

/** Runtime referential-integrity checks (also used by the validator script). */
export function checkV2Integrity(): string[] {
  const errors: string[] = [];

  // Unique IDs.
  const compIds = new Set<string>();
  for (const c of competencies) {
    if (compIds.has(c.id)) errors.push(`Duplicate competency id: ${c.id}`);
    compIds.add(c.id);
  }
  const modIds = new Set<string>();
  for (const m of prerequisiteModules) {
    if (modIds.has(m.id)) errors.push(`Duplicate prerequisite module id: ${m.id}`);
    modIds.add(m.id);
  }
  const qIds = new Set<string>();
  for (const q of assessmentBank) {
    if (qIds.has(q.id)) errors.push(`Duplicate question id: ${q.id}`);
    qIds.add(q.id);
  }

  // Competency references.
  for (const c of competencies) {
    for (const dep of c.dependencies) {
      if (!compIds.has(dep)) errors.push(`Competency ${c.id} depends on unknown ${dep}`);
    }
    for (const lid of c.taughtByLessonIds) {
      if (!getLessonById(lid)) errors.push(`Competency ${c.id} references unknown lesson ${lid}`);
    }
    for (const q of c.verifiedByQuestionIds) {
      if (!questionIds.has(q)) errors.push(`Competency ${c.id} references unknown question ${q}`);
    }
  }

  // Prerequisite module references.
  for (const m of prerequisiteModules) {
    for (const sid of m.sourceIds) {
      if (!resolveSourceId(sid)) errors.push(`Prerequisite ${m.id} references unresolved source ${sid}`);
    }
    for (const lid of m.unlocksLessonIds) {
      if (!getLessonById(lid)) errors.push(`Prerequisite ${m.id} unlocks unknown lesson ${lid}`);
    }
  }

  // Assessment questions: choice correctness / order sanity.
  for (const q of assessmentBank) {
    if (q.type === "single-choice") {
      const correct = q.choices.filter((c) => c.correct).length;
      if (correct !== 1) errors.push(`single-choice ${q.id} must have exactly one correct choice`);
    }
    if (q.type === "multi-choice") {
      const correct = q.choices.filter((c) => c.correct).length;
      if (correct < 1) errors.push(`multi-choice ${q.id} must have at least one correct choice`);
    }
    if (q.type === "order") {
      const orders = q.choices.map((c) => c.order).sort((a, b) => (a ?? 0) - (b ?? 0));
      const expected = q.choices.map((_, i) => i);
      if (JSON.stringify(orders) !== JSON.stringify(expected)) {
        errors.push(`order question ${q.id} must have contiguous 0-based order values`);
      }
    }
  }

  // Lesson enhancements reference real lessons.
  const seenLessons = new Set<string>();
  for (const e of lessonEnhancements) {
    if (!getLessonById(e.lessonId)) errors.push(`Enhancement references unknown lesson ${e.lessonId}`);
    if (seenLessons.has(e.lessonId)) errors.push(`Duplicate enhancement for lesson ${e.lessonId}`);
    seenLessons.add(e.lessonId);
  }

  return errors;
}

// Fail loudly at import if integrity is broken.
const integrityErrors = checkV2Integrity();
if (integrityErrors.length > 0) {
  throw new Error(`v2 content integrity errors:\n- ${integrityErrors.join("\n- ")}`);
}

// Lookups
const compById = new Map(competencies.map((c) => [c.id, c]));
const moduleById = new Map(prerequisiteModules.map((m) => [m.id, m]));
const questionById = new Map(assessmentBank.map((q) => [q.id, q]));
const enhancementByLesson = new Map(lessonEnhancements.map((e) => [e.lessonId, e]));
const sourceV2ById = new Map(sourcesV2.map((s) => [s.id, s]));

export function getCompetency(id: string): CompetencyV2 | undefined {
  return compById.get(id);
}
export function getPrerequisiteModule(id: string): PrerequisiteModule | undefined {
  return moduleById.get(id);
}
export function getQuestion(id: string): AssessmentQuestion | undefined {
  return questionById.get(id);
}
export function getEnhancement(lessonId: string): LessonEnhancement | undefined {
  return enhancementByLesson.get(lessonId);
}
export function getSourceV2(id: string): SourceV2 | undefined {
  return sourceV2ById.get(id);
}

/** All destination competencies in dependency order (topological). */
export function competenciesInOrder(): CompetencyV2[] {
  const result: CompetencyV2[] = [];
  const visited = new Set<string>();
  const visit = (c: CompetencyV2) => {
    if (visited.has(c.id)) return;
    visited.add(c.id);
    for (const dep of c.dependencies) {
      const d = compById.get(dep);
      if (d) visit(d);
    }
    result.push(c);
  };
  for (const c of competencies) visit(c);
  return result;
}

export function questionsForSkill(area: SkillArea): AssessmentQuestion[] {
  return assessmentBank.filter((q) => q.skillArea === area);
}

export function prerequisitesForSkill(area: SkillArea): PrerequisiteModule[] {
  return prerequisiteModules.filter((m) => m.skillArea === area);
}

export { SKILL_AREAS };
export type { SkillArea };
