import type { WorkspaceToolId } from "./toolWorkspace.ts";

// V2 starts with a blank customer brief. V1 sample-backed drafts remain untouched
// in local storage so this redesign never silently erases prior browser data.
export const WORKSPACE_DRAFT_VERSION = 2;
export const WORKSPACE_DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type WorkspaceDraftEnvelope<T> = {
  version: typeof WORKSPACE_DRAFT_VERSION;
  toolId: WorkspaceToolId;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  data: T;
};

export type DraftReadResult<T> =
  | { state: "empty" }
  | { state: "loaded"; draft: WorkspaceDraftEnvelope<T> }
  | { state: "expired" }
  | { state: "invalid" };

export function workspaceDraftKey(toolId: WorkspaceToolId) {
  return `genesis:workspace:draft:v${WORKSPACE_DRAFT_VERSION}:${toolId}`;
}

function isEnvelope(value: unknown): value is WorkspaceDraftEnvelope<unknown> {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<WorkspaceDraftEnvelope<unknown>>;
  return (
    draft.version === WORKSPACE_DRAFT_VERSION &&
    typeof draft.toolId === "string" &&
    typeof draft.createdAt === "number" &&
    typeof draft.updatedAt === "number" &&
    typeof draft.expiresAt === "number" &&
    "data" in draft
  );
}

export function createWorkspaceDraft<T>(
  toolId: WorkspaceToolId,
  data: T,
  now = Date.now(),
  createdAt = now,
): WorkspaceDraftEnvelope<T> {
  return {
    version: WORKSPACE_DRAFT_VERSION,
    toolId,
    createdAt,
    updatedAt: now,
    expiresAt: now + WORKSPACE_DRAFT_TTL_MS,
    data,
  };
}

export function readWorkspaceDraft<T>(
  storage: StorageLike,
  toolId: WorkspaceToolId,
  now = Date.now(),
): DraftReadResult<T> {
  const key = workspaceDraftKey(toolId);
  const raw = storage.getItem(key);
  if (!raw) return { state: "empty" };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isEnvelope(parsed) || parsed.toolId !== toolId) {
      storage.removeItem(key);
      return { state: "invalid" };
    }
    if (parsed.expiresAt <= now) {
      storage.removeItem(key);
      return { state: "expired" };
    }
    return { state: "loaded", draft: parsed as WorkspaceDraftEnvelope<T> };
  } catch {
    storage.removeItem(key);
    return { state: "invalid" };
  }
}

export function writeWorkspaceDraft<T>(
  storage: StorageLike,
  toolId: WorkspaceToolId,
  data: T,
  now = Date.now(),
  createdAt = now,
) {
  const draft = createWorkspaceDraft(toolId, data, now, createdAt);
  storage.setItem(workspaceDraftKey(toolId), JSON.stringify(draft));
  return draft;
}

export function clearWorkspaceDraft(storage: StorageLike, toolId: WorkspaceToolId) {
  storage.removeItem(workspaceDraftKey(toolId));
}
