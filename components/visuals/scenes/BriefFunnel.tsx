import type { ComponentType } from "react";
import {
  ChartBar,
  ChartPieSlice,
  ChatCircle,
  CheckCircle,
  FileText,
  TrendUp,
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

/**
 * Decision briefs: five scattered feeds, one junction, one lit summary.
 *
 * The whole argument of the picture is the junction — every source line is
 * spent before the brief begins, so the reader sees condensation rather than
 * a bundle of wires arriving side by side.
 */

/** Where every source line is spent. Also the vertical centre of the brief. */
const JX = 455;
const JY = 270;

/**
 * Sources fan around the junction and are symmetric about JY, so the bundle
 * reads as a lens rather than a stack. The reach of each is staggered a little
 * so the fan looks composed rather than plotted.
 */
const SOURCES: { key: string; icon: IconType; cx: number; cy: number }[] = [
  { key: "market", icon: ChartBar, cx: 292, cy: 78 },
  { key: "filings", icon: FileText, cx: 163, cy: 160 },
  { key: "share", icon: ChartPieSlice, cx: 121, cy: 270 },
  { key: "trend", icon: TrendUp, cx: 170, cy: 380 },
  { key: "voice", icon: ChatCircle, cx: 296, cy: 462 },
];

/** Centres are the readable unit; corners and ports are derived, never typed. */
const CARDS = SOURCES.map((source) => {
  const x = source.cx - cardSize.w / 2;
  const y = source.cy - cardSize.h / 2;
  return { ...source, x, y, port: cardPort(x, y, "right") };
});

const PANEL = { x: 490, y: 124, w: 200, h: 292 };
const PANEL_CX = PANEL.x + PANEL.w / 2;
const PANEL_CY = PANEL.y + PANEL.h / 2;

const PAD = 22;
const COL = PANEL.x + PAD;
const COL_W = PANEL.w - PAD * 2;

const CHROME_Y = PANEL.y + PAD;
const MARK = 34;
const MARK_Y = PANEL.y + 44;
const TITLE_Y = PANEL.y + 92;

/** The two muted lines under the title: a full measure and a short one. */
const SUBTITLES = [
  { y: PANEL.y + 107, w: COL_W },
  { y: PANEL.y + 119, w: 108 },
];

/** The findings. Widths vary so the rows read as sentences, not as a swatch. */
const CHECK = 13;
const CHECK_GAP = 7;
const ROW_W = COL_W - CHECK - CHECK_GAP;
const FINDINGS = [
  { cy: PANEL.y + 180, w: ROW_W },
  { cy: PANEL.y + 216, w: ROW_W - 20 },
  { cy: PANEL.y + 252, w: ROW_W - 6 },
];

/**
 * Stacked bands, same trick as CorePlate: a glow without a gradient def. More
 * of them than the plate uses, and thinner, because at this size the step
 * between bands would otherwise read as another set of rings.
 */
const GLOW_STEPS = Array.from({ length: 12 }, (_, index) => 1 - index * 0.055);

export function BriefFunnel({
  tone = "dark",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const p = palette(tone);

  return (
    <Scene viewBox="0 0 720 540" className={className}>
      <Rings cx={PANEL_CX} cy={PANEL_CY} radii={[60, 88, 112]} tone={tone} />

      {/* Light behind the brief, laid down before the connectors so the beads
          on top of it stay crisp. */}
      {GLOW_STEPS.map((scale) => (
        <ellipse
          key={scale}
          cx={PANEL_CX}
          cy={PANEL_CY + 6}
          rx={114 * scale}
          ry={168 * scale}
          fill={`rgb(${p.glow} / 0.021)`}
        />
      ))}

      {CARDS.map((card) => (
        <g key={card.key}>
          <Link d={hCurve(card.port.x, card.port.y, JX, JY)} tone={tone} />
          <Node cx={card.port.x} cy={card.port.y} tone={tone} r={2.8} />
        </g>
      ))}

      {/* Junction to brief: the only straight run in the picture. */}
      <Link d={`M${JX} ${JY}H${PANEL.x}`} tone={tone} />
      <Node cx={PANEL.x} cy={JY} tone={tone} r={3} />
      <Node cx={JX} cy={JY} tone={tone} r={5} />

      {CARDS.map((card) => (
        <GlassCard
          key={`card-${card.key}`}
          x={card.x}
          y={card.y}
          icon={card.icon as never}
          tone={tone}
        />
      ))}

      {/* The brief itself, last so it sits on top of everything it condenses. */}
      <g>
        <rect
          x={PANEL.x}
          y={PANEL.y}
          width={PANEL.w}
          height={PANEL.h}
          rx={18}
          fill={p.cardFill}
          stroke={p.accent}
          strokeWidth={1.6}
        />

        <g fill={p.chrome}>
          <circle cx={COL} cy={CHROME_Y} r={2.8} />
          <circle cx={COL + 9} cy={CHROME_Y} r={2.8} />
          <circle cx={COL + 18} cy={CHROME_Y} r={2.8} fill={p.accent} />
        </g>

        <FileText
          x={COL}
          y={MARK_Y}
          width={MARK}
          height={MARK}
          color={p.accent}
          weight="light"
        />

        <rect
          x={COL}
          y={TITLE_Y}
          width={COL_W}
          height={5.5}
          rx={2.75}
          fill={p.accent}
        />
        {SUBTITLES.map((bar) => (
          <rect
            key={bar.y}
            x={COL}
            y={bar.y}
            width={bar.w}
            height={4.5}
            rx={2.25}
            fill={p.bar}
          />
        ))}

        {/* Sits on the entry line, so the connector reads as one continuous
            stroke passing into the document. */}
        <path
          d={`M${COL} ${PANEL_CY}H${COL + COL_W}`}
          stroke={p.cardStroke}
          strokeWidth={1}
        />

        {FINDINGS.map((row) => (
          <g key={row.cy}>
            <CheckCircle
              x={COL}
              y={row.cy - CHECK / 2}
              width={CHECK}
              height={CHECK}
              color={p.accent}
              weight="regular"
            />
            <rect
              x={COL + CHECK + CHECK_GAP}
              y={row.cy - 2.2}
              width={row.w}
              height={4.4}
              rx={2.2}
              fill={p.bar}
            />
          </g>
        ))}
      </g>
    </Scene>
  );
}
