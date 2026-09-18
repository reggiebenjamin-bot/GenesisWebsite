import type { ComponentType, ReactNode } from "react";

/**
 * The diagram kit.
 *
 * Every illustration on the site is assembled from four parts: a glass card
 * (an application surface), a core plate (the isometric gold slab that is
 * always Genesis itself), a link (a hairline connector with a lit endpoint),
 * and a ring field (the faint dashed orbits behind the centre).
 *
 * Deliberately free of <defs>: glows are stacked ellipses and plates are flat
 * fills, so a page can hold a dozen of these without gradient ids colliding
 * and every piece stays a server component.
 */

export type Tone = "dark" | "light";

type IconType = ComponentType<{
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  weight?: "thin" | "light" | "regular" | "bold";
}>;

const PALETTE = {
  dark: {
    /* The page behind the drawing. Used to make a shape genuinely solid so
       it can occlude what passes under it; the frosted fill alone is 5% and
       hides nothing. */
    mode: "dark",
    ground: "#08090e",
    /* The small-mark tier. Card strokes are far too faint once a whole idea
       has to fit in ~120px, so marks get their own, heavier neutrals. */
    markStroke: "rgb(244 239 232 / 0.42)",
    markFill: "rgb(244 239 232 / 0.05)",
    markBar: "rgb(244 239 232 / 0.3)",
    onGold: "rgb(16 21 33 / 0.62)",
    cardFill: "rgb(244 239 232 / 0.05)",
    cardStroke: "rgb(244 239 232 / 0.13)",
    cardIcon: "rgb(244 239 232 / 0.9)",
    chrome: "rgb(244 239 232 / 0.3)",
    bar: "rgb(244 239 232 / 0.17)",
    ring: "rgb(244 239 232 / 0.075)",
    link: "rgb(242 216 149 / 0.72)",
    linkDim: "rgb(244 239 232 / 0.2)",
    plate: "#e0b25c",
    plateEdge: "#f6e2ae",
    plateIcon: "#fffaf0",
    glow: "242 216 149",
    accent: "#f2d895",
  },
  light: {
    mode: "light",
    ground: "#faf7f2",
    markStroke: "rgb(8 9 14 / 0.34)",
    markFill: "rgb(8 9 14 / 0.028)",
    markBar: "rgb(8 9 14 / 0.26)",
    onGold: "rgb(30 21 4 / 0.6)",
    cardFill: "rgb(255 255 255 / 0.72)",
    cardStroke: "rgb(8 9 14 / 0.14)",
    cardIcon: "rgb(8 9 14 / 0.62)",
    chrome: "rgb(8 9 14 / 0.22)",
    bar: "rgb(8 9 14 / 0.13)",
    ring: "rgb(8 9 14 / 0.07)",
    link: "rgb(118 84 38 / 0.62)",
    linkDim: "rgb(8 9 14 / 0.16)",
    plate: "#d4a94f",
    plateEdge: "#e8cd8d",
    plateIcon: "#fffaf0",
    glow: "201 165 94",
    accent: "#a9853f",
  },
} as const;

export function palette(tone: Tone) {
  return PALETTE[tone];
}

/** The frame every illustration is drawn inside. */
export function Scene({
  viewBox,
  className = "",
  children,
}: {
  viewBox: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      aria-hidden="true"
      className={`w-full ${className}`}
    >
      {children}
    </svg>
  );
}

/** The faint dashed orbits that sit behind the centre of a hub. */
export function Rings({
  cx,
  cy,
  radii,
  tone = "dark",
}: {
  cx: number;
  cy: number;
  radii: number[];
  tone?: Tone;
}) {
  const p = PALETTE[tone];
  return (
    <g stroke={p.ring} strokeWidth={1} fill="none">
      {radii.map((r, index) => (
        <ellipse
          key={r}
          cx={cx}
          cy={cy}
          rx={r}
          ry={r * 0.82}
          strokeDasharray={index % 2 === 0 ? "3 7" : undefined}
        />
      ))}
    </g>
  );
}

