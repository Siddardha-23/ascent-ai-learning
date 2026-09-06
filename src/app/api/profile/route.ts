import { NextResponse } from "next/server";
import { PROFILE_COOKIE, PROFILE_NAME_COOKIE } from "@/lib/profile";
import { normalizeProfileId, isValidProfileId, PROFILE_ID_MAX } from "@/lib/progress/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return true; // non-browser or same-site request
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Sets the profile-selection cookies from a typed name.
 * The name is normalized to a stable id slug; the raw (trimmed) name is stored
 * for display only.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });
  }

  let body: { name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const rawName = typeof body.name === "string" ? body.name.trim() : "";
  if (!rawName) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }
  if (rawName.length > PROFILE_ID_MAX * 2) {
    return NextResponse.json({ error: "name_too_long" }, { status: 400 });
  }

  const id = normalizeProfileId(rawName);
  if (!isValidProfileId(id)) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }

  const displayName = rawName.slice(0, PROFILE_ID_MAX * 2);
  const res = NextResponse.json({ ok: true, profile: id, displayName });
  const cookieOpts = {
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
  res.cookies.set(PROFILE_COOKIE, id, { ...cookieOpts, httpOnly: true });
  // Display name is not sensitive; keep it readable for the client if needed.
  res.cookies.set(PROFILE_NAME_COOKIE, displayName, { ...cookieOpts, httpOnly: false });
  return res;
}

/** Clears the profile cookies (switch profile). */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PROFILE_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(PROFILE_NAME_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
