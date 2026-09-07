"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  emptyState,
  parseAndMigrate,
  type LearnerState,
  type ProfileId,
  type StorageMode,
} from "./schema";
import { reduce, type Action } from "./reducer";

/**
 * Client persistence controller (R5/R8). Responsibilities:
 *  - Load authoritative server state (keeps UI in a loading state until the
 *    read completes so an empty initial save can't erase existing work).
 *  - Keep a browser-local draft for recovery after navigation/failed requests.
 *  - Debounce + serialize saves per profile; ignore stale responses after a
 *    profile switch (a late Harshith response cannot populate Aparna's UI).
 *  - Surface honest save status and conflicts.
 */

export type SaveStatus =
  | "idle"
  | "saving"
  | "saved-cloud"
  | "saved-local"
  | "offline-pending"
  | "conflict"
  | "error";

export interface Conflict {
  remote: LearnerState | null;
  remoteRevision: string | null;
  localDraft: LearnerState;
}

interface ProgressContextValue {
  profileId: ProfileId;
  displayName: string;
  state: LearnerState;
  loading: boolean;
  storageMode: StorageMode | "unknown";
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  conflict: Conflict | null;
  dispatch: (action: Action) => void;
  /** Replace whole state (used by backup import / conflict resolution). */
  replaceState: (next: LearnerState) => void;
  keepLocalOverRemote: () => void;
  acceptRemote: () => void;
  flushNow: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

const DRAFT_PREFIX = "ascent:draft:";
const DEBOUNCE_MS = 900;

function draftKey(profileId: ProfileId) {
  return `${DRAFT_PREFIX}${profileId}`;
}

function loadDraft(profileId: ProfileId): LearnerState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(draftKey(profileId));
    if (!raw) return null;
    return parseAndMigrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

function saveDraft(profileId: ProfileId, state: LearnerState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(draftKey(profileId), JSON.stringify(state));
  } catch {
    /* storage full or unavailable: non-fatal */
  }
}

function clearDraft(profileId: ProfileId) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(draftKey(profileId));
  } catch {
    /* ignore */
  }
}

