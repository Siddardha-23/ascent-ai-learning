import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { learnerStateSchema, type LearnerState, type ProfileId } from "./schema";
import type {
  LoadResult,
  ProgressRepository,
  SaveError,
  SaveResult,
} from "./repository";

/**
 * Local development adapter. Writes JSON under .ascent-data/ at the project
 * root. This is explicitly device-local and NOT durable in serverless
 * production (design.md); the factory only selects it when no Blob token is
 * present, and the UI labels the storage mode as local.
 */

const DIR = path.join(process.cwd(), ".ascent-data");

function fileFor(profileId: ProfileId): string {
  return path.join(DIR, `${profileId}.json`);
}

function revisionOf(body: string): string {
  return createHash("sha256").update(body).digest("hex").slice(0, 16);
}

export class LocalRepository implements ProgressRepository {
  readonly mode = "local" as const;

  async load(profileId: ProfileId): Promise<LoadResult> {
    try {
      const body = await fs.readFile(fileFor(profileId), "utf8");
      const state = learnerStateSchema.parse(JSON.parse(body));
      return { state, revision: revisionOf(body), storageMode: this.mode };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return { state: null, revision: null, storageMode: this.mode };
      }
      // Corruption recovery: surface as unavailable rather than empty overwrite.
      throw err;
    }
  }

  async save(
    profileId: ProfileId,
    state: LearnerState,
    expectedRevision: string | null,
  ): Promise<SaveResult | SaveError> {
    await fs.mkdir(DIR, { recursive: true });
    const file = fileFor(profileId);

    // Read current for revision comparison.
    let currentBody: string | null = null;
    try {
      currentBody = await fs.readFile(file, "utf8");
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
    const currentRevision = currentBody ? revisionOf(currentBody) : null;

    // Create-only collision.
    if (expectedRevision === null && currentRevision !== null) {
      const current = learnerStateSchema.parse(JSON.parse(currentBody!));
      return { ok: false, kind: "conflict", current, revision: currentRevision };
    }
    // Stale update.
    if (expectedRevision !== null && expectedRevision !== currentRevision) {
      const current = currentBody
        ? learnerStateSchema.parse(JSON.parse(currentBody))
        : null;
      return { ok: false, kind: "conflict", current, revision: currentRevision };
    }

    const body = JSON.stringify(state, null, 2);
    await fs.writeFile(file, body, "utf8");
    return { ok: true, state, revision: revisionOf(body), storageMode: this.mode };
  }
}
