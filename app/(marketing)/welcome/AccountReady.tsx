"use client";

import { useEffect, useState } from "react";

const STATUS_URL = "https://pod.genesisaisolutions.cloud/ws-status";

type Status = { ready: boolean; login_url?: string };

/** Polls the workspace status for this checkout and shows the sign in link once it is ready. */
export function AccountReady({ sessionId }: { sessionId: string }) {
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    let stopped = false;
    let tries = 0;
    const check = async () => {
      tries += 1;
      try {
        const res = await fetch(`${STATUS_URL}?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
        const data = (await res.json()) as Status;
        if (!stopped && data.ready && data.login_url) {
          setLoginUrl(data.login_url);
          return;
        }
      } catch {
        /* keep waiting */
      }
      if (!stopped && tries < 40) setTimeout(check, 5000);
      else if (!stopped) setWaiting(false);
    };
    check();
    return () => {
      stopped = true;
    };
  }, [sessionId]);

  if (loginUrl) {
    return (
      <div className="mx-auto mt-8 max-w-[46ch] rounded-[8px] border border-gold/60 bg-ink-soft px-6 py-6 text-center">
        <p className="text-[1.3rem] font-light text-ivory">Your account is ready.</p>
        <p className="mt-3 text-[0.98rem] leading-relaxed text-ivory/74">
          Sign in with the email you used at checkout. To set your password, choose Forgot password on the sign in screen
          and follow the code we email you.
        </p>
        <a
          href={loginUrl}
          className="mt-5 inline-flex min-h-[52px] items-center justify-center rounded-[6px] bg-gold px-6 text-[0.84rem] font-bold tracking-[0.025em] text-ink"
        >
          Sign in to Genesis
        </a>
      </div>
    );
  }
  if (!sessionId || !waiting) return null;
  return (
    <p className="mx-auto mt-6 max-w-[46ch] text-[0.98rem] leading-relaxed text-ivory/60">
      Preparing your private workspace. This usually takes about a minute.
    </p>
  );
}
