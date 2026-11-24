"use client";

import type { ReactNode } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/**
 * Reports a click on a link or button inside it, so a server-rendered
 * section can be measured without becoming a client component. It adds no
 * box of its own (display: contents), and it reports only clicks that land on
 * an element matching `selector`, with that element's href and any
 * data-track-* attributes it carries (data-track-level="01" sends level: "01").
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
        const target = (click.target as Element | null)?.closest?.(selector);
        if (!target || !click.currentTarget.contains(target)) return;
        const href = target.getAttribute("href") ?? "";
        const plan = /[?&]topic=ministry-([a-z]+)/.exec(href)?.[1] ?? "";
        const extra: Record<string, string> = {};
        if (target instanceof HTMLElement) {
          for (const [key, value] of Object.entries(target.dataset)) {
            if (key.startsWith("track") && key.length > 5 && value) {
              extra[key.charAt(5).toLowerCase() + key.slice(6)] = value;
            }
          }
        }
        track(event, { from, ...(href ? { href } : {}), ...(plan ? { plan } : {}), ...extra });
      }}
    >
      {children}
    </span>
  );
}
