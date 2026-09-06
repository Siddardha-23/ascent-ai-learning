import type { LearnerState, ProfileId, StorageMode } from "./schema";

/**
 * ProgressRepository abstracts persistence so the server API can use either a
 * private Vercel Blob store or an authorized Postgres integration without the
 * route code changing. The browser never talks to a store directly.
 */

export interface LoadResult {
  state: LearnerState | null;
  revision: string | null;
  storageMode: StorageMode;
}

export interface SaveResult {
  ok: true;
  state: LearnerState;
  revision: string;
  storageMode: StorageMode;
}

export type SaveError =
  | { ok: false; kind: "conflict"; current: LearnerState | null; revision: string | null }
  | { ok: false; kind: "unavailable"; message: string }
  | { ok: false; kind: "invalid"; message: string };

export interface ProgressRepository {
  readonly mode: StorageMode;
  /** Fresh, authoritative read for a profile. */
  load(profileId: ProfileId): Promise<LoadResult>;
  /**
   * Revision-checked write. `expectedRevision === null` means "create only";
   * a collision on create returns a conflict rather than overwriting.
   */
  save(
    profileId: ProfileId,
    state: LearnerState,
    expectedRevision: string | null,
  ): Promise<SaveResult | SaveError>;
}
