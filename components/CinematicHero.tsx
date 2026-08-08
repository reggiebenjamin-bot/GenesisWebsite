"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { systemLayers } from "@/lib/content";

type HeroState = "initial" | "transitioning" | "completed";

const TRANSITION_DURATION = 1280;

export function CinematicHero() {
  const [state, setState] = useState<HeroState>("initial");
  const touchStart = useRef<number | null>(null);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completeImmediately = useCallback(() => {
    if (completionTimer.current) clearTimeout(completionTimer.current);
    setState("completed");
  }, []);

  const beginTransition = useCallback(() => {
    setState((current) => {
      if (current !== "initial") return current;
      completionTimer.current = setTimeout(
        () => setState("completed"),
        TRANSITION_DURATION,
      );
      return "transitioning";
    });
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const initialCompletionFrame =
      motionQuery.matches || window.scrollY > 8
        ? window.requestAnimationFrame(completeImmediately)
        : null;

    const onMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) completeImmediately();
    };
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY > 8) beginTransition();
    };
    const onTouchStart = (event: TouchEvent) => {
      touchStart.current = event.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (event: TouchEvent) => {
      const current = event.touches[0]?.clientY;
      if (
        touchStart.current !== null &&
        current !== undefined &&
        touchStart.current - current > 22
      ) {
        beginTransition();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(event.key)) beginTransition();
    };

    motionQuery.addEventListener("change", onMotionChange);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      motionQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      if (initialCompletionFrame !== null) {
        window.cancelAnimationFrame(initialCompletionFrame);
      }
      if (completionTimer.current) clearTimeout(completionTimer.current);
    };
  }, [beginTransition, completeImmediately]);

  useEffect(() => {
    document.documentElement.dataset.heroState = state;
    return () => {
      delete document.documentElement.dataset.heroState;
    };
  }, [state]);

  return (
    <section className="cinematic-hero" data-hero-state={state}>
      <div className="cinematic-sticky">
        <div className="hero-photography" aria-hidden="true">
          <div className="hero-world-frame">
            <Image
              src="/images/hero/genesis-hero-world.webp"
              alt=""
              fill
              priority
              quality={92}
              sizes="100vw"
            />
          </div>
          <div className="hero-approach-frame">
            <Image
              src="/images/hero/genesis-hero-approach.webp"
              alt=""
              fill
              priority
              quality={92}
              sizes="(max-width: 720px) 1px, 78vw"
            />
          </div>
        </div>

        <div className="hero-digital-world" aria-hidden="true">
          <div className="system-architecture">
            <div className="architecture-heading">
              <span className="architecture-kicker">Genesis managed system</span>
              <strong>Your business, connected underneath.</strong>
            </div>
            <div className="architecture-spine" />
            <div className="architecture-nodes">
              {systemLayers.map((layer, index) => (
                <div className="architecture-node" key={layer.number}>
                  <span className="architecture-node__status" />
                  <span className="architecture-node__number">{layer.number}</span>
                  <span>{layer.shortTitle}</span>
                  <i aria-hidden="true" style={{ animationDelay: `${index * 180}ms` }} />
                </div>
              ))}
            </div>
            <div className="architecture-signal architecture-signal--one" />
            <div className="architecture-signal architecture-signal--two" />
          </div>
        </div>

        <div className="hero-vignette" aria-hidden="true" />

        <div className="shell hero-content">
          <p className="eyebrow">AI + Systems for Real Estate Operators</p>
          <h1>
            AI systems that help real-estate operators
            <span> work faster and close more deals.</span>
          </h1>
          <p className="hero-content__support">
            Genesis provisions your Microsoft 365 foundation, builds practical
            AI workflows, adds an optional CRM layer, and manages the system as
            your operation evolves.
          </p>
          <div className="hero-actions">
            <Link className="button button--gold" href="/contact">
              Book a Consultation
            </Link>
            <Link className="button button--ghost" href="/how-it-works">
              See How It Works <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <button
          type="button"
          className="hero-begin"
          onClick={beginTransition}
          aria-label="Enter the Genesis AI website"
        >
          <span>Scroll to enter</span>
          <span className="hero-begin__line" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
