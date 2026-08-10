"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { systemLayers } from "@/lib/content";
import styles from "./GenesisSystemScale.module.css";

const VIEWBOX = { width: 1400, height: 760, floor: 675 };
const checkpoints = [
  { x: "13%", y: "73%" },
  { x: "36%", y: "63%" },
  { x: "61%", y: "45%" },
  { x: "83%", y: "20%" },
] as const;

type SignalState = {
  x: number;
  y: number;
  length: number;
  speed: number;
  brightness: number;
  dormantUntil: number;
  initialized: boolean;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const random = (min: number, max: number) => min + Math.random() * (max - min);

export function GenesisSystemScale() {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const signalRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [entered, setEntered] = useState(false);
  const reduceMotion = useReducedMotion();

  const { curvePath, maskPath } = useMemo(() => {
    const points = Array.from({ length: 121 }, (_, index) => {
      const t = index / 120;
      return [
        (VIEWBOX.width * t).toFixed(1),
        (VIEWBOX.floor - VIEWBOX.floor * Math.pow(t, 2.15)).toFixed(1),
      ];
    });
    const path = `M${points.map(([x, y]) => `${x} ${y}`).join(" L ")}`;

    return {
      curvePath: path,
      maskPath: `M0 0 L${VIEWBOX.width} 0 L${[...points]
        .reverse()
        .map(([x, y]) => `${x} ${y}`)
        .join(" L ")} Z`,
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (reduceMotion) return;

    let played = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || played) return;
        played = true;
        setEntered(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    const visual = visualRef.current;
    if (!visual || reduceMotion || !entered) return;

    const signals = signalRefs.current.filter(
      (signal): signal is HTMLSpanElement => signal !== null,
    );
    const state: SignalState[] = signals.map(() => ({
      x: 0,
      y: 0,
      length: 180,
      speed: 1,
      brightness: 0.5,
      dormantUntil: 0,
      initialized: false,
    }));
    let bounds = { width: 0, height: 0 };
    let active = false;
    let raf = 0;
    let lastTime = performance.now();

    const resetSignal = (signal: SignalState, now: number, initial = false) => {
      const spacing = 12;
      const columns = Math.max(1, Math.floor(bounds.width / spacing));
      const centerOffset = ((bounds.width / 2) % spacing + spacing) % spacing;
      signal.x = centerOffset + spacing * Math.floor(random(0, columns));
      signal.length = random(90, 220);
      signal.speed = random(0.55, 0.9);
      signal.brightness = random(0.28, 0.58);
      signal.y = initial
        ? random(-signal.length, bounds.height)
        : random(bounds.height, bounds.height + signal.length * 1.5);
      signal.dormantUntil = now + (initial ? 0 : random(900, 2800));
      signal.initialized = true;
    };

    const frame = (now: number) => {
      raf = 0;
      if (!active || !bounds.width || !bounds.height) return;
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      state.forEach((signal, index) => {
        const element = signals[index];
        if (!signal.initialized) resetSignal(signal, now, index === 0);
        if (signal.dormantUntil > now) {
          element.style.opacity = "0";
          return;
        }

        signal.y -= 118 * signal.speed * delta;
        if (signal.y + signal.length < 0) {
          resetSignal(signal, now);
          element.style.opacity = "0";
          return;
        }

        const fromBottom = clamp01((bounds.height - signal.y) / signal.length);
        const nearTop = clamp01((signal.y + signal.length) / 130);
        const opacity = signal.brightness * fromBottom * nearTop;
        element.style.transform = `translate3d(${signal.x - 0.5}px, ${signal.y}px, 0) scaleY(${signal.length / 220})`;
        element.style.opacity = opacity.toFixed(3);
      });

      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || !active) return;
      lastTime = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const resizeObserver = new ResizeObserver(([entry]) => {
      bounds = { width: entry.contentRect.width, height: entry.contentRect.height };
      if (active) start();
    });
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        active = Boolean(entry?.isIntersecting);
        if (active) start();
        if (!active && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "200px" },
    );

    resizeObserver.observe(visual);
    visibilityObserver.observe(visual);
    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, [entered, reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      data-entered={entered ? "true" : "false"}
    >
      <div className={styles.shell}>
        <div ref={visualRef} className={styles.visual} aria-hidden="true">
          <div className={styles.grid} />
          <div className={styles.signals}>
            {Array.from({ length: 11 }, (_, index) => (
              <span
                key={index}
                ref={(element) => {
                  signalRefs.current[index] = element;
                }}
                className={styles.signal}
              />
            ))}
          </div>
          <div className={styles.bloom} />
          <svg className={styles.curve} viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`} preserveAspectRatio="none">
            <path className={styles.curveMask} d={maskPath} />
            <path className={styles.curveBase} d={curvePath} />
            <path className={styles.curveAccent} d={curvePath} />
          </svg>
          <div className={styles.checkpoints}>
            {checkpoints.map((point, index) => (
              <span
                key={systemLayers[index].number}
                className={styles.dot}
                style={{ "--x": point.x, "--y": point.y, "--delay": `${540 + index * 220}ms` } as CSSProperties}
              />
            ))}
          </div>
        </div>

        <header className={styles.heading}>
          <p className={styles.eyebrow}>The Genesis System</p>
          <h2>One managed foundation behind every part of your operation.</h2>
        </header>

        <div className={styles.layers}>
          {systemLayers.map((layer, index) => (
            <article
              key={layer.number}
              className={styles.layer}
              style={{
                "--x": checkpoints[index].x,
                "--y": checkpoints[index].y,
                "--delay": `${280 + index * 180}ms`,
              } as CSSProperties}
            >
              <p className={styles.number}>{layer.number}</p>
              <h3>{layer.title}</h3>
              <p>{layer.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
