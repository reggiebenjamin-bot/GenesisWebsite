"use client";

import { useCallback, useRef, useState } from "react";
import { CinematicFrame } from "./CinematicFrame";
import { GenesisSystem } from "./GenesisSystem";
import { HeroHardwareTuner } from "./HeroHardwareTuner";
import { useHeroReady, useHeroScrub } from "./useHeroScrub";

/**
 * Two real sections, and a temporary layer between them.
 *
 *   1. the hero        — an ordinary opening section, permanently in the page
 *   2. Genesis System  — an ordinary section, permanently below it
 *   3. the entrance    — a fixed overlay that plays the push once, then goes
 *
 * The overlay is the only thing that ever transforms. Mobile keeps the static
 * frame sticky within a longer first section so touch momentum has a useful
 * runway; both sections remain in ordinary document flow and scrolling is
 * never locked.
 *
 * The final part of the mobile runway holds the completed system view. When
 * the hero is fully out, the real Genesis System is at the viewport and the
 * overlay can crossfade away, leaving the hero above it to scroll back to.
 */
export function CinematicHero() {
  const hero = useRef<HTMLElement>(null);
  const entrance = useRef<HTMLDivElement>(null);
  const widePlate = useRef<HTMLImageElement>(null);
  const hardware = useRef<HTMLImageElement>(null);
  const [landed, setLanded] = useState(false);

  const onLand = useCallback(() => setLanded(true), []);

  useHeroScrub({ hero, entrance, onLand });
  useHeroReady(widePlate, hardware);

  return (
    <>
      <section
        ref={hero}
        className="hero-section relative isolate z-10 h-dvh overflow-clip bg-ink max-md:h-[240svh]"
      >
        <div className="hero-static-frame sticky top-0 h-dvh overflow-clip bg-ink">
          <CinematicFrame showHardware={landed} />
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
            <CinematicFrame plateRef={widePlate} hardwareRef={hardware} />
          </div>
        </div>
      ) : null}

      {process.env.NODE_ENV === "development" ? <HeroHardwareTuner /> : null}
    </>
  );
}
