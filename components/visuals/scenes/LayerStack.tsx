import {
  CloudArrowUp,
  Database,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react/ssr";
import { Link, Node, Rings, Scene, palette, type Tone } from "../kit";

/**
 * The Genesis System: four frosted floors on one lit spine.
 *
 * A tall, narrow column rather than the usual landscape hub, so the frame is
 * 460x560 and every coordinate is derived from the centre line. The plates are
 * built with CorePlate's transform trick — an upright rounded square put into
 * 2:1 isometric by `scale(1 .55) rotate(45)` — but filled as glass, because the
 * subject here is the thread running through them, not any one floor.
 */

const VB_W = 460;
const VB_H = 560;
const CX = VB_W / 2; // 230
const CY = VB_H / 2; // 280

const SQUASH = 0.55;
const PLATE_W = 190;
const SIDE = PLATE_W / Math.SQRT2;
const HALF = SIDE / 2;
const CORNER = SIDE * 0.16;

/** Half-width of the finished face, with the corner rounding taken off the
 *  diagonal — a rounded corner pulls in by r(sqrt2 - 1) along it. */
const REACH = HALF * Math.SQRT2 - CORNER * (Math.SQRT2 - 1); // 86.09
/** The same distance vertically, once the isometric squash is applied. */
const VERTEX = REACH * SQUASH; // 47.35

const SPACING = 120; // leaves a ~15u gap between one plate and the next
const EXTRUDE = 10;
const OVERHANG = 26; // how far the spine runs past the outermost plate
const ICON = 42;

const TOP_Y = CY - 1.5 * SPACING; // 100
const BOTTOM_Y = CY + 1.5 * SPACING; // 460
const LINE_TOP = TOP_Y - VERTEX - OVERHANG;
const LINE_BOTTOM = BOTTOM_Y + VERTEX + OVERHANG;

/** Painted far-to-near, so 04 is the top floor and 01 the foundation. */
const LAYERS = [
  { id: "04", Icon: ShieldCheck },
  { id: "03", Icon: Database },
  { id: "02", Icon: Sparkle },
  { id: "01", Icon: CloudArrowUp },
];

const GAP_GLOW = Array.from({ length: 7 }, (_, index) => 1 - index * 0.13);

export function LayerStack({
  tone = "dark",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const p = palette(tone);

  return (
    <Scene viewBox={`0 0 ${VB_W} ${VB_H}`} className={className}>
      <Rings cx={CX} cy={CY} radii={[96, 146, 196]} tone={tone} />

      {/* Light spilling out of each gap in the stack. Stacked ellipses, the
          same trick CorePlate uses, so nothing here needs a gradient def. */}
      {[0, 1, 2].map((gap) => {
        const y = CY + (gap - 1) * SPACING;
        return (
          <g key={`gap-${gap}`}>
            {GAP_GLOW.map((scale) => (
              <ellipse
                key={scale}
                cx={CX}
                cy={y}
                rx={56 * scale}
                ry={26 * scale}
                fill={`rgb(${p.glow} / 0.03)`}
              />
            ))}
          </g>
        );
      })}

      {/* The spine. Drawn before the plates so it reads as threading behind
          them and re-emerging in each gap. */}
      <Link d={`M${CX} ${LINE_TOP}L${CX} ${LINE_BOTTOM}`} tone={tone} />

      {LAYERS.map(({ id, Icon }, index) => {
        const y = CY + (index - 1.5) * SPACING;

        return (
          <g key={id} data-layer={id}>
            {/* Extruded side: the same face, dropped and dimmed. */}
            <g transform={`translate(${CX} ${y + EXTRUDE}) scale(1 ${SQUASH}) rotate(45)`}>
              <rect
                x={-HALF}
                y={-HALF}
                width={SIDE}
                height={SIDE}
                rx={CORNER}
                fill={p.ground}
              />
              <g opacity={0.45}>
                <rect
                  x={-HALF}
                  y={-HALF}
                  width={SIDE}
                  height={SIDE}
                  rx={CORNER}
                  fill={p.cardFill}
                  stroke={p.cardStroke}
                  strokeWidth={1}
                />
              </g>
            </g>

            <g transform={`translate(${CX} ${y}) scale(1 ${SQUASH}) rotate(45)`}>
              {/* Solid first. Without it the spine shows through the frosted
                  face and reads as running in front of the icon. */}
              <rect
                x={-HALF}
                y={-HALF}
                width={SIDE}
                height={SIDE}
                rx={CORNER}
                fill={p.ground}
              />
              <rect
                className="system-plate-edge"
                x={-HALF}
                y={-HALF}
                width={SIDE}
                height={SIDE}
                rx={CORNER}
                fill={p.cardFill}
                stroke={p.cardStroke}
                strokeWidth={1.2}
              />
            </g>

            {/* Upright, never rotated with the face, so it stays readable. */}
            <Icon
              x={CX - ICON / 2}
              y={y - ICON / 2 - PLATE_W * 0.012}
              width={ICON}
              height={ICON}
              color={p.cardIcon}
              weight="light"
            />

            {/* Where the spine enters this floor. */}
            <g className="system-plate-core" opacity={0.62}>
              <Node cx={CX} cy={y - VERTEX} tone={tone} r={3.2} />
            </g>
          </g>
        );
      })}

      <Node cx={CX} cy={LINE_TOP} tone={tone} r={3} />
      <Node cx={CX} cy={LINE_BOTTOM} tone={tone} r={3} />
    </Scene>
  );
}
