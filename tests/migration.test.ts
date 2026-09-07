import { describe, it, expect } from "vitest";
import {
  parseAndMigrate,
  parseAndMigrateBackup,
  learnerStateSchema,
  migrateV1toV2,
  type LearnerStateV1,
} from "@/lib/progress/schema";

/**
 * A realistic v1 Harshith state: partial day-01 progress with notes, evidence,
 * a reflection, a reviewed checkpoint, a study session, and a last location.
 * This is the exact shape stored in Blob/local before v2.
 */
function realV1State(profileId: string): LearnerStateV1 {
  return {
    schemaVersion: 1,
    contentVersion: "2026-09-05.1",
    profileId,
    displayName: profileId === "harshith" ? "Harshith" : "Aparna",
    days: {
      "day-01": {
        completedTaskIds: ["day-01-learn", "day-01-lab-1"],
        acceptanceChecks: { "day-01-check-1": true },
        notes: "Mapped browser -> Flask -> retrieval -> response.",
        evidence: {
          text: "Baseline runs without keys.",
          links: ["https://github.com/example/repo"],
          execution: "actual",
        },
        reflection: "I can now explain where a model sits in a request.",
        checkpoint: {
          answer: "No, policy authorizes the action.",
          reviewed: true,
          understood: true,
        },
        competency: "guided",
      },
    },
    sessions: [
      {
        id: "s-1",
        lessonId: "day-01",
        localDate: "2026-01-05",
        timezone: "UTC",
        minutes: 45,
        createdAt: "2026-01-05T10:00:00.000Z",
        updatedAt: "2026-01-05T10:00:00.000Z",
      },
    ],
    settings: { weeklyTargetMinutes: 300, timezone: "Asia/Kolkata" },
    lastLocation: { lessonId: "day-01", taskId: "day-01-lab-2" },
    updatedAt: "2026-01-05T10:05:00.000Z",
  };
}

describe("v1 -> v2 migration", () => {
  it("migrates a real v1 Harshith state with zero data loss", () => {
    const v1 = realV1State("harshith");
    const v2 = migrateV1toV2(v1);

    expect(v2.schemaVersion).toBe(2);
    // Every v1 field preserved.
    expect(v2.profileId).toBe("harshith");
    expect(v2.displayName).toBe("Harshith");
    expect(v2.days["day-01"].completedTaskIds).toEqual(["day-01-learn", "day-01-lab-1"]);
    expect(v2.days["day-01"].notes).toBe(v1.days["day-01"].notes);
    expect(v2.days["day-01"].evidence).toEqual(v1.days["day-01"].evidence);
    expect(v2.days["day-01"].reflection).toBe(v1.days["day-01"].reflection);
    expect(v2.days["day-01"].checkpoint.reviewed).toBe(true);
    expect(v2.days["day-01"].competency).toBe("guided");
    expect(v2.sessions).toEqual(v1.sessions);
    expect(v2.settings).toEqual(v1.settings);
    expect(v2.lastLocation).toEqual(v1.lastLocation);
    // v2 block initialized empty.
    expect(v2.v2.assessment?.results).toEqual([]);
    expect(v2.v2.plan?.activeRevisionId).toBeNull();
  });

  it("migrates Aparna too, independently", () => {
    const v2 = migrateV1toV2(realV1State("aparna"));
    expect(v2.profileId).toBe("aparna");
    expect(v2.displayName).toBe("Aparna");
    expect(v2.days["day-01"].completedTaskIds.length).toBe(2);
  });

  it("parseAndMigrate accepts raw v1 JSON and returns valid v2", () => {
    const raw = JSON.parse(JSON.stringify(realV1State("harshith")));
    const state = parseAndMigrate(raw);
    expect(state).not.toBeNull();
    expect(state!.schemaVersion).toBe(2);
    // Result must itself validate against the canonical v2 schema.
    expect(learnerStateSchema.safeParse(state).success).toBe(true);
  });

  it("parseAndMigrate accepts already-v2 state unchanged", () => {
    const v2 = migrateV1toV2(realV1State("harshith"));
    const again = parseAndMigrate(JSON.parse(JSON.stringify(v2)));
    expect(again!.schemaVersion).toBe(2);
    expect(again!.days["day-01"].notes).toBe(v2.days["day-01"].notes);
  });

  it("parseAndMigrate returns null for non-learner-state input", () => {
    expect(parseAndMigrate({ foo: 1 })).toBeNull();
    expect(parseAndMigrate("nope")).toBeNull();
  });

  it("migration is idempotent on v2", () => {
    const once = parseAndMigrate(JSON.parse(JSON.stringify(realV1State("harshith"))));
    const twice = parseAndMigrate(JSON.parse(JSON.stringify(once)));
    expect(twice).toEqual(once);
  });
});

describe("backup v1 -> v2", () => {
  it("imports a v1 backup and migrates its state", () => {
    const v1Backup = {
      kind: "ascent-backup",
      backupVersion: 1,
      profileId: "harshith",
      contentVersion: "2026-09-05.1",
      exportedAt: "2026-01-05T10:05:00.000Z",
      state: realV1State("harshith"),
    };
    const migrated = parseAndMigrateBackup(v1Backup);
    expect(migrated).not.toBeNull();
    expect(migrated!.backupVersion).toBe(2);
    expect(migrated!.state.schemaVersion).toBe(2);
    expect(migrated!.state.days["day-01"].notes).toBe(
      v1Backup.state.days["day-01"].notes,
    );
  });

  it("rejects a non-backup object", () => {
    expect(parseAndMigrateBackup({ kind: "not-ascent" })).toBeNull();
  });
});
