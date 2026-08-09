"use client";

import { useCallback, useRef, useState } from "react";
import { CinematicFrame } from "./CinematicFrame";
import { GenesisSystem } from "./GenesisSystem";
import { useHeroReady, useHeroScrub } from "./useHeroScrub";

/**
 * Two real sections, and a temporary layer between them.
 *
 *   1. the hero        — an ordinary opening section, permanently in the page
 *   2. Genesis System  — an ordinary section, permanently below it
 *   3. the entrance    — a fixed overlay that plays the push once, then goes
 *
 * The overlay is the only thing that ever moves. Neither section is pinned,
 * collapsed, repositioned or transformed, and the document is never locked, so
 * scrolling is ordinary from the first frame to the last.
 *
 * Progress is just how far the hero has been scrolled out of view. When it is
 * fully out, the Genesis System is exactly at the top of the viewport — which
 * is precisely the frame the overlay has zoomed to. They agree, so the overlay
 * can be removed without a seam, leaving the visitor in the section with the
 * hero sitting above them to scroll back to.
 */
export function CinematicHero() {
  const hero = useRef<HTMLElement>(null);
  const entrance = useRef<HTMLDivElement>(null);
  const widePlate = useRef<HTMLImageElement>(null);
  const [landed, setLanded] = useState(false);

  const onLand = useCallback(() => setLanded(true), []);

  useHeroScrub({ hero, entrance, onLand });
  useHeroReady(widePlate);

  return (
    <>
      <section
        ref={hero}
        className="hero-section relative isolate z-10 h-svh overflow-clip bg-ink"
      >
        <CinematicFrame />
      </section>

      <GenesisSystem />

      {/* The entrance. Decorative throughout — the hero beneath carries the
          real headline and calls to action, and the section beneath that is
          the real article — so it is hidden from assistive tech and kept out
          of the tab order. */}
      {!landed ? (
        <div ref={entrance} className="hero-entrance" aria-hidden="true" inert>
          <CinematicFrame plateRef={widePlate} />
        </div>
      ) : null}
    </>
  );
}
