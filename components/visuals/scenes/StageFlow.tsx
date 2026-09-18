import {
  ChartBar,
  Funnel,
  Handshake,
  MagnifyingGlass,
} from "@phosphor-icons/react/ssr";
import { Arrow, Link, Node, Rings, Scene, hCurve, palette, type Tone } from "../kit";

/* ------------------------------------------------------------------ *
 * Geometry. Every number in the drawing is derived from this block so
 * the columns stay on a single rhythm and nothing is hand-placed.
 * ------------------------------------------------------------------ */

const VIEW_W = 720;
const VIEW_H = 540;

const COL_X = [40, 215, 390, 565];
const COL_Y = 120;
const COL_W = 140;
const COL_H = 300;
const COL_R = 16;

const PAD = 14;
const INNER = COL_W - PAD * 2; // 112

/** Header: stage icon, then the two-part progress bar, then a hairline rule. */
const ICON = 24;
const ICON_Y = COL_Y + 20;
const BAR_Y = COL_Y + 56;
const BAR_H = 5;
const BAR_GAP = 4;
const BAR_TRACK = INNER - BAR_GAP; // 108
const RULE_Y = COL_Y + 76;

/** Rows: three chips on a 74 pitch, 14 of padding top and bottom. */
const CHIP_H = 46;
const CHIP_W = INNER;
const CHIP_R = 10;
const CHIP_PITCH = 74;
const CHIP_Y0 = COL_Y + 92; // 212 -> rows at 212 / 286 / 360, last ends at 406

const DOT_R = 7;
const BAR_1_W = 54;
const BAR_2_W = 34;
const ROW_BAR_H = 4;

const RING_CX = VIEW_W / 2;
const RING_CY = VIEW_H / 2;
const RING_RADII = [175, 245, 310];

/**
 * Four stages. `fill` drives the gold half of the progress bar, `lit` is which
 * of the three rows is the live deal — it steps down the board left to right so
 * the eye tracks one record moving forward through the pipeline.
 */
const STAGES = [
  { key: "source", icon: MagnifyingGlass, fill: 0.3, lit: 0 },
  { key: "qualify", icon: Funnel, fill: 0.5, lit: 1 },
  { key: "propose", icon: ChartBar, fill: 0.7, lit: 1 },
  { key: "close", icon: Handshake, fill: 0.9, lit: 2 },
] as const;

const rowY = (row: number) => CHIP_Y0 + row * CHIP_PITCH;
const rowMid = (row: number) => rowY(row) + CHIP_H / 2;

/** Chip edges, so the handoff attaches to a row rather than near one. */
const chipLeft = (col: number) => COL_X[col] + PAD;
const chipRight = (col: number) => COL_X[col] + PAD + CHIP_W;

/** One hop per gap: chip edge to chip edge, with the gap centre for the chevron. */
const HOPS = STAGES.slice(0, -1).map((stage, i) => {
  const next = STAGES[i + 1];
  const x1 = chipRight(i);
  const y1 = rowMid(stage.lit);
  const x2 = chipLeft(i + 1);
  const y2 = rowMid(next.lit);
  return {
    key: `${stage.key}-${next.key}`,
    d: hCurve(x1, y1, x2, y2),
    x1,
    y1,
    x2,
    y2,
    gapCx: (COL_X[i] + COL_W + COL_X[i + 1]) / 2,
    midY: (y1 + y2) / 2,
    // Tangent of hCurve at its midpoint: the derivative there is
    // (3(x2-x1)/4, 3(y2-y1)/2), so a level chevron would be wrong whenever
    // the lit chip changes row between columns.
    midAngle: (Math.atan2(1.5 * (y2 - y1), 0.75 * (x2 - x1)) * 180) / Math.PI,
  };
});

/**
 * Pipeline: four stage columns, each a list of rows, with a single lit record
 * handed forward across every gap. Restrained on purpose — the only saturated
 * thing on the board is the deal that is moving.
 */
