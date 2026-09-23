"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { decodeAccountDraft, draftsDiffer, normalizeAccountDraftData, type AccountDraft } from "@/lib/accountDraft";
import type { WorkspaceToolId } from "@/lib/toolWorkspace";
import { clearWorkspaceDraft, readWorkspaceDraft, writeWorkspaceDraft } from "@/lib/workspaceDraft";
import { useWorkspaceIdentity } from "./AccountControls";

type DraftStatus =
  | "Loading draft"
  | "Saved on this device"
  | "Saved to your account"
  | "Account ready"
  | "Saving to your account"
  | "Account sync unavailable"
  | "Account save failed"
  | "Storage unavailable"
  | "Choose which draft to keep";
type Phase = "loading" | "guest" | "cloud" | "conflict";
type Conflict<T> = { device: T; account: AccountDraft | null; reason: "different" | "clear" };

async function readCloudDraft(toolId: WorkspaceToolId) {
  const response = await fetch(`/api/workspace-drafts/${toolId}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load account draft");
  const body: { draft: unknown } = await response.json();
  if (body.draft === null) return null;
  const draft = decodeAccountDraft(body.draft, toolId);
  if (!draft) throw new Error("Invalid account draft");
  return draft;
}

async function writeCloudDraft(toolId: WorkspaceToolId, data: unknown, expectedRevision: string | null) {
  const normalized = normalizeAccountDraftData(toolId, data);
  if (!normalized) throw new Error("Draft is too large or contains invalid fields");
  const response = await fetch(`/api/workspace-drafts/${toolId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: normalized, expectedRevision }),
  });
  const body: { state?: string; draft?: unknown } = await response.json();
  if (response.status === 409) {
    const account = body.draft === null ? null : decodeAccountDraft(body.draft, toolId);
    return { state: "conflict" as const, draft: account };
  }
  if (!response.ok || body.state !== "saved") throw new Error("Could not save account draft");
  const draft = decodeAccountDraft(body.draft, toolId);
  if (!draft) throw new Error("Invalid account draft response");
  return { state: "saved" as const, draft };
}

