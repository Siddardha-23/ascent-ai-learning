import { NextResponse } from "next/server";
import { aiStatus } from "@/lib/ai/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Reports AI availability + routed model. Never exposes the key. */
export async function GET() {
  const { status, model } = aiStatus();
  const res = NextResponse.json({ status, model });
  res.headers.set("Cache-Control", "private, no-store, max-age=0");
  return res;
}
