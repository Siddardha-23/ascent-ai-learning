import "server-only";
import type { ProgressRepository } from "./repository";
import { BlobRepository, isBlobConfigured } from "./blob-repository";
import { LocalRepository } from "./local-repository";
import type { StorageMode } from "./schema";

/**
 * Select the persistence backend. Prefer a configured private Blob store;
 * otherwise fall back to the clearly-labeled local development adapter.
 * A Postgres adapter could be slotted in here behind the same interface if an
 * authorized Marketplace integration were present.
 */
export function getRepository(): ProgressRepository {
  if (isBlobConfigured()) {
    return new BlobRepository();
  }
  return new LocalRepository();
}

export function activeStorageMode(): StorageMode {
  return isBlobConfigured() ? "blob" : "local";
}
