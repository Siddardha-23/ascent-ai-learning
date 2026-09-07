import { z } from "zod";
import { v2BlockSchema, emptyV2Block } from "./v2-schema";

/**
 * Learner state schema (design.md). Learner state is mutable and stored
 * separately from the versioned course content. Bounds are application
 * design choices, not provider limits.
 *
 * v2 (this file) embeds all v1 fields plus an additive optional `v2` block.
 * Existing v1 states are migrated on read; no data is lost.
 */

/**
 * A profile is identified by a stable slug derived from a typed name.
 * Anyone with the link can enter any name; the same name always maps to the
 * same learning space. This is intentionally simple name selection, not secure
 * authentication.
 */
export type ProfileId = string;

/** Known display names (retrofits the original two users). */
export const PROFILE_LABELS: Record<string, string> = {
  harshith: "Harshith",
  aparna: "Aparna",
};

/** Max length of a typed name / derived id. */
export const PROFILE_ID_MAX = 40;

/**
 * Normalize a typed name into a stable id slug:
 *  - lowercase, trim, collapse internal whitespace/underscores to single "-"
 *  - keep only a–z, 0–9 and "-"
 * So "Harshith", "harshith", " Harshith " all map to "harshith", which reuses
 * the existing stored progress for the original users.
 */
export function normalizeProfileId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, PROFILE_ID_MAX);
}

/** A valid profile id is a non-empty safe slug (no path characters). */
export function isValidProfileId(id: string): boolean {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(id) && id.length <= PROFILE_ID_MAX;
}

