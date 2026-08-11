"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useId,
  useLayoutEffect,
  useState,
  type RefObject,
} from "react";

type BeamGeometry = {
  width: number;
  height: number;
  path: string;
};

export type AnimatedBeamProps = {
  className?: string;
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  repeat?: number;
  repeatDelay?: number;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  animated?: boolean;
};

const emptyGeometry: BeamGeometry = { width: 1, height: 1, path: "" };

export function AnimatedBeam({
  className = "",
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 5,
  delay = 0,
  repeat = Infinity,
  repeatDelay = 0,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#ffaa40",
  gradientStopColor = "#9c40ff",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  animated = true,
}: AnimatedBeamProps) {
  const [geometry, setGeometry] = useState<BeamGeometry>(emptyGeometry);
  const reduceMotion = useReducedMotion();
  const gradientId = useId().replaceAll(":", "");

  const measure = useCallback(() => {
    const container = containerRef.current;
    const from = fromRef.current;
    const to = toRef.current;
    if (!container || !from || !to) return;

    const containerRect = container.getBoundingClientRect();
    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    const scaleX = containerRect.width / container.offsetWidth || 1;
    const scaleY = containerRect.height / container.offsetHeight || 1;

    const fromCenterX =
      (fromRect.left + fromRect.width / 2 - containerRect.left) / scaleX;
    const fromCenterY =
      (fromRect.top + fromRect.height / 2 - containerRect.top) / scaleY;
    const toCenterX =
      (toRect.left + toRect.width / 2 - containerRect.left) / scaleX;
    const toCenterY =
      (toRect.top + toRect.height / 2 - containerRect.top) / scaleY;

    const centerDeltaX = toCenterX - fromCenterX;
    const centerDeltaY = toCenterY - fromCenterY;
    const centerDistance = Math.hypot(centerDeltaX, centerDeltaY) || 1;
    const directionX = centerDeltaX / centerDistance;
    const directionY = centerDeltaY / centerDistance;
    const fromRadius = Math.min(from.offsetWidth, from.offsetHeight) / 2;
    const toRadius = Math.min(to.offsetWidth, to.offsetHeight) / 2;

    const startX = fromCenterX + directionX * fromRadius + startXOffset;
    const startY = fromCenterY + directionY * fromRadius + startYOffset;
    const endX = toCenterX - directionX * toRadius + endXOffset;
    const endY = toCenterY - directionY * toRadius + endYOffset;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const horizontal = Math.abs(deltaX) >= Math.abs(deltaY);
    const path = horizontal
      ? `M ${startX} ${startY} C ${startX + deltaX * 0.44} ${startY - curvature}, ${endX - deltaX * 0.44} ${endY - curvature}, ${endX} ${endY}`
      : `M ${startX} ${startY} C ${startX + curvature} ${startY + deltaY * 0.44}, ${endX + curvature} ${endY - deltaY * 0.44}, ${endX} ${endY}`;

    const next = {
      width: container.offsetWidth,
      height: container.offsetHeight,
      path,
    };

    setGeometry((current) =>
      current.width === next.width &&
      current.height === next.height &&
      current.path === next.path
        ? current
        : next,
    );
  }, [
    containerRef,
    curvature,
    endXOffset,
    endYOffset,
    fromRef,
    startXOffset,
    startYOffset,
    toRef,
  ]);

  useLayoutEffect(() => {
    let observer: ResizeObserver | null = null;

    const connect = () => {
      measure();
      if (observer) return;

      const container = containerRef.current;
      const from = fromRef.current;
      const to = toRef.current;
      if (!container || !from || !to) return;

      observer = new ResizeObserver(measure);
      observer.observe(container);
      observer.observe(from);
      observer.observe(to);
    };

    connect();
    const frame = window.requestAnimationFrame(connect);
    const settleTimer = window.setTimeout(connect, 180);
    window.addEventListener("resize", measure);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef, fromRef, measure, toRef]);

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 size-full overflow-visible ${className}`}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="38%" stopColor={gradientStartColor} />
          <stop offset="62%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d={geometry.path}
        fill="none"
        stroke={pathColor}
        strokeOpacity={pathOpacity}
        strokeWidth={pathWidth}
        vectorEffect="non-scaling-stroke"
      />

      {!reduceMotion && animated && geometry.path ? (
        <motion.path
          d={geometry.path}
          fill="none"
          initial={{ pathLength: 0.18, pathOffset: reverse ? 1 : 0 }}
          animate={{ pathOffset: reverse ? [1, 0] : [0, 1] }}
          pathLength={0.18}
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeWidth={pathWidth + 0.7}
          transition={{
            delay,
            duration,
            ease: "linear",
            repeat,
            repeatDelay,
          }}
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
    </svg>
  );
}
