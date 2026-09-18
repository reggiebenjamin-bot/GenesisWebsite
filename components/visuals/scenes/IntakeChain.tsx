import type { ComponentType } from "react";
import {
  Bank,
  ChartBar,
  Check,
  CheckSquare,
  FileText,
  Files,
  ShieldCheck,
  UserCircle,
} from "@phosphor-icons/react/ssr";
import {
  GlassCard,
  Link,
  Node,
  Rings,
  Scene,
  cardPort,
  cardSize,
  hCurve,
  palette,
  type Tone,
} from "../kit";

type IconType = ComponentType<Record<string, unknown>>;

/* ---------------------------------------------------------------- geometry */

const AXIS = 270; // the spine every chain item is centred on

/** Four source screens, stacked, all feeding the same file. */
const SOURCE_CX = 105;
const SOURCES: { icon: IconType; cy: number }[] = [
  { icon: FileText, cy: 105 },
  { icon: UserCircle, cy: 215 },
  { icon: ChartBar, cy: 325 },
  { icon: Bank, cy: 435 },
];

/**
 * Where the four become one. The junction bead is larger than the rest, so its
 * run is longer by the same amount: it is the gaps between the glows that the
 * eye reads as rhythm, not the gaps between the centres.
 */
const JUNCTION_X = 260;
const BEAD_R = 2.4;
const JUNCTION_R = 3.4;

/** The chain. One gap between every pair of items, end to end. */
const GAP = 16;
const STEP = 104;
const STEP_TOP = AXIS - STEP / 2;
const STEPS: { icon: IconType; cx: number; lit?: boolean }[] = [
  { icon: Files, cx: 330 },
  { icon: ShieldCheck, cx: 450 },
  { icon: CheckSquare, cx: 570, lit: true },
];

const stepLeft = (cx: number) => cx - STEP / 2;
const stepRight = (cx: number) => cx + STEP / 2;

/** The approval mark, hung off the last card by the same gap. */
const MARK_R = 30;
const MARK_CX = stepRight(STEPS[2].cx) + GAP + MARK_R; // 668
const HALO_R = 39; // 668 + 39 + hairline = 707.5, inside the 12u margin
const CHECK = 36;

/** Straight runs along the spine: junction -> card -> card -> card -> mark. */
const SEGMENTS: [number, number][] = [
  [JUNCTION_X, stepLeft(STEPS[0].cx)],
  [stepRight(STEPS[0].cx), stepLeft(STEPS[1].cx)],
  [stepRight(STEPS[1].cx), stepLeft(STEPS[2].cx)],
  [stepRight(STEPS[2].cx), MARK_CX - MARK_R],
];

/** Every bead on the spine, deduped where two segments meet. */
const BEADS = Array.from(new Set(SEGMENTS.flat()));

/** Orbits sit on the middle of the run, not on any one card. */
const RING_CX = (JUNCTION_X + MARK_CX + MARK_R) / 2; // 480

/* ------------------------------------------------------------------ pieces */

/** A soft gold bloom behind the lit card, stacked flat so the kit needs no defs. */
function SlabGlow({ cx, tone }: { cx: number; tone: Tone }) {
  const p = palette(tone);
  return (
    <g>
      {Array.from({ length: 6 }, (_, i) => 24 - i * 4).map((pad) => (
        <rect
          key={pad}
          x={stepLeft(cx) - pad}
          y={STEP_TOP - pad}
          width={STEP + pad * 2}
          height={STEP + pad * 2}
          rx={14 + pad * 0.7}
          fill={`rgb(${p.glow} / 0.022)`}
        />
      ))}
    </g>
  );
}

/**
 * A stage in the chain: square, no window chrome. The source screens keep the
 * chrome so they read as applications; these read as steps the file passes
 * through.
 */
