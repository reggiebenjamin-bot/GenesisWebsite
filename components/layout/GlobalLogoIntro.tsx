"use client";

import { useEffect, useId, useRef, useState } from "react";

const SVG_NS = "http://www.w3.org/2000/svg";
const SOURCE_DURATION = 7200;
const PLAYBACK_SCALE = 0.38;
const EXIT_DURATION = 720;
const REPLAY_BRIDGE_DURATION = 1400;

const LOGO_PATH =
  "M762.252175,302.341551C760.43862,301.676536 760.2725,301.270614 758.847656,302.585006C754.150179,306.918342 753.697251,306.354657 747.246094,306.426853C714.525616,306.793034 714.618829,306.187009 681.854959,306.414353C674.82505,306.463133 483.621199,305.881603 479.383546,306.601672C473.858392,307.540515 477.681955,310.019182 478.367941,310.852663C472.977693,314.187875 340.553568,498.227089 306.846159,543.000588C302.109008,549.292938 305.542746,550.023433 314.363534,561.953801C322.146215,572.480099 409.916778,691.19229 411.405199,693.710987C412.659377,695.833298 411.630283,696.027282 394.479685,719.461417C310.353543,834.409206 311.753766,835.420499 303.989854,845.069476C302.113778,847.40106 301.458325,845.044587 283.769497,820.339521C135.905424,613.825455 90.064923,552.263697 88.449615,549.791244C86.437064,546.710753 100.464405,531.800989 115.066792,511.736839C124.521023,498.746422 147.820311,467.65924 150.684159,463.838138C248.678417,333.088846 375.47291,153.385278 380.367528,149.447094C380.837463,148.71839 380.944198,148.71839 561.620833,148.76195C871.601431,148.836685 872.549844,147.6464 873.377971,149.445109C874.341097,151.53704 780.043053,278.733523 762.252175,302.341551ZM480.410996,694.284995C730.190394,693.865845 731.468851,695.659749 734.189047,692.082979C736.143173,689.513508 792.649681,612.186608 812.208721,586.600316C815.489448,582.308611 815.006947,581.888456 814.915768,555.291037C814.913776,554.70995 814.892773,548.582929 813.608505,548.146017C811.796121,547.529438 479.167189,548.409195 478.506833,547.671594C477.174681,546.183613 494.760767,525.01189 511.354542,501.757251C516.402444,494.683084 516.502081,494.846046 575.705773,414.23741C580.984383,407.050332 582.724108,409.107547 596.42422,409.109117C967.967898,409.151672 968.304079,408.357376 969.784418,409.746823C970.786385,410.68727 970.852095,645.841004 969.748906,648.08478C968.140965,651.355172 899.246561,740.500077 893.065751,748.497646C857.309687,794.763681 858.298593,795.397887 822.755631,841.848229C818.009181,848.051264 815.547732,846.229811 803.143719,846.252615C768.312038,846.316651 368.86334,847.051018 367.747004,846.076916C366.861966,845.304642 367.773415,844.946666 416.613648,777.444269C433.470179,754.14675 433.659446,754.405018 450.462412,731.11323C451.706878,729.388186 462.836712,713.96033 466.081893,709.59624C476.144711,696.063849 475.719481,695.007788 480.410996,694.284995Z";

