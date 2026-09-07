import { z } from "zod";

/**
 * Runtime schemas for the v2 adaptive-learning content modules. These are
 * authored, versioned, and validated at build/import time. They never mutate
 * the canonical curriculum; they reference it by stable lesson/source IDs.
 */

/** Skill areas the assessment measures and the composer reasons about. */
export const SKILL_AREAS = [
  "cli-git",
  "programming-python",
  "web-http-api",
  "frontend",
  "backend-data",
  "math-data",
  "ml-foundations",
  "deep-learning",
  "llm-apps",
  "retrieval-rag",
  "graphs",
  "agents-frameworks",
  "cloud-containers",
  "security-observability",
] as const;
export const skillAreaSchema = z.enum(SKILL_AREAS);
export type SkillArea = z.infer<typeof skillAreaSchema>;

export const SKILL_AREA_LABELS: Record<SkillArea, string> = {
  "cli-git": "Command line & Git",
  "programming-python": "Programming & Python",
  "web-http-api": "Web, HTTP & APIs",
  frontend: "Frontend foundations",
  "backend-data": "Backend & data",
  "math-data": "Math & data",
  "ml-foundations": "Machine-learning foundations",
  "deep-learning": "Deep learning",
  "llm-apps": "LLM applications",
  "retrieval-rag": "Retrieval & RAG",
  graphs: "Graphs & knowledge graphs",
  "agents-frameworks": "Agents & frameworks",
  "cloud-containers": "Cloud & containers",
  "security-observability": "Security & observability",
};

/** Destination competency level for a competency in the fixed goal. */
export const destinationLevelSchema = z.enum([
  "aware", // can explain the concept
  "practitioner", // can implement with the course
  "builder", // can design and build independently
]);
export type DestinationLevel = z.infer<typeof destinationLevelSchema>;

// ---- Competencies -------------------------------------------------------

export const competencySchemaV2 = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  skillArea: skillAreaSchema,
  destinationLevel: destinationLevelSchema,
  /** Competency IDs this one depends on. */
  dependencies: z.array(z.string()).default([]),
  /** Canonical lesson IDs that teach this competency. */
  taughtByLessonIds: z.array(z.string()).default([]),
  /** Assessment question IDs that can verify prior knowledge of it. */
  verifiedByQuestionIds: z.array(z.string()).default([]),
  /** Is this part of the fixed destination graph (always true here). */
  destination: z.boolean().default(true),
});
export type CompetencyV2 = z.infer<typeof competencySchemaV2>;

export const competenciesFileSchema = z.object({
  moduleVersion: z.string().min(1),
  competencies: z.array(competencySchemaV2).min(1),
});

// ---- Prerequisite modules ----------------------------------------------

export const prereqBlockSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
  code: z.string().optional(),
  codeLang: z.string().optional(),
});

export const prereqExerciseSchema = z.object({
  prompt: z.string().min(1),
  answer: z.string().min(1),
});

export const prerequisiteModuleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  skillArea: skillAreaSchema,
  /** Which starting gap this addresses (human-readable). */
  targetGap: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
  explanation: z.array(prereqBlockSchema).min(1),
  exercises: z.array(prereqExerciseSchema).default([]),
  checkpoint: z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  }),
  evidencePrompt: z.string().min(1),
  /** Canonical source IDs (must resolve). */
  sourceIds: z.array(z.string()).default([]),
  /** Canonical lesson IDs this module prepares the learner for. */
  unlocksLessonIds: z.array(z.string()).default([]),
});
export type PrerequisiteModule = z.infer<typeof prerequisiteModuleSchema>;

export const prerequisiteModulesFileSchema = z.object({
  moduleVersion: z.string().min(1),
  modules: z.array(prerequisiteModuleSchema).min(1),
});

// ---- Assessment bank ----------------------------------------------------

export const questionTypeSchema = z.enum([
  "single-choice", // one correct option
  "multi-choice", // multiple correct options
  "order", // order the options into a correct sequence
  "self-report", // confidence/familiarity, not scored as correctness
]);
export type QuestionType = z.infer<typeof questionTypeSchema>;

export const difficultySchema = z.enum(["intro", "core", "advanced"]);

/** How strongly a correct answer verifies prior knowledge. */
export const evidenceStrengthSchema = z.enum(["weak", "moderate", "strong"]);

export const assessmentChoiceSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  correct: z.boolean().default(false),
  /** For "order" questions: the correct 0-based position. */
  order: z.number().int().optional(),
});

export const assessmentQuestionSchema = z.object({
  id: z.string().min(1),
  skillArea: skillAreaSchema,
  difficulty: difficultySchema,
  type: questionTypeSchema,
  prompt: z.string().min(1),
  choices: z.array(assessmentChoiceSchema).default([]),
  explanation: z.string().min(1),
  /** Scoring rubric note shown after answering. */
  rubric: z.string().min(1),
  evidenceStrength: evidenceStrengthSchema.default("moderate"),
  allowUnsure: z.boolean().default(true),
});
export type AssessmentQuestion = z.infer<typeof assessmentQuestionSchema>;

export const assessmentBankFileSchema = z.object({
  moduleVersion: z.string().min(1),
  questions: z.array(assessmentQuestionSchema).min(1),
});

// ---- Lesson enhancements ------------------------------------------------

export const enhancementBlockSchema = z.object({
  kind: z.enum([
    "why-this-matters",
    "connect-to-what-you-know",
    "mental-model",
    "worked-walkthrough",
    "annotated-code",
    "predict-before-reveal",
    "play",
    "misconception",
    "explain-back",
  ]),
  title: z.string().min(1),
  body: z.string().min(1),
  code: z.string().optional(),
  codeLang: z.string().optional(),
  /** For predict-before-reveal / explain-back: the reveal/reference text. */
  reveal: z.string().optional(),
  /** Optional interactive visual id to render inline. */
  visualId: z.string().optional(),
});
export type EnhancementBlock = z.infer<typeof enhancementBlockSchema>;

export const lessonEnhancementSchema = z.object({
  lessonId: z.string().min(1),
  blocks: z.array(enhancementBlockSchema).min(1),
});
export type LessonEnhancement = z.infer<typeof lessonEnhancementSchema>;

export const lessonEnhancementsFileSchema = z.object({
  moduleVersion: z.string().min(1),
  enhancements: z.array(lessonEnhancementSchema).min(1),
});

// ---- Additive source catalog (v2) --------------------------------------

export const sourceV2Schema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: z.string().url(),
  type: z.string().min(1),
  why: z.string().min(1),
  access: z.string().min(1),
  verifiedOn: z.string().min(1),
});
export type SourceV2 = z.infer<typeof sourceV2Schema>;

export const sourcesV2FileSchema = z.array(sourceV2Schema);