export function ProgressProvider({
  profileId,
  displayName,
  contentVersion,
  timezone,
  children,
}: {
  profileId: ProfileId;
  displayName: string;
  contentVersion: string;
  timezone: string;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<LearnerState>(() =>
    emptyState(profileId, contentVersion, timezone, displayName),
  );
  const [loading, setLoading] = useState(true);
  const [storageMode, setStorageMode] = useState<StorageMode | "unknown">("unknown");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [conflict, setConflict] = useState<Conflict | null>(null);

  // Monotonic generation to discard stale async results after profile switch.
  const generationRef = useRef(0);
  const revisionRef = useRef<string | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const dirtyRef = useRef(false);

  // Load authoritative state on profile change.
  useEffect(() => {
    const myGen = ++generationRef.current;
    setLoading(true);
    setConflict(null);
    revisionRef.current = null;

    (async () => {
      const draft = loadDraft(profileId);
      try {
        const res = await fetch(`/api/progress?profile=${profileId}`, {
          cache: "no-store",
        });
        if (myGen !== generationRef.current) return; // stale
        if (res.ok) {
          const data = (await res.json()) as {
            state: LearnerState | null;
            revision: string | null;
            storageMode: StorageMode;
          };
          if (myGen !== generationRef.current) return;
          setStorageMode(data.storageMode);
          revisionRef.current = data.revision;
          // If a local draft is newer than server, prefer draft for recovery.
          const server = data.state;
          if (draft && (!server || draft.updatedAt > server.updatedAt)) {
            setState(draft);
            dirtyRef.current = true; // will be flushed
          } else {
            setState(server ?? emptyState(profileId, contentVersion, timezone, displayName));
          }
        } else {
          // Storage unavailable: fall back to draft or empty, mark pending.
          setStorageMode("unknown");
          setState(draft ?? emptyState(profileId, contentVersion, timezone, displayName));
          if (draft) setSaveStatus("offline-pending");
        }
      } catch {
        if (myGen !== generationRef.current) return;
        setState(draft ?? emptyState(profileId, contentVersion, timezone, displayName));
        setStorageMode("unknown");
        if (draft) setSaveStatus("offline-pending");
      } finally {
        if (myGen === generationRef.current) setLoading(false);
      }
    })();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, contentVersion, timezone, displayName]);

  const persist = useCallback(
    async (myGen: number): Promise<void> => {
      if (savingRef.current) return;
      if (myGen !== generationRef.current) return;
      savingRef.current = true;
      dirtyRef.current = false;
      const snapshot = stateRef.current;
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/progress?profile=${profileId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: snapshot, expectedRevision: revisionRef.current }),
        });
        if (myGen !== generationRef.current) return; // profile switched away
        if (res.ok) {
          const data = (await res.json()) as {
            revision: string;
            storageMode: StorageMode;
          };
          revisionRef.current = data.revision;
          setStorageMode(data.storageMode);
          setSaveStatus(data.storageMode === "blob" ? "saved-cloud" : "saved-local");
          setLastSavedAt(new Date().toISOString());
          clearDraft(profileId);
        } else if (res.status === 409) {
          const data = (await res.json()) as {
            current: LearnerState | null;
            revision: string | null;
          };
          setConflict({
            remote: data.current,
            remoteRevision: data.revision,
            localDraft: snapshot,
          });
          setSaveStatus("conflict");
        } else {
          saveDraft(profileId, snapshot);
          setSaveStatus("error");
        }
      } catch {
        if (myGen !== generationRef.current) return;
        saveDraft(profileId, snapshot);
        setSaveStatus("offline-pending");
      } finally {
        savingRef.current = false;
        // If more edits arrived while saving, schedule another save.
        if (dirtyRef.current && myGen === generationRef.current) {
          scheduleSave(myGen);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profileId],
  );

  const scheduleSave = useCallback(
    (myGen: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void persist(myGen);
      }, DEBOUNCE_MS);
    },
    [persist],
  );

  const dispatch = useCallback(
    (action: Action) => {
      const myGen = generationRef.current;
      setState((prev) => {
        const next = reduce(prev, action);
        stateRef.current = next;
        saveDraft(profileId, next); // recovery draft immediately
        return next;
      });
      dirtyRef.current = true;
      if (conflict) return; // don't auto-save while conflict is unresolved
      scheduleSave(myGen);
    },
    [profileId, scheduleSave, conflict],
  );

  const replaceState = useCallback(
    (next: LearnerState) => {
      const myGen = generationRef.current;
      setState(next);
      stateRef.current = next;
      saveDraft(profileId, next);
      dirtyRef.current = true;
      scheduleSave(myGen);
    },
    [profileId, scheduleSave],
  );

  const keepLocalOverRemote = useCallback(() => {
    if (!conflict) return;
    // Adopt the remote revision so our next save wins, keep local content.
    revisionRef.current = conflict.remoteRevision;
    setConflict(null);
    replaceState(conflict.localDraft);
  }, [conflict, replaceState]);

  const acceptRemote = useCallback(() => {
    if (!conflict) return;
    revisionRef.current = conflict.remoteRevision;
    const remote =
      conflict.remote ?? emptyState(profileId, contentVersion, timezone, displayName);
    setConflict(null);
    setState(remote);
    stateRef.current = remote;
    clearDraft(profileId);
    setSaveStatus("saved-cloud");
  }, [conflict, profileId, contentVersion, timezone, displayName]);

  const flushNow = useCallback(async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (dirtyRef.current && !conflict) await persist(generationRef.current);
  }, [persist, conflict]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      profileId,
      displayName,
      state,
      loading,
      storageMode,
      saveStatus,
      lastSavedAt,
      conflict,
      dispatch,
      replaceState,
      keepLocalOverRemote,
      acceptRemote,
      flushNow,
    }),
    [
      profileId,
      displayName,
      state,
      loading,
      storageMode,
      saveStatus,
      lastSavedAt,
      conflict,
      dispatch,
      replaceState,
      keepLocalOverRemote,
      acceptRemote,
      flushNow,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within a ProgressProvider");
  return ctx;
}
