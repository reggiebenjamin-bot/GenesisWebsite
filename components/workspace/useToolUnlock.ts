"use client";

import { useEffect, useState } from "react";
import type { WorkspaceToolId } from "@/lib/toolWorkspace";

export type ToolUnlockState =
  | { status: "locked" }
  | { status: "verifying" }
  | { status: "unlocked"; sessionId: string }
  | { status: "failed" };

function unlockKey(toolId: WorkspaceToolId) {
  return `genesis:workspace:unlock:v2:${toolId}`;
}

function readStored(toolId: WorkspaceToolId): string | null {
  try {
    return window.localStorage.getItem(unlockKey(toolId));
  } catch {
    return null;
  }
}

function storeSession(toolId: WorkspaceToolId, sessionId: string) {
  try {
    window.localStorage.setItem(unlockKey(toolId), sessionId);
  } catch {
    // A full or blocked store never blocks the unlocked view for this visit.
  }
}

/**
 * After checkout, the page returns with checkout=success and a session_id. This
 * confirms that session against the verify route and unlocks the paid result.
 * A verified session id is remembered on this device so a reload or a lost
 * draft does not lose the purchase: the stored id is re verified silently and,
 * if it no longer checks out, the page simply returns to the locked state.
 */
export function useToolUnlock(toolId: WorkspaceToolId): ToolUnlockState {
  const [state, setState] = useState<ToolUnlockState>({ status: "locked" });

  useEffect(() => {
    let active = true;

    const params = new URLSearchParams(window.location.search);
    const fromCheckout = params.get("checkout") === "success";
    const urlSession = params.get("session_id");
    const storedSession = readStored(toolId);
    const sessionId = urlSession ?? storedSession;
    const freshRedirect = fromCheckout && Boolean(urlSession);

    if (!sessionId) {
      setState({ status: "locked" });
      return;
    }

    setState({ status: "verifying" });

    (async () => {
      try {
        const response = await fetch(
          `/api/tools/verify?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" },
        );
        const data = (await response.json()) as { paid?: boolean; tool?: string };
        if (!active) return;

        if (data.paid && data.tool === toolId) {
          storeSession(toolId, sessionId);
          setState({ status: "unlocked", sessionId });
        } else {
          setState({ status: freshRedirect ? "failed" : "locked" });
        }
      } catch {
        if (active) setState({ status: freshRedirect ? "failed" : "locked" });
      }
    })();

    return () => {
      active = false;
    };
  }, [toolId]);

  return state;
}
