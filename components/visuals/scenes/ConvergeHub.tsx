import type { ComponentType } from "react";
import {
  Brain,
  ChartBar,
  ChatCircle,
  CheckSquare,
  Database,
  EnvelopeSimple,
  FileText,
  Lightbulb,
} from "@phosphor-icons/react/ssr";
import {
  CorePlate,
  GlassCard,
  Link,
  Node,
  Rings,
  Scene,
  cardPort,
  cardSize,
  hCurve,
  palette,
  vCurve,
  type Tone,
} from "../kit";

type IconType = ComponentType<Record<string, unknown>>;
type Point = { x: number; y: number };

/* ---------------------------------------------------------------- centre */

const CX = 330;
const CY = 270;
const PLATE_W = 150;

/**
 * The plate's silhouette, derived rather than guessed: CorePlate draws a
 * square of side w/√2 rotated 45° and squashed to 0.55, then stacks three
 * layers a step apart. So the lit face is a diamond half PLATE_W wide and
 * 0.55 of that tall, and the whole solid is the hexagon of that diamond
 * unioned with itself pushed down by the stack depth. Beads hang off that
 * hexagon, which is why none of them end up buried under the slab.
 */
const HX = PLATE_W / 2; // 75    half width of the lit face
const HY = HX * 0.55; // 41.25 half height after the isometric squash
const STACK = PLATE_W * 0.075 * 3; // 33.75 depth of the three stacked layers

const RIM_L = { x: CX - HX, y: CY };
const RIM_T = { x: CX, y: CY - HY };
const RIM_R = { x: CX + HX, y: CY };
const RIM_LB = { x: CX - HX, y: CY + STACK };
const RIM_B = { x: CX, y: CY + HY + STACK };

const EDGE = Math.hypot(HX, HY);
const OFF = 7; // how far a bead floats clear of the rim
const OFF_X = (OFF * HY) / EDGE;
const OFF_Y = (OFF * HX) / EDGE;

/** A point along the upper-left rim (0 = left corner, 1 = top corner). */
function rimUpper(t: number): Point {
  return {
    x: RIM_L.x + (RIM_T.x - RIM_L.x) * t - OFF_X,
    y: RIM_L.y + (RIM_T.y - RIM_L.y) * t - OFF_Y,
  };
}

/** A point along the lower-left rim (0 = left corner, 1 = bottom corner). */
function rimLower(t: number): Point {
  return {
    x: RIM_LB.x + (RIM_B.x - RIM_LB.x) * t - OFF_X,
    y: RIM_LB.y + (RIM_B.y - RIM_LB.y) * t + OFF_Y,
  };
}

/* ---------------------------------------------------------------- inputs */

type Input = {
  key: string;
  icon: IconType;
  cx: number;
  cy: number;
  /** Which edge of the card the hairline leaves from. */
  from: "right" | "top" | "bottom";
  anchor: Point;
};

/**
 * Six scattered sources, listed top of the fan to bottom. The positions are
 * staggered on purpose — a tidy column would read as a menu, not as the mess
 * the work actually arrives in — but every pair keeps a clear ~24 unit gap.
 */
const INPUTS: Input[] = [
  { key: "chat", icon: ChatCircle, cx: 292, cy: 68, from: "bottom", anchor: rimUpper(0.82) },
  { key: "docs", icon: FileText, cx: 150, cy: 94, from: "right", anchor: rimUpper(0.5) },
  { key: "data", icon: Database, cx: 96, cy: 206, from: "right", anchor: rimUpper(0.14) },
  {
    key: "chart",
    icon: ChartBar,
    cx: 78,
    cy: 318,
    from: "right",
    anchor: { x: RIM_L.x - OFF, y: CY + STACK / 2 },
  },
  { key: "tasks", icon: CheckSquare, cx: 152, cy: 434, from: "right", anchor: rimLower(0.28) },
  { key: "mail", icon: EnvelopeSimple, cx: 286, cy: 456, from: "top", anchor: rimLower(0.62) },
];

/* ---------------------------------------------------------------- output */

const PANEL = { x: 545, y: 150, w: 155, h: 240 };
const PAD = 18;
const CONTENT_X = PANEL.x + PAD; // 563
const CONTENT_W = PANEL.w - PAD * 2; // 119
const PANEL_MID_X = PANEL.x + PANEL.w / 2;
const PANEL_MID_Y = PANEL.y + PANEL.h / 2; // 270 — level with the plate

