import { cookies } from "next/headers";
import {
  PROFILE_LABELS,
  isValidProfileId,
  normalizeProfileId,
  profileLabel,
  type ProfileId,
} from "@/lib/progress/schema";

/**
 * Profile-selection cookies. Their purpose is request consistency for a trusted
 * personal deployment, NOT proof of identity. Anyone with the link can enter
 * any name; the same name always resolves to the same learning space.
 */

export const PROFILE_COOKIE = "ascent_profile";
export const PROFILE_NAME_COOKIE = "ascent_profile_name";

export function isProfileId(v: string | undefined | null): v is ProfileId {
  return typeof v === "string" && isValidProfileId(v);
}

export interface SelectedProfile {
  id: ProfileId;
  displayName: string;
}

export async function getSelectedProfile(): Promise<SelectedProfile | null> {
  const store = await cookies();
  const id = store.get(PROFILE_COOKIE)?.value;
  if (!isProfileId(id)) return null;
  const name = store.get(PROFILE_NAME_COOKIE)?.value;
  return { id, displayName: profileLabel(id, name) };
}

export { PROFILE_LABELS, normalizeProfileId, profileLabel };
export type { ProfileId };
