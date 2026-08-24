"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useReducedMotion } from "@/components/hooks/useMotionPreference";
import { systemLayers } from "@/lib/content";
import styles from "./GenesisSystemScale.module.css";

const VIEWBOX = { width: 1440, height: 760 };
const CURVE =
  "M 0 676 C 330 676, 590 646, 825 566 C 1090 476, 1265 248, 1440 0";
const checkpoints = [0.39, 0.58, 0.76, 0.9] as const;

type SignalState = {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  dormantUntil: number;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const random = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * The Solutions-page system visual. The curve itself is the shared operating
 * spine; the four content checkpoints are positioned from its real SVG path
 * whenever the visual resizes, so their connectors cannot drift away.
 */
export function GenesisSystemScale() {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const curveRef = useRef<SVGPathElement>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const detailRef = useRef<HTMLElement>(null);
  const signalRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [entered, setEntered] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mobileActiveIndex, setMobileActiveIndex] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();

  const placeDetail = useCallback((index: number) => {
    const visual = visualRef.current;
    const step = stepRefs.current[index];
    const detail = detailRef.current;
    if (!visual || !step || !detail || window.innerWidth <= 860) return;

    const visualRect = visual.getBoundingClientRect();
    const stepRect = step.getBoundingClientRect();
    const width = detail.offsetWidth || 340;
    const height = detail.offsetHeight || 175;
    const margin = 22;
    let x = stepRect.left - visualRect.left + 30;
    if (x + width > visualRect.width - margin) {
      x = stepRect.left - visualRect.left - width - 30;
    }

    let y = stepRect.top - visualRect.top - height - 24;
    if (y < margin) y = stepRect.top - visualRect.top + 34;
    y = Math.min(y, visualRect.height - height - margin);
    detail.style.setProperty("--card-x", `${Math.max(margin, x)}px`);
    detail.style.setProperty("--card-y", `${Math.max(margin, y)}px`);
  }, []);

  const placeSteps = useCallback(() => {
    const visual = visualRef.current;
    const curve = curveRef.current;
    if (!visual || !curve) return;

    const bounds = visual.getBoundingClientRect();
    const total = curve.getTotalLength();
    checkpoints.forEach((progress, index) => {
      const point = curve.getPointAtLength(total * progress);
      const step = stepRefs.current[index];
      if (!step) return;
      step.style.setProperty("--x", `${(point.x / VIEWBOX.width) * bounds.width}px`);
      step.style.setProperty("--y", `${(point.y / VIEWBOX.height) * bounds.height}px`);
    });

    if (activeIndex !== null) placeDetail(activeIndex);
  }, [activeIndex, placeDetail]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduceMotion) {
      setEntered(true);
      return;
    }

    let played = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || played) return;
        played = true;
        setEntered(true);
        observer.disconnect();
      },
      { threshold: 0.16 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    const visual = visualRef.current;
    if (!visual) return;
    const observer = new ResizeObserver(() => placeSteps());
    observer.observe(visual);
    placeSteps();
    return () => observer.disconnect();
  }, [placeSteps]);

  useEffect(() => {
    if (activeIndex !== null) placeDetail(activeIndex);
  }, [activeIndex, placeDetail]);

  useEffect(() => {
    const visual = visualRef.current;
    if (!visual || reduceMotion || !entered) return;

    const signals = signalRefs.current.filter(
      (signal): signal is HTMLSpanElement => signal !== null,
    );
    const state: SignalState[] = signals.map(() => ({
      x: 0,
      y: 0,
      length: 120,
      speed: 1,
      opacity: 0.4,
      dormantUntil: 0,
    }));
    let bounds = { width: 0, height: 0 };
    let visible = false;
    let frame = 0;
    let previous = performance.now();

    const reset = (signal: SignalState, now: number, initial = false) => {
      const spacing = 18;
      const columns = Math.max(1, Math.floor(bounds.width / spacing));
      signal.x = spacing * Math.floor(random(1, columns - 1));
      signal.length = random(70, 150);
      signal.speed = random(0.34, 0.56);
      signal.opacity = random(0.2, 0.4);
      signal.y = initial
        ? random(-signal.length, bounds.height)
        : bounds.height + signal.length;
      signal.dormantUntil = now + (initial ? 0 : random(1200, 3600));
    };

    const tick = (now: number) => {
      frame = 0;
      if (!visible || !bounds.width || !bounds.height) return;
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;

      state.forEach((signal, index) => {
        const element = signals[index];
        if (signal.dormantUntil > now) {
          element.style.opacity = "0";
          return;
        }
        signal.y -= 105 * signal.speed * delta;
        if (signal.y + signal.length < 0) {
          reset(signal, now);
          element.style.opacity = "0";
          return;
        }
        const fromBottom = clamp01((bounds.height - signal.y) / signal.length);
        const nearTop = clamp01((signal.y + signal.length) / 105);
        element.style.transform = `translate3d(${signal.x}px, ${signal.y}px, 0) scaleY(${signal.length / 150})`;
        element.style.opacity = String(signal.opacity * fromBottom * nearTop);
      });
      frame = requestAnimationFrame(tick);
    };

    const resize = new ResizeObserver(([entry]) => {
      bounds = { width: entry.contentRect.width, height: entry.contentRect.height };
      state.forEach((signal, index) => reset(signal, performance.now(), index === 0));
    });
    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible && !frame) {
          previous = performance.now();
          frame = requestAnimationFrame(tick);
        }
        if (!visible && frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "160px" },
    );
    resize.observe(visual);
    visibility.observe(visual);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      visibility.disconnect();
    };
  }, [entered, reduceMotion]);

  const show = (index: number) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setActiveIndex(index);
  };
  const hideSoon = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setActiveIndex(null), 150);
  };

  const activeLayer = activeIndex === null ? null : systemLayers[activeIndex];

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      data-entered={entered ? "true" : "false"}
    >
      <div className={styles.shell}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>The Genesis System</p>
          <h2>One managed foundation behind every part of your operation.</h2>
          <p className={styles.mobileSubtitle}>
            Four connected layers, built to operate as one accountable system.
          </p>
        </header>

        <div ref={visualRef} className={styles.visual}>
          <svg
            className={styles.grid}
            viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="genesis-system-stems"
                width="12"
                height={VIEWBOX.height}
                patternUnits="userSpaceOnUse"
              >
                <path className={styles.gridLine} d={`M 11.5 0 V ${VIEWBOX.height}`} />
              </pattern>
            </defs>
            <path
              className={styles.gridShape}
              d={`${CURVE} L ${VIEWBOX.width} ${VIEWBOX.height} L 0 ${VIEWBOX.height} Z`}
            />
          </svg>
          <div className={styles.bloom} aria-hidden="true" />
          <div className={styles.signals} aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => (
              <span
                key={index}
                ref={(element) => {
                  signalRefs.current[index] = element;
                }}
                className={styles.signal}
              />
            ))}
          </div>
          <svg
            className={styles.curve}
            viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className={styles.curveBase} d={CURVE} />
            <path
              ref={curveRef}
              className={styles.curveAccent}
              d={CURVE}
              pathLength="1"
            />
            <path className={styles.curvePulse} d={CURVE} pathLength="1" />
          </svg>

          <div className={styles.steps}>
            {systemLayers.map((layer, index) => (
              <div
                key={layer.number}
                ref={(element) => {
                  stepRefs.current[index] = element;
                }}
                className={styles.step}
                data-active={activeIndex === index || undefined}
                style={
                  {
                    "--stem": `${[82, 104, 94, 78][index]}px`,
                    "--chip-width": `${[220, 205, 185, 172][index]}px`,
                    "--delay": `${280 + index * 175}ms`,
                  } as CSSProperties
                }
                onMouseEnter={() => show(index)}
                onMouseLeave={hideSoon}
              >
                <span className={styles.marker} aria-hidden="true" />
                <span className={styles.stem} aria-hidden="true" />
                <button
                  type="button"
                  className={styles.trigger}
                  aria-expanded={activeIndex === index}
                  aria-controls="genesis-system-detail"
                  onFocus={() => show(index)}
                  onBlur={hideSoon}
                  onClick={() => setActiveIndex((current) => (current === index ? null : index))}
                >
                  <span className={styles.number}>{layer.number}</span>
                  <span className={styles.name}>{layer.title}</span>
                </button>
              </div>
            ))}
          </div>

          <aside
            ref={detailRef}
            id="genesis-system-detail"
            className={styles.detail}
            data-visible={activeLayer ? "true" : "false"}
            onMouseEnter={() => {
              if (hideTimer.current) clearTimeout(hideTimer.current);
            }}
            onMouseLeave={hideSoon}
            aria-live="polite"
          >
            {activeLayer ? (
              <>
                <p className={styles.detailKicker}>Layer {activeLayer.number}</p>
                <h3>{activeLayer.title}</h3>
                <p>{activeLayer.description}</p>
              </>
            ) : null}
          </aside>
        </div>

        <div className={styles.mobileTimeline}>
          {systemLayers.map((layer, index) => {
            const isOpen = mobileActiveIndex === index;
            const bodyId = `genesis-mobile-layer-${layer.number}`;

            return (
              <article
                key={layer.number}
                className={styles.mobileStep}
                data-open={isOpen ? "true" : "false"}
                style={{ "--mobile-delay": `${120 + index * 90}ms` } as CSSProperties}
              >
                <div className={styles.mobileRail} aria-hidden="true">
                  <span className={styles.mobileDiamondWrap}>
                    <span className={styles.mobileDiamond} />
                  </span>
                </div>

                <div className={styles.mobileChip}>
                  <button
                    type="button"
                    className={styles.mobileTrigger}
                    aria-expanded={isOpen}
                    aria-controls={bodyId}
                    onClick={() =>
                      setMobileActiveIndex((current) =>
                        current === index ? null : index,
                      )
                    }
                  >
                    <span>
                      <span className={styles.mobileNumber}>{layer.number}</span>
                      <span className={styles.mobileName}>{layer.title}</span>
                    </span>
                    <span className={styles.mobileToggle} aria-hidden="true" />
                  </button>

                  <div id={bodyId} className={styles.mobileBody}>
                    <div className={styles.mobileBodyInner}>
                      <p>{layer.description}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
