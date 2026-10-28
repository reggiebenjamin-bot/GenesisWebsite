import { DRAFT_KEY, type Draft } from "./draft.ts";

export function readDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Draft;
    if (!parsed || typeof parsed !== "object" || !parsed.answers || !parsed.stepId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeDraft(draft: Draft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* This preview keeps going even if the device refuses storage. */
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* Ignore. */
  }
}

type Listener = () => void;

let snapshot: Draft | null | undefined;
const listeners = new Set<Listener>();

/** Client snapshot. Cached so the store does not tear during render. */
export function getDraftSnapshot(): Draft | null {
  if (snapshot === undefined) snapshot = readDraft();
  return snapshot;
}

export function getServerDraftSnapshot(): Draft | null {
  return null;
}

export function subscribeDraft(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function saveDraft(draft: Draft | null) {
  snapshot = draft;
  if (draft) writeDraft(draft);
  else clearDraft();
  for (const listener of listeners) listener();
}