function StepCard({
  cx,
  icon: Icon,
  tone,
  lit = false,
}: {
  cx: number;
  icon: IconType;
  tone: Tone;
  lit?: boolean;
}) {
  const p = palette(tone);
  const x = stepLeft(cx);
  const iconSize = STEP * 0.34;
  const iconY = STEP_TOP + 20;
  const barW = STEP - 46;
  const barTop = iconY + iconSize + 16;

  return (
    <g>
      <rect
        x={x}
        y={STEP_TOP}
        width={STEP}
        height={STEP}
        rx={14}
        fill={p.cardFill}
        stroke={lit ? p.accent : p.cardStroke}
        strokeWidth={lit ? 1.4 : 1}
      />
      <Icon
        x={cx - iconSize / 2}
        y={iconY}
        width={iconSize}
        height={iconSize}
        color={lit ? p.accent : p.cardIcon}
        weight="light"
      />
      <rect
        x={cx - barW / 2}
        y={barTop}
        width={barW}
        height={3.6}
        rx={1.8}
        fill={lit ? p.accent : p.bar}
      />
      <rect
        x={cx - (barW * 0.52) / 2}
        y={barTop + 9}
        width={barW * 0.52}
        height={3.6}
        rx={1.8}
        fill={lit ? p.accent : p.link}
      />
    </g>
  );
}

/* ------------------------------------------------------------------- scene */

/**
 * Lending principals: four sources of evidence merge into one file, the file
 * walks a short chain of checks, and the chain terminates in an approval.
 * Reads on ink or on ivory; every colour comes from the tone palette.
 */
export function IntakeChain({
  tone = "dark",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const p = palette(tone);

  return (
    <Scene viewBox="0 0 720 540" className={className}>
      <Rings cx={RING_CX} cy={AXIS} radii={[84, 132, 186]} tone={tone} />

      {/* Glows go down before the connectors so nothing gold gets washed out. */}
      <SlabGlow cx={STEPS[2].cx} tone={tone} />
      {Array.from({ length: 9 }, (_, i) => 36 - i * 3).map((r) => (
        <circle
          key={r}
          cx={MARK_CX}
          cy={AXIS}
          r={r}
          fill={`rgb(${p.glow} / 0.034)`}
        />
      ))}

      {/* Four sources fanning into one junction. */}
      {SOURCES.map((source) => {
        const port = cardPort(
          SOURCE_CX - cardSize.w / 2,
          source.cy - cardSize.h / 2,
          "right",
        );
        return (
          <g key={source.cy}>
            <Link
              d={hCurve(port.x, port.y, JUNCTION_X, AXIS)}
              tone={tone}
            />
            <Node cx={port.x} cy={port.y} tone={tone} r={2.8} />
          </g>
        );
      })}

      {/* The spine. */}
      {SEGMENTS.map(([x1, x2]) => (
        <Link key={x1} d={`M${x1} ${AXIS}H${x2}`} tone={tone} />
      ))}
      {BEADS.map((x) => (
        <Node
          key={x}
          cx={x}
          cy={AXIS}
          tone={tone}
          r={x === JUNCTION_X ? JUNCTION_R : BEAD_R}
        />
      ))}

      {/* Cards over the connectors, as in the hub. */}
      {SOURCES.map((source) => (
        <GlassCard
          key={`src-${source.cy}`}
          x={SOURCE_CX - cardSize.w / 2}
          y={source.cy - cardSize.h / 2}
          icon={source.icon as never}
          tone={tone}
        />
      ))}
      {STEPS.map((step) => (
        <StepCard
          key={step.cx}
          cx={step.cx}
          icon={step.icon}
          tone={tone}
          lit={step.lit}
        />
      ))}

      {/* The approval, last and on top. */}
      <circle
        cx={MARK_CX}
        cy={AXIS}
        r={HALO_R}
        stroke={p.linkDim}
        strokeWidth={1}
        strokeDasharray="2 6"
        fill="none"
      />
      <circle
        cx={MARK_CX}
        cy={AXIS}
        r={MARK_R}
        stroke={p.accent}
        strokeWidth={1.6}
        fill="none"
      />
      <Check
        x={MARK_CX - CHECK / 2}
        y={AXIS - CHECK / 2}
        width={CHECK}
        height={CHECK}
        color={p.accent}
        weight="light"
      />
    </Scene>
  );
}
