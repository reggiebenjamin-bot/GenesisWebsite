"use client";

import { useEffect, type RefObject } from "react";
import {
  DESKTOP_GEOMETRY,
  MAX_BLUR,
  MOBILE_GEOMETRY,
  OVERSCAN,
  TIMING,
  ZOOM_END,
} from "./hero.config";

/* ── helpers ─────────────────────────────────────────────────────────── */

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const span = (v: number, [a, b]: readonly [number, number]) =>
  clamp((v - a) / (b - a));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * The push-in curve. Scale is exponential in `t`, which on its own already
 * reads at a constant rate; this adds just enough acceleration to feel like a
 * camera. A full cubic ease-in-out leaves a dead patch at the top of the
 * scroll, so it is blended back toward linear.
 */
const push = (t: number) => 0.35 * t + 0.65 * smooth(t);

const pct = (n: number) => `${(n * 100).toFixed(4)}%`;

/**
 * Drives the entrance overlay.
 *
 * The page is two ordinary stacked sections — hero, then Genesis System — and
 * the document is never interfered with: no scroll lock, no runway, no pinned
 * container, no repositioning. The overlay is a fixed layer that sits on top
 * during the entrance and is removed when it finishes.
 *
 * Progress is simply how far the hero has been scrolled out of view. At p = 1
 * the hero is exactly gone and the Genesis System is exactly at the top of the
 * viewport — which is also the frame the overlay has zoomed to. The two agree,
 * so removing the overlay at that instant changes nothing on screen.
 *
 * Custom properties are written to the overlay, not to the document, so the
 * static copy of the frame in the hero section keeps the `:root` defaults and
 * never moves.
 */