const CARD_W = 104;
const CARD_H = 88;

export const cardSize = { w: CARD_W, h: CARD_H };

/** Edge anchor points, so links attach to a card rather than near it. */
export function cardPort(
  x: number,
  y: number,
  side: "left" | "right" | "top" | "bottom",
) {
  switch (side) {
    case "left":
      return { x, y: y + CARD_H / 2 };
    case "right":
      return { x: x + CARD_W, y: y + CARD_H / 2 };
    case "top":
      return { x: x + CARD_W / 2, y };
    default:
      return { x: x + CARD_W / 2, y: y + CARD_H };
  }
}

/**
 * An application surface: window chrome, one icon, and two content bars. The
 * bars are what make it read as a screen rather than a box.
 */
export function GlassCard({
  x,
  y,
  icon: Icon,
  tone = "dark",
  lit = false,
  w = CARD_W,
  h = CARD_H,
}: {
  x: number;
  y: number;
  icon: IconType;
  tone?: Tone;
  lit?: boolean;
  w?: number;
  h?: number;
}) {
  const p = PALETTE[tone];
  const iconSize = Math.min(w, h) * 0.34;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={14}
        fill={p.cardFill}
        stroke={lit ? p.accent : p.cardStroke}
        strokeWidth={lit ? 1.4 : 1}
      />
      <g fill={p.chrome}>
        <circle cx={x + 15} cy={y + 15} r={2.6} />
        <circle cx={x + 23} cy={y + 15} r={2.6} />
        <circle cx={x + 31} cy={y + 15} r={2.6} fill={lit ? p.accent : p.chrome} />
      </g>
      <Icon
        x={x + w / 2 - iconSize / 2}
        y={y + h * 0.28}
        width={iconSize}
        height={iconSize}
        color={lit ? p.accent : p.cardIcon}
        weight="light"
      />
      <rect x={x + 15} y={y + h - 22} width={w - 46} height={3.4} rx={1.7} fill={p.bar} />
      <rect
        x={x + 15}
        y={y + h - 14}
        width={(w - 46) * 0.52}
        height={3.4}
        rx={1.7}
        fill={lit ? p.accent : p.link}
      />
    </g>
  );
}

/**
 * Genesis itself: a rounded isometric slab, lit, with the layers of the
 * platform stacked under it. The rounded square is drawn upright and put into
 * 2:1 isometric by transform, which keeps the corner radius even on all four
 * sides; the icon rides on top unrotated so it stays readable.
 */
export function CorePlate({
  cx,
  cy,
  width,
  icon: Icon,
  tone = "dark",
  layers = 3,
}: {
  cx: number;
  cy: number;
  width: number;
  icon?: IconType;
  tone?: Tone;
  layers?: number;
}) {
  const p = PALETTE[tone];
  const side = width / Math.SQRT2;
  const half = side / 2;
  const step = width * 0.075;
  const iconSize = width * 0.3;

  const face = (dy: number, opacity: number) => (
    <g
      key={dy}
      transform={`translate(${cx} ${cy + dy}) scale(1 0.55) rotate(45)`}
      opacity={opacity}
    >
      <rect
        x={-half}
        y={-half}
        width={side}
        height={side}
        rx={side * 0.16}
        fill={p.plate}
        stroke={p.plateEdge}
        strokeWidth={1.2}
      />
    </g>
  );

  return (
    <g>
      {/* Glow, built from stacked ellipses so the kit needs no gradient defs.
          Nine thin steps rather than four: fewer bands visibly at the edges. */}
      {Array.from({ length: 9 }, (_, index) => 1.7 - index * 0.17).map((scale) => (
        <ellipse
          key={scale}
          cx={cx}
          cy={cy + step}
          rx={width * scale * 0.6}
          ry={width * scale * 0.33}
          fill={`rgb(${p.glow} / 0.028)`}
        />
      ))}

      {Array.from({ length: layers }, (_, index) => layers - index).map((n) =>
        face(n * step, 0.16 + (layers - n) * 0.12),
      )}
      {face(0, 1)}

      {Icon ? (
        <Icon
          x={cx - iconSize / 2}
          y={cy - iconSize / 2 - width * 0.015}
          width={iconSize}
          height={iconSize}
          color={p.plateIcon}
          weight="light"
        />
      ) : null}
    </g>
  );
}

