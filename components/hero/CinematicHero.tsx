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
 * The overlay is the only thing that ever transforms. The static frame stays
 * sticky within a short settle runway so wheel and touch momentum cannot carry
 * the document past the real system while the damped camera is catching up;
 * both sections remain in ordinary document flow and scrolling is never locked.
 *
 * The final part of the runway holds the completed system view. When the hero
 * is fully out, the real Genesis System is at the viewport and the overlay can
 * crossfade away, leaving the hero above it to scroll back to.
 */
export function CinematicHero() {
  const hero = useRef<HTMLElement>(null);
  const entrance = useRef<HTMLDivElement>(null);
  const widePlate = useRef<HTMLImageElement>(null);
  const hardware = useRef<HTMLImageElement>(null);
  const [landed, setLanded] = useState(false);

  const onLand = useCallback(() => setLanded(true), []);

  useHeroScrub({ hero, entrance, onLand });
  useHeroReady({ hero, entrance, plate: widePlate, hardware });

  return (
    <>
      <section
        ref={hero}
        className="hero-section relative isolate z-10 h-[140dvh] overflow-clip bg-ink max-md:h-[240svh]"
      >
        <div className="hero-static-frame sticky top-0 h-dvh overflow-clip bg-ink">
          {/* Keep the ordinary hero mounted from first paint. The fixed entrance
              covers it during the push, but its layout and media are already
              prepared when the overlay retires. Mounting this tree on the
              handoff frame caused a measurable layout/paint hitch. */}
          <CinematicFrame />
        </div>
      </section>

      <GenesisSystem />

      {/* The entrance. Decorative throughout — the hero beneath carries the
          real headline and calls to action, and the section beneath that is
          the real article — so it is hidden from assistive tech and kept out
          of the tab order. */}
      {!landed ? (
        <div ref={entrance} className="hero-entrance" aria-hidden="true">
          <div className="hero-entrance-frame">
            <CinematicFrame
              plateRef={widePlate}
              hardwareRef={hardware}
              progressive
            />
          </div>
        </div>
      ) : null}

    </>
  );
}