export function useHeroScrub({
  hero,
  entrance,
  onLand,
}: {
  hero: RefObject<HTMLElement | null>;
  entrance: RefObject<HTMLElement | null>;
  onLand: () => void;
}) {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobilePlate = window.matchMedia("(max-width: 767px)");

    let heroTop = 0;
    let heroHeight = 1;
    let zoomMax = 1 / DESKTOP_GEOMETRY.hole.w;
    let canvasStartScale = 1;
    let canvasEndScale = 1;
    let canvasStartX = 0;
    let canvasStartY = 0;
    let canvasEndX = 0;
    let canvasEndY = 0;
    let photoFadeStart = 0.96;
    let target = 0;
    let current = 0;
    let ticking = false;
    let landed = false;
    let measured = false;

    /** Transparent over the photograph, restrained once past it. Keyed to
     *  scroll rather than to the entrance, so it still holds on the way back
     *  up long after the overlay has gone. */
    function updateHeaderStage() {
      const overHero = window.scrollY < heroHeight - 88;
      root.dataset.heroStage = overHero ? "cinematic" : "landed";
    }

    function measure() {
      const el = hero.current;
      /* The layout viewport, not the window. `innerWidth` includes the
         scrollbar, so sizing from it lays the miniature out ~15px wider than
         the real section it hands over to — a visible jump at the seam. */
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      /* A page can be laid out at zero — a hidden tab, a restored session, or
         simply a first paint that beats the stylesheet. Never fall back to a
         nominal height: progress is scroll ÷ hero height, so a hero of 1px
         means the very first scroll clamps to 1 and retires the entrance on
         the spot. Bail, and let the ResizeObserver call back with a real box. */
      if (!el || !vw || !vh || el.offsetHeight < 1) return false;

      heroTop = el.getBoundingClientRect().top + window.scrollY;
      heroHeight = el.offsetHeight;

      const geometry = mobilePlate.matches
        ? MOBILE_GEOMETRY
        : DESKTOP_GEOMETRY;
      const cw = Math.max(vw, vh * geometry.aspect);
      const ch = Math.max(vh, vw / geometry.aspect);

      /* Push far enough that the cut-out clears the viewport — the plates
         occlude everything outside it, so the hole is the binding constraint. */
      const innerScreenWidth = geometry.hole.w * cw;
      const innerScreenHeight = geometry.hole.h * ch;
      const bareCover = Math.max(
        vw / innerScreenWidth,
        vh / innerScreenHeight,
      );
      zoomMax =
        Math.max(
          (vw + 48) / innerScreenWidth,
          (vh + 48) / innerScreenHeight,
        ) * OVERSCAN;

      /* Keep the preview box equal to the physical inner display. The live
         canvas inside it starts as a cover-fit miniature and independently
         resolves to viewport geometry before the handoff. */
      const boxW = geometry.hole.w;
      const boxH = geometry.hole.h;

      /* At rest the canvas covers the foreshortened display. At full zoom it
         is viewport-sized and centered inside the overscanned screen. */
      canvasStartScale = Math.max(
        innerScreenWidth / vw,
        innerScreenHeight / vh,
      );
      canvasEndScale = 1 / zoomMax;
      canvasStartX = (innerScreenWidth - vw * canvasStartScale) / 2;
      canvasStartY = (innerScreenHeight - vh * canvasStartScale) / 2;
      canvasEndX = (innerScreenWidth - vw * canvasEndScale) / 2;
      canvasEndY = (innerScreenHeight - vh * canvasEndScale) / 2;
      photoFadeStart = clamp(Math.log(bareCover) / Math.log(zoomMax), 0, 0.995);

      /* Geometry — as opposed to animation state — goes to *both* frames. The
         hero needs it so its laptop screen shows a correctly sized miniature;
         it stays still because the animated properties (`--hero-k`, the
         opacities, `--hero-copy-t`) are written only to the overlay, and the
         hero keeps the `:root` at-rest values for those. */
      for (const el of [hero.current, entrance.current]) {
        if (!el) continue;
        const st = el.style;
        st.setProperty("--hero-cx", pct(geometry.centre.x));
        st.setProperty("--hero-cy", pct(geometry.centre.y));
        st.setProperty("--hero-pan-x", pct(geometry.pan.x));
        st.setProperty("--hero-pan-y", pct(geometry.pan.y));
        st.setProperty("--hero-detail-x", pct(geometry.detail.left));
        st.setProperty("--hero-detail-y", pct(geometry.detail.top));
        st.setProperty("--hero-detail-w", pct(geometry.detail.width));
        st.setProperty("--hero-detail-h", pct(geometry.detail.height));
        st.setProperty("--hero-box-w", pct(boxW));
        st.setProperty("--hero-box-h", pct(boxH));
        st.setProperty("--hero-box-x", pct(geometry.centre.x - boxW / 2));
        st.setProperty("--hero-box-y", pct(geometry.centre.y - boxH / 2));
        st.setProperty("--hero-canvas-w", `${vw}px`);
        st.setProperty("--hero-canvas-h", `${vh}px`);
        st.setProperty("--hero-canvas-scale", canvasStartScale.toFixed(6));
        st.setProperty("--hero-canvas-x", `${canvasStartX.toFixed(4)}px`);
        st.setProperty("--hero-canvas-y", `${canvasStartY.toFixed(4)}px`);
      }

      measured = true;
      return true;
    }

    function draw(p: number) {
      const box = entrance.current;
      if (!box) return;

      const t = push(clamp(p / ZOOM_END));
      const k = Math.pow(zoomMax, t);
      const s = box.style;
      const align = smooth(span(t, TIMING.canvasAlign));
      const photoOpacity = 1 - smooth(span(t, [photoFadeStart, 1]));

      s.setProperty("--hero-k", k.toFixed(4));
      s.setProperty("--hero-pan-t", smooth(t).toFixed(4));
      s.setProperty(
        "--hero-canvas-scale",
        mix(canvasStartScale, canvasEndScale, align).toFixed(6),
      );
      s.setProperty(
        "--hero-canvas-x",
        `${mix(canvasStartX, canvasEndX, align).toFixed(4)}px`,
      );
      s.setProperty(
        "--hero-canvas-y",
        `${mix(canvasStartY, canvasEndY, align).toFixed(4)}px`,
      );
      s.setProperty("--hero-photo-o", photoOpacity.toFixed(4));

      s.setProperty("--hero-wide-o", (1 - span(t, TIMING.wideOut)).toFixed(4));
      s.setProperty(
        "--hero-wide-blur",
        `${(span(t, TIMING.defocus) * MAX_BLUR).toFixed(3)}px`,
      );
      s.setProperty("--hero-detail-o", span(t, TIMING.detailIn).toFixed(4));
      s.setProperty(
        "--hero-atmosphere",
        (1 - span(t, TIMING.atmosphereOut)).toFixed(4),
      );
      s.setProperty("--hero-copy-t", span(p, TIMING.copyOut).toFixed(4));
      box.dataset.photoHidden = t >= 0.9999 ? "true" : "false";
    }

    /**
     * The entrance is spent. Nothing is moved, collapsed or re-seated — the
     * overlay is simply taken away, and what is underneath is the Genesis
     * System section already sitting exactly where the overlay had zoomed to.
     * The hero is still there, above it, as an ordinary section.
     */
    function land() {
      if (landed) return;
      landed = true;
      draw(1);

      const box = entrance.current;
      const screen = box?.querySelector<HTMLElement>(".hero-screen");
      if (box && screen) {
        const rect = screen.getBoundingClientRect();
        const vw = document.documentElement.clientWidth;
        const vh = document.documentElement.clientHeight;
        const passes =
          rect.left <= -24 &&
          rect.top <= -24 &&
          rect.right >= vw + 24 &&
          rect.bottom >= vh + 24;

        root.dataset.heroFinalCoverage = passes ? "pass" : "fail";
        root.dataset.heroFinalBounds = [
          rect.left,
          rect.top,
          rect.right,
          rect.bottom,
        ]
          .map((value) => value.toFixed(2))
          .join(",");

        box.dataset.photoHidden = "true";
        box.style.opacity = "0";
        box.style.visibility = "hidden";
        box.style.pointerEvents = "none";
      }
      onLand();
    }

    /* Damping makes wheel and trackpad feel like a camera rather than a
       slider; the loop parks itself once it has caught up. */
    function frame() {
      const delta = target - current;
      if (Math.abs(delta) < 0.00015) {
        current = target;
        draw(current);
        ticking = false;
        if (current >= 0.999) land();
        return;
      }
      current += delta * 0.18;
      draw(current);
      requestAnimationFrame(frame);
    }

    function onScroll() {
      /* The first measure can land before the stylesheet does, leaving no
         usable hero height. Scrolling must not then divide by a stale one —
         that reads as instant completion. Retry until it takes; afterwards
         this costs nothing. */
      if (!measured && !measure()) return;
      updateHeaderStage();
      if (landed) return;

      target = clamp((window.scrollY - heroTop) / heroHeight);

      /* Once the hero is fully scrolled past, the section below is already in
         its final position. Snap rather than ease in, so a fast flick cannot
         strand the overlay mid-zoom over a page that has moved on. */
      if (target >= 1) {
        current = 1;
        land();
        return;
      }
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frame);
      }
    }

    /* Mobile browsers fire resize whenever the address bar slides. The CSS is
       on svh and does not move, so ignore height-only churn on touch. */
    const wobbly = window.matchMedia("(pointer: coarse)").matches;
    let lastW = 0;
    let lastH = 0;

    function onResize() {
      const w = document.documentElement.clientWidth;
      const h = document.documentElement.clientHeight;
      if (lastW && wobbly && w === lastW && Math.abs(h - lastH) < 140) return;
      if (!measure()) return;
      lastW = w;
      lastH = h;
      updateHeaderStage();
      if (landed) return;
      target = clamp((window.scrollY - heroTop) / heroHeight);
      current = target; // no easing across a resize
      draw(current);
    }

    onResize();

    /* Reduced motion never animates: retire the entrance immediately and let
       the two sections stand as ordinary page. No scroll is moved. */
    if (reduced.matches) {
      landed = true;
      onLand();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);
    document.fonts?.ready.then(onResize);

    const observer = new ResizeObserver(onResize);
    if (hero.current) observer.observe(hero.current);

    const onMotionChange = () => window.location.reload();
    reduced.addEventListener("change", onMotionChange);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      reduced.removeEventListener("change", onMotionChange);
      observer.disconnect();
      delete root.dataset.heroStage;
    };
  }, [hero, entrance, onLand]);
}

/**
 * Holds the entrance until the wide plate has decoded, so the settle never
 * plays against an empty frame. Capped so a slow network cannot strand it.
 */
export function useHeroReady(plate: RefObject<HTMLImageElement | null>) {
  useEffect(() => {
    const ready = () => document.documentElement.classList.add("hero-ready");
    const img = plate.current;

    if (img && !img.complete) {
      img.addEventListener("load", ready, { once: true });
      img.addEventListener("error", ready, { once: true });
    }
    img?.decode?.().then(ready, ready);
    const timer = window.setTimeout(ready, 1600);

    return () => window.clearTimeout(timer);
  }, [plate]);
}
