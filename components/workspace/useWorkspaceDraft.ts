"use client";

import { useEffect, useRef, useState } from "react";
import type { WorkspaceToolId } from "@/lib/toolWorkspace";
import {
  clearWorkspaceDraft,
  readWorkspaceDraft,
  writeWorkspaceDraft,
} from "@/lib/workspaceDraft";

type DraftStatus = "Loading draft" | "Saved on this device" | "Storage unavailable";

export function useWorkspaceDraft<T extends Record<string, unknown>>(
  toolId: WorkspaceToolId,
  initialData: T,
) {
  const [data, setData] = useState<T>(initialData);
  const [status, setStatus] = useState<DraftStatus>("Loading draft");
  const [hydrated, setHydrated] = useState(false);
  const createdAt = useRef<number | null>(null);
  const initialDataRef = useRef(initialData);

  useEffect(() => {
    try {
      const result = readWorkspaceDraft<T>(window.localStorage, toolId);
      if (result.state === "loaded") {
        setData({ ...initialDataRef.current, ...result.draft.data });
        createdAt.current = result.draft.createdAt;
      }
      setStatus("Saved on this device");
    } catch {
      setStatus("Storage unavailable");
    } finally {
      setHydrated(true);
    }
  }, [toolId]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const draft = writeWorkspaceDraft(
        window.localStorage,
        toolId,
        data,
        Date.now(),
        createdAt.current ?? Date.now(),
      );
      createdAt.current = draft.createdAt;
    } catch {
      queueMicrotask(() => setStatus("Storage unavailable"));
    }
  }, [data, hydrated, toolId]);

  function clear() {
    try {
      clearWorkspaceDraft(window.localStorage, toolId);
      createdAt.current = null;
      setData(initialDataRef.current);
      setStatus("Saved on this device");
    } catch {
      setStatus("Storage unavailable");
    }
  }

  return { data, setData, status, clear, hydrated };
}
