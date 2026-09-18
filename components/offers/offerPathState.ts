"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_OFFER_PATH,
  isOfferPathId,
  OFFER_PATH_ATTRIBUTE,
  OFFER_PATH_STORAGE_KEY,
  offerPaths,
  type OfferPathId,
} from "@/lib/offers";

/*
 * The chosen path is stored on <html>, not in React state. The inline script
 * in the root layout writes it before first paint and CSS reads it, so the
 * right content is visible immediately; these helpers keep React in step.
 */

const CHANGE_EVENT = "genesis:offer-path";
export const OFFER_PATH_ANNOUNCER_ID = "offer-path-announcer";

function readPath(): OfferPathId {
  const value = document.documentElement.getAttribute(OFFER_PATH_ATTRIBUTE) ?? "";
  return isOfferPathId(value) ? value : DEFAULT_OFFER_PATH;
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

export function useOfferPath(): OfferPathId {
  return useSyncExternalStore(subscribe, readPath, () => DEFAULT_OFFER_PATH);
}

export function setOfferPath(
  path: OfferPathId,
  { announce = false }: { announce?: boolean } = {},
) {
  const changed = readPath() !== path;
  document.documentElement.setAttribute(OFFER_PATH_ATTRIBUTE, path);

  try {
    window.sessionStorage.setItem(OFFER_PATH_STORAGE_KEY, path);
  } catch {
    // Storage can be unavailable (private modes); the choice still applies.
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));

  if (announce && changed) {
    const announcer = document.getElementById(OFFER_PATH_ANNOUNCER_ID);
    const product = offerPaths.find((candidate) => candidate.id === path)?.product;
    if (announcer && product) announcer.textContent = `Showing ${product}.`;
  }
}

/**
 * Choose a path on a page that shows both. The content changes where it
 * stands and nothing scrolls, with one exception: if the part of the page that
 * shows the choice ([data-offer-region]: the homepage hero, the pricing
 * panels) is already out of view, the change would happen unseen, so the page
 * returns to its top, as opening that path's own page would.
 */
export function choosePathInPlace(
  path: OfferPathId,
  { afterMenuCloses = false }: { afterMenuCloses?: boolean } = {},
) {
  setOfferPath(path, { announce: true });
  window.history.replaceState(null, "", `#${path}`);

  const settle = () => {
    const region = document.querySelector<HTMLElement>("[data-offer-region]");
    if (!region) return;

    // The fixed navigation covers the top of the viewport.
    const covered = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
    if (region.getBoundingClientRect().bottom > covered) return;

    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // From the mobile menu the page stays scroll-locked until the menu has
  // closed, so this waits a moment.
  if (afterMenuCloses) window.setTimeout(settle, 60);
  else settle();
}