type CompileItem = {
  dot: SVGCircleElement;
  cell: SVGRectElement;
  x: number;
  y: number;
  start: number;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const easeOut = (value: number) => 1 - Math.pow(1 - clamp(value), 3);

function CompileAnimation({
  embedded = false,
  startWhenVisible = false,
  replay = false,
  replayDelay = 2600,
  deferStartMs = 0,
  className = "",
}: {
  embedded?: boolean;
  startWhenVisible?: boolean;
  replay?: boolean;
  replayDelay?: number;
  deferStartMs?: number;
  className?: string;
}) {
  const mark = useRef<SVGSVGElement>(null);
  const dotsLayer = useRef<SVGGElement>(null);
  const cellsLayer = useRef<SVGGElement>(null);
  const solid = useRef<SVGUseElement>(null);
  const [state, setState] = useState<
    "waiting" | "active" | "complete" | "exiting" | "hidden"
  >(startWhenVisible ? "waiting" : "active");
  const instanceId = useId().replaceAll(":", "");
  const sampleGradientId = `${instanceId}-sample-gold`;
  const solidGradientId = `${instanceId}-solid-gold`;
  const shapeId = `${instanceId}-shape`;
  const clipId = `${instanceId}-clip`;

  useEffect(() => {
    const root = document.documentElement;
    const dots = dotsLayer.current;
    const cells = cellsLayer.current;
    const finalLogo = solid.current;
    const markElement = mark.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!dots || !cells || !finalLogo || !markElement) return;

    if (!embedded) root.dataset.brandIntro = "active";

    if (reducedMotion.matches) {
      finalLogo.setAttribute("opacity", "1");
      dots.setAttribute("opacity", "0");
      cells.setAttribute("opacity", "0");
      if (!embedded) delete root.dataset.brandIntro;
      return;
    }

    const dotsElement = dots;
    const cellsElement = cells;
    const finalLogoElement = finalLogo;

    const spacing = embedded ? 55 : 31;
    const dotRadius = embedded ? 9 : 4.25;
    const initialCellHeight = embedded ? 6 : 3;
    const items: CompileItem[] = [];
    let animationFrame = 0;
    let exitTimer = 0;
    let replayTimer = 0;
    let startTimer = 0;
    let observer: IntersectionObserver | undefined;
    let hasStarted = false;
    let isRunning = false;
    let isVisible = !startWhenVisible;

    function scheduleReplay() {
      window.clearTimeout(replayTimer);
      if (!replay || !isVisible || isRunning) return;

      replayTimer = window.setTimeout(() => {
        if (isVisible) run();
      }, replayDelay);
    }

    function run() {
      if (isRunning) return;

      const isReplayRun = hasStarted;
      isRunning = true;
      hasStarted = true;
      window.clearTimeout(replayTimer);
      items.length = 0;
      setState("active");
      dotsElement.replaceChildren();
      cellsElement.replaceChildren();
      dotsElement.setAttribute("opacity", isReplayRun ? "0" : "1");
      cellsElement.setAttribute("opacity", "1");
      finalLogoElement.setAttribute("opacity", isReplayRun ? "1" : "0");

      for (let y = 130, row = 0; y <= 870; y += spacing, row += 1) {
        for (let x = 60, column = 0; x <= 1000; x += spacing, column += 1) {
          const dot = document.createElementNS(SVG_NS, "circle");
          dot.setAttribute("cx", String(x));
          dot.setAttribute("cy", String(y));
          dot.setAttribute("r", String(dotRadius));
          dot.setAttribute("opacity", ".88");
          dotsElement.appendChild(dot);

          const cell = document.createElementNS(SVG_NS, "rect");
          cell.setAttribute("x", String(x));
          cell.setAttribute("y", String(y - initialCellHeight / 2));
          cell.setAttribute("width", "0");
          cell.setAttribute("height", String(initialCellHeight));
          cell.setAttribute("opacity", "0");
          cellsElement.appendChild(cell);

          const lane = (row * 7 + column * 11 + (row % 3) * 5) % 29;
          const diagonal = (row + column) * 13;
          const start = 1700 + lane * 48 + diagonal * 2.1;

          items.push({ dot, cell, x, y, start });
        }
      }

      const started = performance.now();

      function frame(now: number) {
        const elapsed = (now - started) / PLAYBACK_SCALE;

        for (const { dot, cell, x, y, start } of items) {
          const lineProgress = easeOut((elapsed - start) / 650);
          const width = spacing * 1.08 * lineProgress;

          cell.setAttribute("x", String(x - width / 2));
          cell.setAttribute("width", String(width));
          cell.setAttribute("opacity", String(lineProgress));

          const lockProgress = smooth((elapsed - (start + 520)) / 780);
          const height =
            initialCellHeight +
            (spacing * 1.08 - initialCellHeight) * lockProgress;

          cell.setAttribute("y", String(y - height / 2));
          cell.setAttribute("height", String(height));

          const dotProgress = smooth((elapsed - (start + 120)) / 520);
          const idle =
            0.94 + Math.sin((elapsed + x * 0.5 + y * 0.35) / 520) * 0.06;
          dot.setAttribute(
            "opacity",
            String((0.88 * idle * (1 - dotProgress)).toFixed(3)),
          );
        }

        const vectorProgress = smooth((elapsed - 5050) / 900);
        const bridgeProgress = isReplayRun
          ? smooth(elapsed / REPLAY_BRIDGE_DURATION)
          : 1;

        dotsElement.setAttribute("opacity", String(bridgeProgress));
        finalLogoElement.setAttribute(
          "opacity",
          String(
            isReplayRun && elapsed < REPLAY_BRIDGE_DURATION
              ? 1 - bridgeProgress
              : vectorProgress,
          ),
        );
        cellsElement.setAttribute(
          "opacity",
          String(1 - smooth((elapsed - 5450) / 650)),
        );

        if (elapsed < SOURCE_DURATION) {
          animationFrame = requestAnimationFrame(frame);
          return;
        }

        finalLogoElement.setAttribute("opacity", "1");
        cellsElement.setAttribute("opacity", "0");
        dotsElement.setAttribute("opacity", "0");
        isRunning = false;

        if (embedded) {
          setState("complete");
          scheduleReplay();
        } else {
          root.dataset.brandIntro = "exiting";
          setState("exiting");
          exitTimer = window.setTimeout(() => {
            delete root.dataset.brandIntro;
            setState("hidden");
          }, EXIT_DURATION);
        }
      }

      animationFrame = requestAnimationFrame(frame);
    }

    function startWhenReady() {
      window.clearTimeout(startTimer);
      if (hasStarted) {
        scheduleReplay();
        return;
      }

      if (!deferStartMs) {
        run();
        return;
      }

      startTimer = window.setTimeout(() => {
        if (isVisible) run();
      }, deferStartMs);
    }

    if (startWhenVisible) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;

          isVisible = entry.isIntersecting;
          if (!isVisible) {
            window.clearTimeout(startTimer);
            window.clearTimeout(replayTimer);
            return;
          }

          startWhenReady();
        },
        { threshold: 0.35 },
      );
      observer.observe(markElement);
    } else {
      run();
    }

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(exitTimer);
      window.clearTimeout(replayTimer);
      window.clearTimeout(startTimer);
      dotsElement.replaceChildren();
      cellsElement.replaceChildren();
      if (!embedded) delete root.dataset.brandIntro;
    };
  }, [deferStartMs, embedded, replay, replayDelay, startWhenVisible]);

  if (state === "hidden") return null;

  const logo = (
    <svg
      ref={mark}
      viewBox="0 0 1080 1080"
      className={className}
      role={embedded ? "img" : undefined}
      aria-label={embedded ? "Genesis" : undefined}
    >
      <defs>
        <linearGradient
          id={sampleGradientId}
          x1="170"
          y1="135"
          x2="930"
          y2="900"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#f4dfa6" />
          <stop offset=".48" stopColor="#dfbd75" />
          <stop offset="1" stopColor="#b68a42" />
        </linearGradient>
        <linearGradient
          id={solidGradientId}
          x1="950.916661"
          y1="888.833322"
          x2="468.499995"
          y2="497.511282"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#f1d898" />
          <stop offset="1" stopColor="#c8a562" />
        </linearGradient>
        <path id={shapeId} d={LOGO_PATH} />
        <clipPath id={clipId}>
          <use href={`#${shapeId}`} />
        </clipPath>
      </defs>

      <g
        ref={cellsLayer}
        clipPath={`url(#${clipId})`}
        fill={`url(#${sampleGradientId})`}
      />
      <g
        ref={dotsLayer}
        clipPath={`url(#${clipId})`}
        fill={`url(#${sampleGradientId})`}
      />
      <use
        ref={solid}
        href={`#${shapeId}`}
        fill={`url(#${solidGradientId})`}
        opacity={embedded && startWhenVisible ? "1" : "0"}
      />
    </svg>
  );

  if (embedded) return logo;

  return (
    <div
      className="global-logo-intro"
      data-state={state}
      aria-hidden="true"
      inert
    >
      {logo}
    </div>
  );
}

export function GenesisCompileLogo({
  className = "",
  deferStartMs = 0,
}: {
  className?: string;
  deferStartMs?: number;
}) {
  return (
    <CompileAnimation
      embedded
      startWhenVisible
      replay
      replayDelay={2600}
      deferStartMs={deferStartMs}
      className={className}
    />
  );
}

export function GlobalLogoIntro() {
  return <CompileAnimation className="global-logo-intro-mark" />;
}