async function clearCloudDraft(toolId: WorkspaceToolId, expectedRevision: string | null) {
  const response = await fetch(`/api/workspace-drafts/${toolId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expectedRevision }),
  });
  const body: { state?: string; draft?: unknown } = await response.json();
  if (response.status === 409) {
    const account = body.draft === null ? null : decodeAccountDraft(body.draft, toolId);
    return { state: "conflict" as const, draft: account };
  }
  if (!response.ok || body.state !== "deleted") throw new Error("Could not clear account draft");
  return { state: "deleted" as const };
}

export function useWorkspaceDraft<T extends Record<string, unknown>>(
  toolId: WorkspaceToolId,
  initialData: T,
) {
  const identity = useWorkspaceIdentity();
  const [data, setDataState] = useState<T>(initialData);
  const [status, setStatus] = useState<DraftStatus>("Loading draft");
  const [phase, setPhase] = useState<Phase>("loading");
  const [conflict, setConflict] = useState<Conflict<T> | null>(null);
  const [editVersion, setEditVersion] = useState(0);
  const initialDataRef = useRef(initialData);
  const createdAt = useRef<number | null>(null);
  const revision = useRef<string | null>(null);
  const latestData = useRef(initialData);
  const lastSaved = useRef("");
  const saveChain = useRef(Promise.resolve());
  const pendingSave = useRef<number | null>(null);
  const active = useRef(true);

  const setData: Dispatch<SetStateAction<T>> = (nextValue) => {
    const next = typeof nextValue === "function" ? nextValue(latestData.current) : nextValue;
    latestData.current = next;
    try {
      const now = Date.now();
      const backup = writeWorkspaceDraft(window.localStorage, toolId, next, now, createdAt.current ?? now);
      createdAt.current = backup.createdAt;
    } catch { /* Account save still reports an error if it fails. */ }
    setDataState(next);
    setEditVersion((version) => version + 1);
  };

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  useEffect(() => {
    if (!identity.loaded) return;
    let cancelled = false;
    async function load() {
      let device: T | null = null;
      try {
        const result = readWorkspaceDraft<T>(window.localStorage, toolId);
        if (result.state === "loaded") {
          device = { ...initialDataRef.current, ...result.draft.data };
          createdAt.current = result.draft.createdAt;
        }
      } catch {
        if (!identity.userId) setStatus("Storage unavailable");
      }
      if (cancelled) return;

      if (!identity.userId) {
        const guestData = device ?? initialDataRef.current;
        latestData.current = guestData;
        setDataState(guestData);
        setPhase("guest");
        setStatus((current) => current === "Storage unavailable" ? current : "Saved on this device");
        return;
      }

      try {
        const account = await readCloudDraft(toolId);
        if (cancelled) return;
        if (account && device && draftsDiffer(device, account.data, initialDataRef.current)) {
          latestData.current = device;
          setDataState(device);
          setConflict({ device, account, reason: "different" });
          setPhase("conflict");
          setStatus("Choose which draft to keep");
          return;
        }
        if (account) {
          const loaded = { ...initialDataRef.current, ...account.data } as T;
          latestData.current = loaded;
          lastSaved.current = JSON.stringify(loaded);
          revision.current = account.revision;
          setDataState(loaded);
          try { clearWorkspaceDraft(window.localStorage, toolId); } catch { /* Account copy is safe. */ }
        } else if (device && draftsDiffer(device, initialDataRef.current, initialDataRef.current)) {
          const result = await writeCloudDraft(toolId, device, null);
          if (cancelled) return;
          if (result.state === "conflict") {
            setConflict({ device, account: result.draft, reason: "different" });
            setPhase("conflict");
            setStatus("Choose which draft to keep");
            return;
          }
          latestData.current = device;
          lastSaved.current = JSON.stringify(device);
          revision.current = result.draft.revision;
          setDataState(device);
          try { clearWorkspaceDraft(window.localStorage, toolId); } catch { /* Account copy is safe. */ }
        }
        setPhase("cloud");
        setStatus(revision.current ? "Saved to your account" : "Account ready");
      } catch {
        if (cancelled) return;
        const fallback = device ?? initialDataRef.current;
        latestData.current = fallback;
        setDataState(fallback);
        setPhase("guest");
        setStatus("Account sync unavailable");
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [toolId, identity.loaded, identity.userId]);

  useEffect(() => {
    if (!editVersion || phase === "loading" || phase === "conflict") return;
    if (phase === "guest") {
      try {
        const now = Date.now();
        const draft = writeWorkspaceDraft(window.localStorage, toolId, data, now, createdAt.current ?? now);
        createdAt.current = draft.createdAt;
        queueMicrotask(() => setStatus((current) => current === "Account sync unavailable" ? current : "Saved on this device"));
      } catch {
        queueMicrotask(() => setStatus("Storage unavailable"));
      }
      return;
    }

    const timer = window.setTimeout(() => {
      pendingSave.current = null;
      setStatus("Saving to your account");
      saveChain.current = saveChain.current.then(async () => {
        if (!active.current) return;
        const snapshot = latestData.current;
        const serialized = JSON.stringify(snapshot);
        if (serialized === lastSaved.current) {
          setStatus("Saved to your account");
          return;
        }
        try {
          const result = await writeCloudDraft(toolId, snapshot, revision.current);
          if (!active.current) return;
          if (result.state === "conflict") {
            try {
              const now = Date.now();
              const backup = writeWorkspaceDraft(window.localStorage, toolId, snapshot, now, createdAt.current ?? now);
              createdAt.current = backup.createdAt;
            } catch { /* The conflict remains visible until resolved. */ }
            setConflict({ device: snapshot, account: result.draft, reason: "different" });
            setPhase("conflict");
            setStatus("Choose which draft to keep");
            return;
          }
          revision.current = result.draft.revision;
          lastSaved.current = serialized;
          if (JSON.stringify(latestData.current) === serialized) {
            try { clearWorkspaceDraft(window.localStorage, toolId); } catch { /* Account copy is safe. */ }
          }
          setStatus(JSON.stringify(latestData.current) === serialized
            ? "Saved to your account" : "Saving to your account");
        } catch {
          if (!active.current) return;
          try {
            const now = Date.now();
            const backup = writeWorkspaceDraft(window.localStorage, toolId, snapshot, now, createdAt.current ?? now);
            createdAt.current = backup.createdAt;
            setPhase("guest");
            setStatus("Account sync unavailable");
          } catch {
            setStatus("Storage unavailable");
          }
        }
      });
    }, 600);
    pendingSave.current = timer;
    return () => {
      window.clearTimeout(timer);
      if (pendingSave.current === timer) pendingSave.current = null;
    };
  }, [data, editVersion, phase, toolId]);

  async function chooseDraft(source: "account" | "device") {
    if (!conflict) return;
    if (source === "account") {
      const chosen = conflict.account
        ? { ...initialDataRef.current, ...conflict.account.data } as T
        : initialDataRef.current;
      latestData.current = chosen;
      lastSaved.current = JSON.stringify(chosen);
      revision.current = conflict.account?.revision ?? null;
      setDataState(chosen);
      try { clearWorkspaceDraft(window.localStorage, toolId); } catch { /* Account copy is safe. */ }
      setConflict(null);
      setPhase("cloud");
      setStatus(revision.current ? "Saved to your account" : "Account ready");
      return;
    }

    setStatus("Saving to your account");
    try {
      if (conflict.reason === "clear") {
        const result = await clearCloudDraft(toolId, conflict.account?.revision ?? null);
        if (result.state === "conflict") {
          setConflict({ ...conflict, account: result.draft });
          setStatus("Choose which draft to keep");
          return;
        }
        latestData.current = initialDataRef.current;
        lastSaved.current = JSON.stringify(initialDataRef.current);
        revision.current = null;
        setDataState(initialDataRef.current);
      } else {
        const result = await writeCloudDraft(toolId, conflict.device, conflict.account?.revision ?? null);
        if (result.state === "conflict") {
          setConflict({ ...conflict, account: result.draft });
          setStatus("Choose which draft to keep");
          return;
        }
        latestData.current = conflict.device;
        lastSaved.current = JSON.stringify(conflict.device);
        revision.current = result.draft.revision;
        setDataState(conflict.device);
      }
      try { clearWorkspaceDraft(window.localStorage, toolId); } catch { /* Account copy is safe. */ }
      setConflict(null);
      setPhase("cloud");
      setStatus(revision.current ? "Saved to your account" : "Account ready");
    } catch {
      setStatus("Account save failed");
    }
  }

  async function clear() {
    if (phase === "cloud") {
      if (pendingSave.current !== null) window.clearTimeout(pendingSave.current);
      pendingSave.current = null;
      setPhase("loading");
      setStatus("Saving to your account");
      try {
        await saveChain.current;
        const result = await clearCloudDraft(toolId, revision.current);
        if (result.state === "conflict") {
          setConflict({ device: initialDataRef.current, account: result.draft, reason: "clear" });
          setPhase("conflict");
          setStatus("Choose which draft to keep");
          return;
        }
        revision.current = null;
        lastSaved.current = JSON.stringify(initialDataRef.current);
        latestData.current = initialDataRef.current;
        try { clearWorkspaceDraft(window.localStorage, toolId); } catch { /* Account copy was cleared. */ }
        setDataState(initialDataRef.current);
        setPhase("cloud");
        setStatus("Account ready");
      } catch {
        setPhase("cloud");
        setStatus("Account save failed");
      }
      return;
    }
    try {
      clearWorkspaceDraft(window.localStorage, toolId);
      createdAt.current = null;
      latestData.current = initialDataRef.current;
      setDataState(initialDataRef.current);
      setStatus(identity.userId ? "Account sync unavailable" : "Saved on this device");
    } catch {
      setStatus("Storage unavailable");
    }
  }

  return { data, setData, status, clear, hydrated: phase !== "loading", conflict, chooseDraft };
}
