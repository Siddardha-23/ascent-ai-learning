import { z } from "zod";

/**
 * Runtime schemas for the canonical, versioned course content.
 * Content is shipped with the app and is never mutated by learner APIs.
 * These schemas validate curriculum.json / sources.json / glossary.json
 * exactly as authored in the Codex package (schemaVersion 1).
 */

export const resourceAssignmentSchema = z.object({
  sourceId: z.string().min(1),
  priority: z.string().min(1), // e.g. "Core" | "Reference / optional"
  instruction: z.string().min(1),
});

export const taskKindSchema = z.enum([
  "learn",
  "lab",
  "verify",
  "recall",
  "reflect",
]);

export const taskSchema = z.object({
  id: z.string().min(1),
  kind: taskKindSchema,
  title: z.string().min(1),
});

export const labSchema = z.object({
  steps: z.array(z.string()).min(1),
  deliverable: z.string().min(1),
  checks: z.array(z.string()).min(1),
});

export const quizSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const suggestedSessionSchema = z.object({
  recallMinutes: z.number().optional(),
  learnMinutes: z.number().optional(),
  buildMinutes: z.number().optional(),
  verifyAndReflectMinutes: z.number().optional(),
});

export const lessonSchema = z.object({
  day: z.number().int().min(1).max(30),
  id: z.string().min(1),
  title: z.string().min(1),
  bridge: z.string().min(1),
  explain: z.string().min(1),
  analogy: z.string().min(1),
  topics: z.array(z.string()),
  goals: z.array(z.string()),
  lab: labSchema,
  quiz: quizSchema,
  resources: z.array(z.string()).optional().default([]),
  stretch: z.string().optional().nullable(),
  minutes: z.number().int().positive(),
  level: z.string().min(1),
  prerequisites: z.array(z.string()).optional().default([]),
  resourceAssignments: z.array(resourceAssignmentSchema),
  tasks: z.array(taskSchema).min(1),
  suggestedSession: suggestedSessionSchema.optional().nullable(),
  evidencePrompt: z.string().optional().nullable(),
});

export const curriculumSchema = z.object({
  schemaVersion: z.literal(1),
  courseId: z.string().min(1),
  contentVersion: z.string().min(1),
  title: z.string().min(1),
  profiles: z.array(z.string()).optional(),
  preparedOn: z.string().optional(),
  totalLearningDays: z.number().int(),
  estimatedCoreHours: z.number(),
  pacing: z.string().optional().nullable(),
  scope: z.string().optional().nullable(),
  project: z.union([z.string(), z.record(z.unknown())]).optional().nullable(),
  lessons: z.array(lessonSchema).length(30),
});

export const sourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: z.string().url(),
  type: z.string().min(1),
  assignment: z.string().optional().nullable(),
  why: z.string().optional().nullable(),
  publishedOrUpdated: z.string().optional().nullable(),
  dateNote: z.string().optional().nullable(),
  verifiedOn: z.string().optional().nullable(),
  verification: z.string().optional().nullable(),
  access: z.string().optional().nullable(),
  companions: z.array(z.unknown()).optional().default([]),
});

export const glossaryTermSchema = z.object({
  id: z.string().min(1),
  term: z.string().min(1),
  definition: z.string().min(1),
  example: z.string().optional().nullable(),
  firstDay: z.number().int().optional().nullable(),
  sourceIds: z.array(z.string()).optional().default([]),
});

export const sourcesSchema = z.array(sourceSchema);
export const glossarySchema = z.array(glossaryTermSchema);

export type ResourceAssignment = z.infer<typeof resourceAssignmentSchema>;
export type TaskKind = z.infer<typeof taskKindSchema>;
export type Task = z.infer<typeof taskSchema>;
export type Lab = z.infer<typeof labSchema>;
export type Quiz = z.infer<typeof quizSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type Curriculum = z.infer<typeof curriculumSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type GlossaryTerm = z.infer<typeof glossaryTermSchema>;

/** The four course phases per requirements R2. */
export const PHASES = [
  { id: "foundations", label: "Foundations", days: [1, 2, 3, 4, 5, 6, 7, 8] },
  {
    id: "genai-retrieval",
    label: "Generative AI & retrieval",
    days: [9, 10, 11, 12, 13, 14, 15, 16],
  },
  {
    id: "agent-engineering",
    label: "Agent engineering",
    days: [17, 18, 19, 20, 21, 22, 23],
  },
  {
    id: "production-innovation",
    label: "Production & innovation",
    days: [24, 25, 26, 27, 28, 29, 30],
  },
] as const;

export type PhaseId = (typeof PHASES)[number]["id"];

export function phaseForDay(day: number) {
  return PHASES.find((p) => (p.days as readonly number[]).includes(day)) ?? PHASES[0];
}
