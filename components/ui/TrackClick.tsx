"use client";

import type { ReactNode } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/**
 * Reports a click on a link inside it, so a server-rendered section can be
 * measured without becoming a client component. It adds no box of its own
 * (display: contents), and it reports only clicks that land on a link
 * matching `selector`, with that link's href.
 */
export function TrackClick({
  event,
  from,
  selector = "a[href]",
  children,
}: {
  event: AnalyticsEvent;
  from: string;
  selector?: string;
  children: ReactNode;
}) {
  return (
    <span
      className="contents"
      onClickCapture={(click) => {
        const link = (click.target as Element | null)?.closest?.(selector);
        if (!link || !click.currentTarget.contains(link)) return;
        const href = link.getAttribute("href") ?? "";
        const plan = /[?&]topic=ministry-([a-z]+)/.exec(href)?.[1] ?? "";
        track(event, { from, href, ...(plan ? { plan } : {}) });
      }}
    >
      {children}
    </span>
  );
}
