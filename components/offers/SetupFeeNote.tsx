"use client";

import { useEffect, useState } from "react";
import { SETUP_WAIVER_LINE, setupWaiverActive } from "@/lib/setupWaiver";

/**
 * The setup line on a Genesis level. `initialActive` is the server's clock, so
 * the first paint matches. After that the browser clock hides the waiver on
 * its own once the cutoff has passed, without a new deploy.
 */
export function SetupFeeNote({
  setupLine,
  initialActive,
  className,
  noteClassName = "mt-1 block",
}: {
  setupLine: string;
  initialActive: boolean;
  className?: string;
  noteClassName?: string;
}) {
  const [active, setActive] = useState(initialActive);
  useEffect(() => {
    const timer = window.setTimeout(() => setActive(setupWaiverActive()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  if (!active) return <span className={className}>{setupLine}</span>;
  return (
    <span className={className}>
      <span className="line-through">{setupLine}</span>
      <span className={noteClassName}>{SETUP_WAIVER_LINE}</span>
    </span>
  );
}
