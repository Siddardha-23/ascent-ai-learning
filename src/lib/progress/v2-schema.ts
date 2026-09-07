import { z } from "zod";
import { SKILL_AREAS } from "@/lib/content/v2-schema";

/**
 * v2 learner-state sub-schemas: assessment, preferences, plan revisions,
 * validated prior knowledge, and AI consent/cache metadata. All bounded.
 * These are additive and optional so v1 states migrate without data loss.
 */

export const V2_LIMITS = {
  maxAssessmentResults: 20, // retake history cap
  maxPlanRevisions: 30, // plan history cap
  maxPlanItems: 120, // 30 lessons + prereqs + variants headroom
  maxAnswerLen: 40,
  maxRationaleLen: 400,
  maxAiCacheEntries: 200,
  maxEvidenceRefs: 40,
} as const;

const skillAreaEnum = z.enum(SKILL_AREAS);

// ---- Assessment ---------------------------------------------------------

/** A single answer the learner gave during the assessment. */
export const assessmentAnswerSchema = z.object({
  questionId: z.string().min(1),
  /** choice id(s) selected, ordered choice ids, or "unsure". */
  value: z.union([z.string(), z.array(z.string())]),
  unsure: z.boolean().default(false),
});
export type AssessmentAnswer = z.infer<typeof assessmentAnswerSchema>;

/** Draft, saved after every step so the wizard can resume. */
export const assessmentDraftSchema = z.object({
  startedAt: z.string(),
  updatedAt: z.string(),
  step: z.number().int().min(0),
  answers: z.array(assessmentAnswerSchema).max(200).default([]),
  /** partial self-report + preference fields captured so far */
  partialPreferences: z.record(z.unknown()).optional(),
});
export type AssessmentDraft = z.infer<typeof assessmentDraftSchema>;

/** Deterministic per-skill outcome states (R15). */
export const skillStateSchema = z.enum([
  "needs-foundation",
  "ready-to-learn",
  "verify-prior-knowledge",
  "validated-prior-knowledge",
]);
export type SkillState = z.infer<typeof skillStateSchema>;

export const SKILL_STATE_LABELS: Record<SkillState, string> = {
  "needs-foundation": "Needs a foundation",
  "ready-to-learn": "Ready to learn the course topic",
  "verify-prior-knowledge": "Verify prior knowledge",
  "validated-prior-knowledge": "Validated prior knowledge",
};

export const skillFindingSchema = z.object({
  skillArea: skillAreaEnum,
  state: skillStateSchema,
  /** Transparent explanation of why this state was assigned. */
  explanation: z.string().max(600),
  /** Question IDs whose answers affected the result. */
  evidenceQuestionIds: z.array(z.string()).max(V2_LIMITS.maxEvidenceRefs).default([]),
});
export type SkillFinding = z.infer<typeof skillFindingSchema>;

export const assessmentResultSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string(),
  /** Algorithm version so results are reproducible/explainable. */
  scorerVersion: z.string().min(1),
  answers: z.array(assessmentAnswerSchema).max(200).default([]),
  findings: z.array(skillFindingSchema).default([]),
});
export type AssessmentResult = z.infer<typeof assessmentResultSchema>;

// ---- Preferences --------------------------------------------------------

export const teachingModeSchema = z.enum([
  "concise-text",
  "detailed-text",
  "annotated-code",
  "diagrams",
  "video-resources",
  "build-first",
]);
export type TeachingMode = z.infer<typeof teachingModeSchema>;

export const computeConstraintSchema = z.enum([
  "browser-cpu",
  "local-gpu",
  "free-apis-only",
  "paid-apis",
]);

export const cloudPreferenceSchema = z.enum(["aws", "gcp", "azure", "none"]);

export const depthPreferenceSchema = z.enum(["simple", "deeper", "implementation"]);
export type DepthPreference = z.infer<typeof depthPreferenceSchema>;

export const learningPreferencesSchema = z.object({
  role: z.string().max(120).optional(),
  languages: z.array(z.string().max(40)).max(30).default([]),
  weeklyMinutes: z.number().int().min(0).max(10_080).default(300),
  sessionMinutes: z.number().int().min(10).max(240).default(45),
  teachingModes: z.array(teachingModeSchema).max(6).default([]),
  compute: z.array(computeConstraintSchema).max(4).default([]),
  cloud: cloudPreferenceSchema.default("none"),
  depth: depthPreferenceSchema.default("simple"),
});
export type LearningPreferences = z.infer<typeof learningPreferencesSchema>;