const BULB = 34;
const BAR_Y = 248;
const PROGRESS = 0.68;

/** Two settled, one still working — the reason the last bead is not gold. */
const ROWS = [
  { y: 290, w: 99, done: true },
  { y: 324, w: 82, done: true },
  { y: 358, w: 64, done: false },
];

const OUT_FROM = { x: RIM_R.x + OFF, y: CY };
const OUT_TO = { x: PANEL.x, y: PANEL_MID_Y };

/* ------------------------------------------------------------------ scene */

/**
 * Applied AI inside the work: six scattered surfaces feed one slab, and the
 * slab returns a single considered answer. The asymmetry is the argument —
 * many small inputs on the left, one large output on the right.
 */
export function ConvergeHub({
  tone = "dark",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const p = palette(tone);

  return (
    <Scene viewBox="0 0 720 540" className={className}>
      <Rings cx={CX} cy={CY} radii={[110, 150]} tone={tone} />

      {/* Converging hairlines, drawn under everything they touch so each bead
          is half-swallowed by its card exactly the way the radial hub does. */}
      {INPUTS.map((input) => {
        const x = input.cx - cardSize.w / 2;
        const y = input.cy - cardSize.h / 2;
        const port = cardPort(x, y, input.from);
        const d =
          input.from === "right"
            ? hCurve(port.x, port.y, input.anchor.x, input.anchor.y)
            : vCurve(port.x, port.y, input.anchor.x, input.anchor.y);

        return (
          <g key={`link-${input.key}`}>
            <Link d={d} tone={tone} />
            <Node cx={port.x} cy={port.y} tone={tone} r={2.8} />
            <Node cx={input.anchor.x} cy={input.anchor.y} tone={tone} r={2.8} />
          </g>
        );
      })}

      {/* The one outbound line: straight, level, and the longest run on the
          page, so the eye finishes on the right. */}
      <Link d={`M${OUT_FROM.x} ${OUT_FROM.y}L${OUT_TO.x} ${OUT_TO.y}`} tone={tone} />
      <Node cx={OUT_FROM.x} cy={OUT_FROM.y} tone={tone} r={2.8} />
      <Node cx={OUT_TO.x} cy={OUT_TO.y} tone={tone} r={2.8} />

      {INPUTS.map((input) => (
        <GlassCard
          key={`card-${input.key}`}
          x={input.cx - cardSize.w / 2}
          y={input.cy - cardSize.h / 2}
          icon={input.icon as never}
          tone={tone}
        />
      ))}

      {/* The output panel: a glass card's fill, stroke and chrome, scaled up
          to hold a real answer instead of two placeholder bars. */}
      <g>
        <rect
          x={PANEL.x}
          y={PANEL.y}
          width={PANEL.w}
          height={PANEL.h}
          rx={16}
          fill={p.cardFill}
          stroke={p.cardStroke}
          strokeWidth={1}
        />

        <g fill={p.chrome}>
          <circle cx={PANEL.x + 15} cy={PANEL.y + 15} r={2.6} />
          <circle cx={PANEL.x + 23} cy={PANEL.y + 15} r={2.6} />
          <circle cx={PANEL.x + 31} cy={PANEL.y + 15} r={2.6} fill={p.accent} />
        </g>

        <Lightbulb
          x={PANEL_MID_X - BULB / 2}
          y={192}
          width={BULB}
          height={BULB}
          color={p.accent}
          weight="light"
        />

        <rect x={CONTENT_X} y={BAR_Y} width={CONTENT_W} height={6} rx={3} fill={p.bar} />
        <rect
          x={CONTENT_X}
          y={BAR_Y}
          width={CONTENT_W * PROGRESS}
          height={6}
          rx={3}
          fill={p.accent}
        />

        {ROWS.map((row) => (
          <g key={row.y}>
            <circle
              cx={CONTENT_X + 5}
              cy={row.y}
              r={5}
              fill={row.done ? p.accent : p.linkDim}
            />
            <rect
              x={CONTENT_X + 20}
              y={row.y - 2}
              width={row.w}
              height={4}
              rx={2}
              fill={p.bar}
            />
          </g>
        ))}
      </g>

      <CorePlate cx={CX} cy={CY} width={PLATE_W} icon={Brain as never} tone={tone} />
    </Scene>
  );
}
