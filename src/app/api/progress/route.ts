import { NextResponse } from "next/server";
import { isValidProfileId, type ProfileId } from "@/lib/progress/schema";
import { getRepository } from "@/lib/progress/repository-factory";
import {
  validateIncomingState,
  withinSizeLimit,
} from "@/lib/progress/validate-state";
import { CONTENT_VERSION } from "@/lib/content/content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isProfileId(v: string | null): v is ProfileId {
  return v !== null && isValidProfileId(v);
}

function noStore(json: unknown, init?: ResponseInit) {
  const res = NextResponse.json(json, init);
  res.headers.set("Cache-Control", "private, no-store, max-age=0");
  return res;
}

/** GET /api/progress?profile=harshith -> current state, revision, mode. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const profile = url.searchParams.get("profile");
  if (!isProfileId(profile)) {
    return noStore({ error: "unknown_profile" }, { status: 400 });
  }

  const repo = getRepository();
  try {
    const result = await repo.load(profile);
    return noStore({
      state: result.state,
      revision: result.revision,
      storageMode: result.storageMode,
      contentVersion: CONTENT_VERSION,
    });
  } catch (err) {
    return noStore(
      {
        error: "storage_unavailable",
        message: err instanceof Error ? err.message : "read failed",
        storageMode: repo.mode,
      },
      { status: 503 },
    );
  }
}

/** PUT /api/progress?profile=harshith  body: { state, expectedRevision } */
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const profile = url.searchParams.get("profile");
  if (!isProfileId(profile)) {
    return noStore({ error: "unknown_profile" }, { status: 400 });
  }

  // Origin check for mutations (CSRF defense for the trusted personal app).
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return noStore({ error: "bad_origin" }, { status: 403 });
      }
    } catch {
      return noStore({ error: "bad_origin" }, { status: 403 });
    }
  }

  const raw = await req.text();
  if (!withinSizeLimit(raw)) {
    return noStore({ error: "payload_too_large" }, { status: 413 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return noStore({ error: "invalid_json" }, { status: 400 });
  }

  const body = parsed as { state?: unknown; expectedRevision?: unknown };
  const expectedRevision =
    typeof body.expectedRevision === "string" ? body.expectedRevision : null;

  const validation = validateIncomingState(body.state);
  if (!validation.ok) {
    return noStore({ error: "invalid_state", message: validation.message }, { status: 400 });
  }
  // Profile in state must match the URL profile.
  if (validation.state.profileId !== profile) {
    return noStore({ error: "profile_mismatch" }, { status: 400 });
  }

  const repo = getRepository();
  const result = await repo.save(profile, validation.state, expectedRevision);

  if (result.ok) {
    return noStore({
      state: result.state,
      revision: result.revision,
      storageMode: result.storageMode,
    });
  }

  if (result.kind === "conflict") {
    return noStore(
      {
        error: "conflict",
        current: result.current,
        revision: result.revision,
        storageMode: repo.mode,
      },
      { status: 409 },
    );
  }
  if (result.kind === "invalid") {
    return noStore({ error: "invalid_state", message: result.message }, { status: 400 });
  }
  return noStore(
    { error: "storage_unavailable", message: result.message, storageMode: repo.mode },
    { status: 503 },
  );
}
