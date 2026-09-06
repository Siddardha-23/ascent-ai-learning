import { describe, it, expect } from "vitest";
import { emptyState } from "@/lib/progress/schema";
import {
  createBackup,
  parseBackup,
  stateFromBackup,
} from "@/lib/progress/backup";

describe("backup export/import", () => {
  it("round-trips a backup for the same profile", () => {
    const state = emptyState("harshith", "v1", "UTC");
    const backup = createBackup(state);
    const raw = JSON.stringify(backup);
    const result = parseBackup(raw, "harshith", "v1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      const restored = stateFromBackup(result.backup, "v1");
      expect(restored.profileId).toBe("harshith");
    }
  });

  it("rejects a wrong-profile import", () => {
    const backup = createBackup(emptyState("harshith", "v1", "UTC"));
    const result = parseBackup(JSON.stringify(backup), "aparna", "v1");
    expect(result.ok).toBe(false);
  });

  it("rejects invalid JSON and non-backup objects", () => {
    expect(parseBackup("{not json", "harshith", "v1").ok).toBe(false);
    expect(parseBackup(JSON.stringify({ foo: 1 }), "harshith", "v1").ok).toBe(false);
  });

  it("warns on content-version mismatch but still imports", () => {
    const backup = createBackup(emptyState("harshith", "old-version", "UTC"));
    const result = parseBackup(JSON.stringify(backup), "harshith", "new-version");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.length).toBeGreaterThan(0);
      const restored = stateFromBackup(result.backup, "new-version");
      expect(restored.contentVersion).toBe("new-version");
    }
  });
});
