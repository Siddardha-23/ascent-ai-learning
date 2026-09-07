import "server-only";
import {
  get,
  put,
  BlobPreconditionFailedError,
} from "@vercel/blob";
import { parseAndMigrate, type LearnerState, type ProfileId } from "./schema";
import type {
  LoadResult,
  ProgressRepository,
  SaveError,
  SaveResult,
} from "./repository";

/**
 * Private Vercel Blob adapter (design.md). All operations are server-side and
 * use a fixed per-profile namespace. Private access keeps objects off public
 * URLs. The object ETag is the concurrency revision.
 *
 * Requires:
 *   - BLOB_READ_WRITE_TOKEN (from a connected PRIVATE Blob store)
 * Never expose the token or object URLs to the browser.
 */

const NAMESPACE = "ascent/progress/v1";

function pathFor(profileId: ProfileId): string {
  return `${NAMESPACE}/${profileId}.json`;
}

function token(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

export function isBlobConfigured(): boolean {
  return Boolean(token());
}

export class BlobRepository implements ProgressRepository {
  readonly mode = "blob" as const;

  async load(profileId: ProfileId): Promise<LoadResult> {
    const rwToken = token();
    if (!rwToken) {
      // Do not turn a missing credential into an empty profile.
      throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
    }
    // Fresh read: useCache: false so we always reflect the latest write.
    const result = await get(pathFor(profileId), {
      access: "private",
      useCache: false,
      token: rwToken,
    });

    if (!result || result.statusCode !== 200) {
      return { state: null, revision: null, storageMode: this.mode };
    }

    const text = await new Response(result.stream).text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Stored progress is not valid JSON");
    }
    // Migrate v1 -> v2 on read so existing data is never lost.
    const state = parseAndMigrate(parsed);
    if (!state) throw new Error("Stored progress does not match a known schema version");
    return { state, revision: result.blob.etag, storageMode: this.mode };
  }

  async save(
    profileId: ProfileId,
    state: LearnerState,
    expectedRevision: string | null,
  ): Promise<SaveResult | SaveError> {
    const rwToken = token();
    if (!rwToken) {
      return { ok: false, kind: "unavailable", message: "Blob storage not configured" };
    }

    const body = JSON.stringify(state);
    const pathname = pathFor(profileId);

    try {
      const putResult = await put(pathname, body, {
        access: "private",
        contentType: "application/json",
        token: rwToken,
        addRandomSuffix: false,
        // create-only when no expected revision; conditional update otherwise.
        ...(expectedRevision === null
          ? { allowOverwrite: false }
          : { ifMatch: expectedRevision }),
      });
      return {
        ok: true,
        state,
        revision: putResult.etag,
        storageMode: this.mode,
      };
    } catch (err) {
      // ETag mismatch (stale update) or create collision -> conflict.
      if (
        err instanceof BlobPreconditionFailedError ||
        (err instanceof Error && /already exists|precondition|ETag/i.test(err.message))
      ) {
        // Re-read authoritative current state so the client can reconcile.
        try {
          const current = await this.load(profileId);
          return {
            ok: false,
            kind: "conflict",
            current: current.state,
            revision: current.revision,
          };
        } catch {
          return { ok: false, kind: "conflict", current: null, revision: null };
        }
      }
      return {
        ok: false,
        kind: "unavailable",
        message: err instanceof Error ? err.message : "Unknown storage error",
      };
    }
  }
}
