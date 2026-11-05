"use client";

import { useEffect, useState } from "react";
import { SignInCard } from "./SignInCard";
import { workspaceCardCopy, type WorkspacePhase } from "@/lib/workspaceAccess";
import { welcomeReadyCopy } from "@/lib/welcomePath";

type Status = { phase?: WorkspacePhase; loginUrl?: string | null };

/**
 * Polls this site for the buyer's own workspace. The card says the account is
 * ready only after provision succeeded and a dedicated login URL came back.
 */
export function AccountReady({
  sessionId,
  initialPhase = "pending",
  initialLoginUrl = null,
}: {
  sessionId: string;
  initialPhase?: WorkspacePhase;
  initialLoginUrl?: string | null;
}) {
  const [phase, setPhase] = useState<WorkspacePhase>(initialPhase);
  const [loginUrl, setLoginUrl] = useState<string | null>(initialPhase === "ready" ? initialLoginUrl : null);

  useEffect(() => {
    if (!sessionId) return;
    let stopped = false;
    let tries = 0;
    const check = async () => {
      tries += 1;
      try {
        const res = await fetch(`/api/workspace/status?session_id=${encodeURIComponent(sessionId)}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as Status;
        if (!stopped && (data.phase === "ready" || data.phase === "failed" || data.phase === "not_eligible")) {
          setPhase(data.phase);
          setLoginUrl(data.phase === "ready" && typeof data.loginUrl === "string" ? data.loginUrl : null);
          if (data.phase !== "ready" || typeof data.loginUrl === "string") return;
        }
      } catch {
        /* keep waiting */
      }
      if (!stopped && tries < 40) setTimeout(check, 5000);
    };
    check();
    return () => {
      stopped = true;
    };
  }, [sessionId]);

  const displayPhase: WorkspacePhase = phase === "ready" && loginUrl ? "ready" : phase === "ready" ? "pending" : phase;
  const copy = workspaceCardCopy(displayPhase);

  return (
    <>
      <SignInCard
        href={copy.showSignIn && loginUrl ? loginUrl : undefined}
        heading={copy.heading}
        note={copy.note || undefined}
        body={displayPhase === "ready" ? welcomeReadyCopy.body : undefined}
      />
      <p className="mx-auto mt-8 max-w-[56ch] text-[0.84rem] text-ivory/60">{welcomeReadyCopy.disclaimer}</p>
    </>
  );
}
