"use client";

import type { ReactNode } from "react";
import { offerPathHomeHref, type OfferPathId } from "@/lib/offers";
import { choosePathInPlace } from "./offerPathState";

/**
 * The way to the other path from inside a path's own content on the
 * homepage. It switches the page in place, as the toggle does, then moves
 * focus to the new title: the link itself has just been hidden along with the
 * rest of its path.
 */
export function SwitchPathLink({
  path,
  className,
  children,
}: {
  path: OfferPathId;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={offerPathHomeHref(path)}
      className={className}
      onClick={(event) => {
        // A new tab or window still opens the path's homepage.
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }

        event.preventDefault();
        choosePathInPlace(path);
        document
          .querySelector<HTMLElement>(`[data-offer-panel="${path}"] h1`)
          ?.focus({ preventScroll: true });
      }}
    >
      {children}
    </a>
  );
}
