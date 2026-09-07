import {
  parseAndMigrateBackup,
  backupV1Schema,
  emptyState,
  LIMITS,
  type Backup,
  type LearnerState,
  type ProfileId,
} from "./schema";

/** Build a versioned (v2) per-profile backup object. */
export function createBackup(state: LearnerState): Backup {
  return {
    kind: "ascent-backup",
    backupVersion: 2,
    profileId: state.profileId,
    contentVersion: state.contentVersion,
    exportedAt: new Date().toISOString(),
    state,
  };
}

export interface ImportPreview {
  ok: true;
  backup: Backup;
  warnings: string[];
}
export interface ImportError {
  ok: false;
  message: string;
}

/**
 * Validate an imported backup against schema, size, and the expected profile.
 * Never silently replaces state — callers must show a preview and confirm.
 */
export function parseBackup(
  raw: string,
  expectedProfile: ProfileId,
  currentContentVersion: string,
): ImportPreview | ImportError {
  if (Buffer?.byteLength
    ? Buffer.byteLength(raw, "utf8") > LIMITS.backupBytes
    : raw.length > LIMITS.backupBytes) {
    return { ok: false, message: "Backup file is too large." };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, message: "File is not valid JSON." };
  }
  const wasV1 = backupV1Schema.safeParse(parsed).success;
  // Accept either backup version; v1 is migrated to v2.
  const backup = parseAndMigrateBackup(parsed);
  if (!backup) {
    return { ok: false, message: "Not a valid Ascent backup (unrecognized version or shape)." };
  }
  if (backup.profileId !== expectedProfile) {
    return {
      ok: false,
      message: `This backup is for "${backup.profileId}", not the current profile "${expectedProfile}".`,
    };
  }
  const warnings: string[] = [];
  if (wasV1) {
    warnings.push(
      "This is an older (v1) backup. It will be upgraded to the current format on import; your tasks, notes, evidence and sessions are preserved.",
    );
  }
  if (backup.contentVersion !== currentContentVersion) {
    warnings.push(
      `Backup content version (${backup.contentVersion}) differs from current (${currentContentVersion}). Task IDs are preserved; unknown IDs are ignored on import.`,
    );
  }
  return { ok: true, backup, warnings };
}

/** State to write on import: adopt current content version, keep learner data. */
export function stateFromBackup(
  backup: Backup,
  currentContentVersion: string,
): LearnerState {
  return {
    ...backup.state,
    contentVersion: currentContentVersion,
    updatedAt: new Date().toISOString(),
  };
}

export function resetState(
  profileId: ProfileId,
  contentVersion: string,
  timezone: string,
  displayName?: string,
): LearnerState {
  return emptyState(profileId, contentVersion, timezone, displayName);
}
