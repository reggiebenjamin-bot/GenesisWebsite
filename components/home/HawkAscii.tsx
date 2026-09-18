"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { AsciiEffect } from "@/components/ui/ascii-effect";
import { cn } from "@/lib/utils";
import styles from "./HawkAscii.module.css";
import { HAWK } from "./hawkSettings";

/* Every value below, and every value in hawkSettings.ts, is passed to the
   Componentry AsciiEffect as a documented prop. They are module constants on
   purpose: the effect restarts whenever a prop's identity changes, so an
   inline array would restart it every render. */

/** Darkest to brightest, in sixteen steps: fine tonal steps are what carry
    the feather detail. Round and upright glyphs only, since dashes and equals
    signs read as horizontal streaks across the feathers. */
const CHARACTERS = " .':;il1tco09O8@";

/** Slate in the shadows rising to ivory, warmed only at the very top.
    Six-digit hex only — the effect interpolates by parsing them. */
const PALETTE = ["#2e3442", "#626a7a", "#b0b5bd", "#f4efe8", "#fbf1d8"];

const MONO =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

/** Must equal the section background so the canvas has no visible edge. */
const INK = "#08090e";

/** Smaller on a phone, so the whole head fits across the narrow screen. */
const PHONE_SCALE = 0.42;

/** The share of the hawk that must be on screen for it to keep moving. */
const ANIMATE_WHILE_VISIBLE = 0.35;

type Status = "loading" | "ready" | "unavailable";

function mediaQuery(query: string) {
  return {
    subscribe(onChange: () => void) {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    matches: () => window.matchMedia(query).matches,
  };
}

const reducedMotionQuery = mediaQuery("(prefers-reduced-motion: reduce)");
const phoneQuery = mediaQuery("(max-width: 639px)");

/**
 * The hawk drawn in characters from `src` (see hawkAsset.ts). Until the image
 * has loaded, or if the browser cannot draw it, the static fallback stays.
 */
export function HawkAscii({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  // Reduced motion until proven otherwise, so the server never promises movement.
  const reducedMotion = useSyncExternalStore(
    reducedMotionQuery.subscribe,
    reducedMotionQuery.matches,
    () => true,
  );
  const phone = useSyncExternalStore(phoneQuery.subscribe, phoneQuery.matches, () => false);
  const [status, setStatus] = useState<Status>("loading");
  const [onScreen, setOnScreen] = useState(false);
  const [seen, setSeen] = useState(false);
  const scale = phone ? PHONE_SCALE : HAWK.scale;

  // Animate only while most of the hawk is on screen. Once the reader has
  // scrolled it mostly away the effect is given its static variant, which
  // draws once and schedules no frames, so the page below scrolls smoothly.
  useEffect(() => {
    const element = frame.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setOnScreen(entry.intersectionRatio >= ANIMATE_WHILE_VISIBLE);
        if (entry.isIntersecting) setSeen(true);
      },
      { rootMargin: "80px 0px", threshold: [0, ANIMATE_WHILE_VISIBLE] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Mount the effect only once the image has actually loaded and the browser
  // can draw to a 2D canvas. Otherwise the fallback simply stays.
  useEffect(() => {
    let cancelled = false;
    const probe = new Image();
    // Requested the way the effect requests it, so an image the canvas is not
    // allowed to read leaves the fallback in place rather than breaking.
    probe.crossOrigin = "anonymous";

    probe.onload = () => {
      if (cancelled) return;
      const canDraw = Boolean(document.createElement("canvas").getContext("2d"));
      setStatus(canDraw && probe.naturalWidth > 0 ? "ready" : "unavailable");
    };
    probe.onerror = () => {
      if (!cancelled) setStatus("unavailable");
    };
    probe.src = src;

    return () => {
      cancelled = true;
      probe.onload = null;
      probe.onerror = null;
    };
  }, [src]);

  // A phone gets the still image: there is no pointer to ripple under, and
  // its small characters are drawn once instead of on every frame.
  const animate = onScreen && !reducedMotion && !phone && HAWK.animate;

  return (
    <div
      ref={frame}
      className={cn(styles.frame, className)}
      data-status={status}
      aria-hidden="true"
    >
      <div
        className={styles.fallback}
        style={{ "--hawk-image": `url("${src}")`, "--hawk-scale": scale } as CSSProperties}
      />

      {status === "ready" && seen ? (
        <AsciiEffect
          className={styles.canvas}
          imageSrc={src}
          alt=""
          variant={animate ? "flow" : "image"}
          chars={CHARACTERS}
          colors={PALETTE}
          colorMode="gradient"
          backgroundColor={INK}
          fontFamily={MONO}
          // Animated frames redraw every character, so the moving version uses
          // fewer, larger ones than the still phone image.
          fontSize={phone ? 6 : HAWK.fontSize}
          fontWeight={500}
          lineHeight={HAWK.lineHeight}
          characterSpacing={HAWK.characterSpacing}
          brightnessBoost={HAWK.brightness}
          contrast={HAWK.contrast}
          threshold={HAWK.threshold}
          posterize={32}
          dither="none"
          flowSpeed={HAWK.flowSpeed}
          flowDirection={0}
          flowStrength={HAWK.flowStrength}
          flowFrequency={0.012}
          mouseRadius={HAWK.mouseRadius}
          mouseStrength={HAWK.mouseStrength}
          mouseWaveSpeed={0.9}
          fit="cover"
          scale={scale}
        />
      ) : null}
    </div>
  );
}
