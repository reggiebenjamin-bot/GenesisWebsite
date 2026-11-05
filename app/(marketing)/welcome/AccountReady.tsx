"use client";

import { useEffect, useState } from "react";
import { SignInCard } from "./SignInCard";
import { POD_URL, welcomeReadyCopy } from "@/lib/welcomePath";

const STATUS_URL = `${POD_URL}/ws-status`;

type Status = { ready: boolean; login_url?: string };

/**
 * The ready path account card. It shows the sign in card right away, with the
 * login link defaulting to the Genesis pod, then upgrades the link if the
 * workspace status returns a ready login_url for this checkout.
 */
export function AccountReady({ sessionId }: { sessionId: string }) {
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    let stopped = false;
    let tries = 0;
    const check = async () => {
      tries += 1;
      try {
        const res = await fetch(`${STATUS_URL}?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
        const data = (await res.json()) as Status;
        if (!stopped && data.ready) {
          setReady(true);
          if (data.login_url) setLoginUrl(data.login_url);
          return;
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

  return (
    <SignInCard
      href={loginUrl ?? POD_URL}
      note={ready ? undefined : welcomeReadyCopy.workspaceNote}
    />
  );
}