export function StageFlow({
  tone = "dark",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const p = palette(tone);

  return (
    <Scene viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className={className}>
      <Rings cx={RING_CX} cy={RING_CY} radii={RING_RADII} tone={tone} />

      {/* Connectors, plus the soft pool of light under each live row. The glass
          is drawn over the top afterwards, so the glow reads as lit from within. */}
      {STAGES.map((stage, i) => {
        const cx = COL_X[i] + COL_W / 2;
        const cy = rowMid(stage.lit);
        return (
          <g key={`glow-${stage.key}`}>
            <ellipse
              cx={cx}
              cy={cy}
              rx={COL_W / 2}
              ry={38}
              fill={`rgb(${p.glow} / 0.035)`}
            />
            <ellipse
              cx={cx}
              cy={cy}
              rx={COL_W / 2 - 22}
              ry={26}
              fill={`rgb(${p.glow} / 0.045)`}
            />
          </g>
        );
      })}

      {HOPS.map((hop) => (
        <g key={`hop-${hop.key}`}>
          <Link d={hop.d} tone={tone} />
          <Arrow
            x={hop.gapCx}
            y={hop.midY}
            angle={hop.midAngle}
            tone={tone}
            size={7}
          />
          <Node cx={hop.x1} cy={hop.y1} tone={tone} r={2.8} />
          <Node cx={hop.x2} cy={hop.y2} tone={tone} r={2.8} />
        </g>
      ))}

      {/* Columns last: panel, header, then the three rows. */}
      {STAGES.map((stage, i) => {
        const x = COL_X[i];
        const Icon = stage.icon;
        const goldW = BAR_TRACK * stage.fill;
        const greyW = BAR_TRACK - goldW;

        return (
          <g key={stage.key}>
            <rect
              x={x}
              y={COL_Y}
              width={COL_W}
              height={COL_H}
              rx={COL_R}
              fill={p.cardFill}
              stroke={p.cardStroke}
              strokeWidth={1}
            />

            <Icon
              x={x + COL_W / 2 - ICON / 2}
              y={ICON_Y}
              width={ICON}
              height={ICON}
              color={p.cardIcon}
              weight="light"
            />

            <rect
              x={x + PAD}
              y={BAR_Y}
              width={goldW}
              height={BAR_H}
              rx={BAR_H / 2}
              fill={p.accent}
            />
            <rect
              x={x + PAD + goldW + BAR_GAP}
              y={BAR_Y}
              width={greyW}
              height={BAR_H}
              rx={BAR_H / 2}
              fill={p.bar}
            />

            <line
              x1={x + PAD}
              y1={RULE_Y}
              x2={x + PAD + INNER}
              y2={RULE_Y}
              stroke={p.cardStroke}
              strokeWidth={1}
            />

            {[0, 1, 2].map((row) => {
              const cy = rowY(row);
              const lit = row === stage.lit;
              const cx = x + PAD;

              return (
                <g key={`${stage.key}-row-${row}`}>
                  <rect
                    x={cx}
                    y={cy}
                    width={CHIP_W}
                    height={CHIP_H}
                    rx={CHIP_R}
                    fill={lit ? p.accent : p.cardFill}
                    fillOpacity={lit ? 0.1 : 1}
                    stroke={lit ? p.accent : p.cardStroke}
                    strokeWidth={lit ? 1.4 : 1}
                  />
                  <circle
                    cx={cx + 20}
                    cy={cy + CHIP_H / 2}
                    r={DOT_R}
                    fill={lit ? p.accent : p.chrome}
                  />
                  <rect
                    x={cx + 36}
                    y={cy + 15}
                    width={BAR_1_W}
                    height={ROW_BAR_H}
                    rx={ROW_BAR_H / 2}
                    fill={lit ? p.accent : p.bar}
                  />
                  <rect
                    x={cx + 36}
                    y={cy + 26}
                    width={BAR_2_W}
                    height={ROW_BAR_H}
                    rx={ROW_BAR_H / 2}
                    fill={lit ? p.accent : p.bar}
                    fillOpacity={lit ? 0.55 : 1}
                  />
                </g>
              );
            })}
          </g>
        );
      })}
    </Scene>
  );
}