/**
 * The compact counterpart to GlassCard: one icon in a rounded tile, no window
 * chrome and no content bars. Those details are what make a card read as a
 * screen, and they are exactly what turns to mush once a whole scene has to
 * fit in the corner of a list item, so the small tier drops them.
 */
export function MarkTile({
  x,
  y,
  w,
  h,
  icon: Icon,
  tone = "dark",
  lit = false,
  ghost = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  icon?: IconType;
  tone?: Tone;
  lit?: boolean;
  ghost?: boolean;
}) {
  const p = PALETTE[tone];
  const size = Math.min(w, h) * 0.54;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={Math.min(w, h) * 0.26}
        fill={ghost ? "none" : p.cardFill}
        stroke={lit ? p.accent : ghost ? p.linkDim : p.cardStroke}
        strokeWidth={lit ? 1.6 : 1.2}
        strokeDasharray={ghost ? "3 3" : undefined}
      />
      {Icon ? (
        <Icon
          x={x + w / 2 - size / 2}
          y={y + h / 2 - size / 2}
          width={size}
          height={size}
          color={lit ? p.accent : p.cardIcon}
          weight="light"
        />
      ) : null}
    </g>
  );
}

/** A hairline connector. */
export function Link({
  d,
  tone = "dark",
  dim = false,
  dashed = false,
}: {
  d: string;
  tone?: Tone;
  dim?: boolean;
  dashed?: boolean;
}) {
  const p = PALETTE[tone];
  return (
    <path
      d={d}
      stroke={dim ? p.linkDim : p.link}
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeDasharray={dashed ? "4 5" : undefined}
      fill="none"
    />
  );
}

/** The lit bead where a connector meets something. */
export function Node({
  cx,
  cy,
  tone = "dark",
  r = 3.4,
}: {
  cx: number;
  cy: number;
  tone?: Tone;
  r?: number;
}) {
  const p = PALETTE[tone];
  return (
    <g>
      <circle cx={cx} cy={cy} r={r * 2.4} fill={`rgb(${p.glow} / 0.12)`} />
      <circle cx={cx} cy={cy} r={r} fill={p.accent} />
    </g>
  );
}

/** A chevron pointing along `angle` degrees, for directed flows. */
export function Arrow({
  x,
  y,
  angle,
  tone = "dark",
  size = 7,
}: {
  x: number;
  y: number;
  angle: number;
  tone?: Tone;
  size?: number;
}) {
  const p = PALETTE[tone];
  return (
    <path
      d={`M${-size} ${-size * 0.72}L0 0L${-size} ${size * 0.72}`}
      transform={`translate(${x} ${y}) rotate(${angle})`}
      stroke={p.link}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

/** An S-curve that leaves horizontally and arrives horizontally. */
export function hCurve(x1: number, y1: number, x2: number, y2: number) {
  const mid = (x1 + x2) / 2;
  return `M${x1} ${y1}C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`;
}

/** An S-curve that leaves vertically and arrives vertically. */
export function vCurve(x1: number, y1: number, x2: number, y2: number) {
  const mid = (y1 + y2) / 2;
  return `M${x1} ${y1}C${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`;
}

/** A point on a circle, in degrees clockwise from twelve o'clock. */
export function orbit(cx: number, cy: number, r: number, deg: number, squash = 1) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * squash * Math.sin(rad) };
}
