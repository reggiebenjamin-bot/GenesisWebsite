"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { analyticsPageLocation, gaConfigCommands, gaPageViewCommands, type GaCommand } from "@/lib/analytics";

type GaWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

/** gtag reads its queue as `arguments` objects, so the commands are pushed that way. */
function send(commands: GaCommand[]) {
  const target = window as GaWindow;
  const queue = (target.dataLayer = target.dataLayer || []);
  if (typeof target.gtag !== "function") {
    target.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      queue.push(arguments);
    };
  }
  for (const command of commands) target.gtag(...command);
}

/**
 * Configures Google Analytics once, with its automatic page view off, then
 * reports a page view on every path change with the address cut down to
 * origin and path. The query string never leaves the site: on /welcome it
 * holds the Stripe checkout session ID, which opens the buyer's workspace.
 */
export function GaPageViews({ id }: { id: string }) {
  const pathname = usePathname();
  const configured = useRef(false);
  const previous = useRef<string | null>(null);

  useEffect(() => {
    try {
      if (!configured.current) {
        configured.current = true;
        send(gaConfigCommands(id));
      }
      const url = window.location.href;
      const location = analyticsPageLocation(url);
      if (!location || location === previous.current) return;
      send(gaPageViewCommands({ url, referrer: previous.current ?? document.referrer, title: document.title }));
      previous.current = location;
    } catch {
      /* Reporting must never break the page it is reporting on. */
    }
  }, [id, pathname]);

  return null;
}
