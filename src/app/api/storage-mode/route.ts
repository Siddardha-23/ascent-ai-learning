import { NextResponse } from "next/server";
import { activeStorageMode } from "@/lib/progress/repository-factory";
import { CONTENT_VERSION } from "@/lib/content/content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Reports the active storage mode (never the token) so the UI can be honest. */
export async function GET() {
  const res = NextResponse.json({
    storageMode: activeStorageMode(),
    contentVersion: CONTENT_VERSION,
  });
  res.headers.set("Cache-Control", "private, no-store, max-age=0");
  return res;
}