/** Human-friendly label for a profile id. */
export function profileLabel(id: string, displayName?: string | null): string {
  if (displayName && displayName.trim()) return displayName.trim();
  if (PROFILE_LABELS[id]) return PROFILE_LABELS[id];
  // Title-case the slug as a fallback: "john-doe" -> "John Doe".
  return id
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Zod schema for a validated profile id (safe slug). */
export const profileIdSchema = z
  .string()
  .max(PROFILE_ID_MAX)
  .refine(isValidProfileId, "Invalid profile id");

export const competencySchema = z.enum([
  "explain", // Can explain
  "guided", // Can implement with guidance
  "independent", // Can implement independently
  "extend", // Can diagnose or extend
]);
export type Competency = z.infer<typeof competencySchema>;

export const COMPETENCY_LABELS: Record<Competency, string> = {
  explain: "Can explain",
  guided: "Can implement with guidance",
  independent: "Can implement independently",
  extend: "Can diagnose or extend",
};

export const executionSchema = z.enum(["actual", "mock", "not-run", "mixed"]);
export type ExecutionStatus = z.infer<typeof executionSchema>;

// Bounds (design.md)
export const LIMITS = {
  notes: 20_000,
  evidenceText: 10_000,
  reflection: 10_000,
  checkpointAnswer: 10_000,
  linksPerDay: 20,
  linkLength: 2_000,
  sessionMinMinutes: 1,
  sessionMaxMinutes: 720,
  maxSessions: 5_000,
  backupBytes: 1_048_576, // 1 MiB
} as const;

export const evidenceSchema = z.object({
  text: z.string().max(LIMITS.evidenceText).default(""),
  links: z.array(z.string().max(LIMITS.linkLength)).max(LIMITS.linksPerDay).default([]),
  execution: executionSchema.default("not-run"),
});

export const checkpointSchema = z.object({
  answer: z.string().max(LIMITS.checkpointAnswer).default(""),
  reviewed: z.boolean().default(false),
  understood: z.boolean().nullable().default(null),
});

export const dayStateSchema = z.object({
  completedTaskIds: z.array(z.string()).default([]),
  acceptanceChecks: z.record(z.boolean()).default({}),
  notes: z.string().max(LIMITS.notes).default(""),
  evidence: evidenceSchema.default({ text: "", links: [], execution: "not-run" }),
  reflection: z.string().max(LIMITS.reflection).default(""),
  checkpoint: checkpointSchema.default({ answer: "", reviewed: false, understood: null }),
  competency: competencySchema.nullable().default(null),
});
export type DayState = z.infer<typeof dayStateSchema>;

export const studySessionSchema = z.object({
  id: z.string().min(1),
  lessonId: z.string().min(1),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.string().min(1),
  minutes: z
    .number()
    .int()
    .min(LIMITS.sessionMinMinutes)
    .max(LIMITS.sessionMaxMinutes),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type StudySession = z.infer<typeof studySessionSchema>;

export const settingsSchema = z.object({
  weeklyTargetMinutes: z.number().int().min(0).max(10_080).default(300),
  timezone: z.string().min(1).default("UTC"),
});
export type Settings = z.infer<typeof settingsSchema>;

export const lastLocationSchema = z
  .object({
    lessonId: z.string(),
    taskId: z.string().optional(),
  })
  .nullable();

/**
 * Current learner state is schemaVersion 2. It embeds all v1 fields plus the
 * additive, optional v2 block (assessment, preferences, plan, validated prior
 * knowledge, AI consent/cache). v1 states are migrated on read (see
 * parseAndMigrate) so no existing Harshith/Aparna data is lost.
 */
export const CURRENT_SCHEMA_VERSION = 2 as const;

/** Fields shared by every learner-state version. */
const baseStateShape = {
  contentVersion: z.string(),
  profileId: profileIdSchema,
  displayName: z.string().max(PROFILE_ID_MAX * 2).optional(),
  days: z.record(dayStateSchema).default({}),
  sessions: z.array(studySessionSchema).max(LIMITS.maxSessions).default([]),
  settings: settingsSchema.default({ weeklyTargetMinutes: 300, timezone: "UTC" }),
  lastLocation: lastLocationSchema.default(null),
  updatedAt: z.string(),
};

/** Canonical (v2) learner state. */
export const learnerStateSchema = z.object({
  schemaVersion: z.literal(2),
  ...baseStateShape,
  v2: v2BlockSchema.default(emptyV2Block()),
});
export type LearnerState = z.infer<typeof learnerStateSchema>;

/** Legacy v1 shape, accepted only as migration input. */
export const learnerStateV1Schema = z.object({
  schemaVersion: z.literal(1),
  ...baseStateShape,
});
export type LearnerStateV1 = z.infer<typeof learnerStateV1Schema>;

/**
 * Migrate a validated v1 state to the current v2 shape. Additive only:
 * every v1 field is preserved and the v2 block is initialized empty.
 */
export function migrateV1toV2(v1: LearnerStateV1): LearnerState {
  return {
    ...v1,
    schemaVersion: 2,
    v2: emptyV2Block(),
  };
}

/**
 * Parse unknown stored/imported data of EITHER version and return current v2
 * state, or null if it is not a recognizable learner state. This is the single
 * entry point used by every reader (repositories, client drafts, backups).
 */
export function parseAndMigrate(input: unknown): LearnerState | null {
  const v2 = learnerStateSchema.safeParse(input);
  if (v2.success) return v2.data;
  const v1 = learnerStateV1Schema.safeParse(input);
  if (v1.success) return migrateV1toV2(v1.data);
  return null;
}

export const storageModeSchema = z.enum(["local", "blob", "postgres"]);
export type StorageMode = z.infer<typeof storageModeSchema>;

export const storedProgressSchema = z.object({
  state: learnerStateSchema,
  revision: z.string().nullable(),
  storageMode: storageModeSchema,
});
export type StoredProgress = z.infer<typeof storedProgressSchema>;

/** Current (v2) backup. */
export const backupSchema = z.object({
  kind: z.literal("ascent-backup"),
  backupVersion: z.literal(2),
  profileId: profileIdSchema,
  contentVersion: z.string(),
  exportedAt: z.string(),
  state: learnerStateSchema,
});
export type Backup = z.infer<typeof backupSchema>;

/** Legacy (v1) backup, accepted for import and migrated. */
export const backupV1Schema = z.object({
  kind: z.literal("ascent-backup"),
  backupVersion: z.literal(1),
  profileId: profileIdSchema,
  contentVersion: z.string(),
  exportedAt: z.string(),
  state: learnerStateV1Schema,
});
export type BackupV1 = z.infer<typeof backupV1Schema>;

/**
 * Parse a backup of either version. Returns a normalized v2 backup (state
 * migrated) or null if it is not a recognizable Ascent backup.
 */
export function parseAndMigrateBackup(input: unknown): Backup | null {
  const v2 = backupSchema.safeParse(input);
  if (v2.success) return v2.data;
  const v1 = backupV1Schema.safeParse(input);
  if (v1.success) {
    return {
      kind: "ascent-backup",
      backupVersion: 2,
      profileId: v1.data.profileId,
      contentVersion: v1.data.contentVersion,
      exportedAt: v1.data.exportedAt,
      state: migrateV1toV2(v1.data.state),
    };
  }
  return null;
}

export function emptyState(
  profileId: ProfileId,
  contentVersion: string,
  timezone = "UTC",
  displayName?: string,
): LearnerState {
  return {
    schemaVersion: 2,
    contentVersion,
    profileId,
    ...(displayName ? { displayName } : {}),
    days: {},
    sessions: [],
    settings: { weeklyTargetMinutes: 300, timezone },
    lastLocation: null,
    updatedAt: new Date().toISOString(),
    v2: emptyV2Block(),
  };
}

export function emptyDayState(): DayState {
  return {
    completedTaskIds: [],
    acceptanceChecks: {},
    notes: "",
    evidence: { text: "", links: [], execution: "not-run" },
    reflection: "",
    checkpoint: { answer: "", reviewed: false, understood: null },
    competency: null,
  };
}