// ---- Plan ---------------------------------------------------------------

export const planItemStatusSchema = z.enum([
  "foundation", // a prerequisite bridge module
  "standard", // a canonical lesson in full
  "revision", // a faster revision lane after verified diagnostics
  "challenge", // extra depth
  "optional-depth", // stretch content
]);
export type PlanItemStatus = z.infer<typeof planItemStatusSchema>;

export const planItemRefSchema = z.enum(["lesson", "prerequisite", "variant"]);

export const planItemSchema = z.object({
  /** Stable ID of a canonical lesson, prerequisite module, or variant. */
  refId: z.string().min(1),
  refType: planItemRefSchema,
  status: planItemStatusSchema,
  rationale: z.string().max(V2_LIMITS.maxRationaleLen),
  estimatedMinutes: z.number().int().min(0).max(100_000),
  dependencyRefIds: z.array(z.string()).max(50).default([]),
});
export type PlanItem = z.infer<typeof planItemSchema>;

export const planRevisionSchema = z.object({
  id: z.string().min(1),
  algorithmVersion: z.string().min(1),
  contentVersion: z.string().min(1),
  createdAt: z.string(),
  /** Which assessment result this plan was composed from (if any). */
  assessmentResultId: z.string().nullable().default(null),
  items: z.array(planItemSchema).max(V2_LIMITS.maxPlanItems).default([]),
  /** Destination competency IDs (unchanged across plans). */
  destinationCompetencyIds: z.array(z.string()).default([]),
  estimatedTotalMinutes: z.number().int().min(0).default(0),
});
export type PlanRevision = z.infer<typeof planRevisionSchema>;

export const planStateSchema = z.object({
  /** null = standard path is active. */
  activeRevisionId: z.string().nullable().default(null),
  revisions: z.array(planRevisionSchema).max(V2_LIMITS.maxPlanRevisions).default([]),
});
export type PlanState = z.infer<typeof planStateSchema>;

// ---- Validated prior knowledge -----------------------------------------

export const validatedKnowledgeSchema = z.object({
  skillArea: skillAreaEnum,
  state: skillStateSchema,
  assessmentResultId: z.string(),
  evidenceQuestionIds: z.array(z.string()).max(V2_LIMITS.maxEvidenceRefs).default([]),
  recordedAt: z.string(),
});
export type ValidatedKnowledge = z.infer<typeof validatedKnowledgeSchema>;

// ---- AI consent + cache metadata ---------------------------------------

export const aiCacheMetaSchema = z.object({
  /** Salted hash of prompt-template version + model strategy + content version + sanitized input. */
  key: z.string().min(1),
  templateVersion: z.string(),
  model: z.string(),
  createdAt: z.string(),
  outcome: z.enum(["ok", "fallback", "invalid", "timeout", "error"]),
});
export type AiCacheMeta = z.infer<typeof aiCacheMetaSchema>;

export const aiStateSchema = z.object({
  /** null = never asked; true/false = explicit consent decision. */
  consent: z.boolean().nullable().default(null),
  consentAt: z.string().optional(),
  revokedAt: z.string().optional(),
  cache: z.array(aiCacheMetaSchema).max(V2_LIMITS.maxAiCacheEntries).default([]),
});
export type AiState = z.infer<typeof aiStateSchema>;

// ---- The v2 additive block (all optional) ------------------------------

export const v2BlockSchema = z.object({
  assessment: z
    .object({
      draft: assessmentDraftSchema.optional(),
      results: z.array(assessmentResultSchema).max(V2_LIMITS.maxAssessmentResults).default([]),
    })
    .optional(),
  preferences: learningPreferencesSchema.optional(),
  plan: planStateSchema.optional(),
  validatedPriorKnowledge: z
    .array(validatedKnowledgeSchema)
    .max(SKILL_AREAS.length)
    .optional(),
  ai: aiStateSchema.optional(),
});
export type V2Block = z.infer<typeof v2BlockSchema>;

export function emptyV2Block(): V2Block {
  return {
    assessment: { results: [] },
    preferences: undefined,
    plan: { activeRevisionId: null, revisions: [] },
    validatedPriorKnowledge: [],
    ai: { consent: null, cache: [] },
  };
}
