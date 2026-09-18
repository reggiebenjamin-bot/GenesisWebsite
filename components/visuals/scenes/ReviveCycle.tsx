import {
  ArrowsClockwise,
  BellRinging,
  CheckCircle,
  Clock,
  Pause,
  UserCircle,
} from "@phosphor-icons/react/ssr";
import {
  Arrow,
  CorePlate,
  Link,
  Node,
  Rings,
  Scene,
  hCurve,
  orbit,
  palette,
  type Tone,
} from "../kit";

/* --------------------------------------------------------------------------
 * Geometry
 *
 * The whole scene is one clockwise loop around the plate: dormant contacts on
 * the left go quiet into the bell, the bell wakes them, they come out lit on
 * the right, and the two bows carry the cycle over the top (the wait) and back
 * under the bottom (the repeat).
 * ----------------------------------------------------------------------- */

const CX = 360;
const CY = 270;
const PLATE = 150;

const CARD_W = 150;
const CARD_H = 78;

const DORMANT = [
  { cx: 135, cy: 190 },
  { cx: 120, cy: 285 },
  { cx: 140, cy: 385 },
];

const REVIVED = [
  { cx: 585, cy: 190 },
  { cx: 600, cy: 285 },
  { cx: 580, cy: 385 },
];

/** Where the three dim feeds meet before the plate takes them. */
const CONVERGE = { x: 252, y: CY };
/** Tip of the chevron that enters the plate's left rim (rim sits at ~292). */
const PLATE_IN = { x: 283, y: CY };

/** The right-hand fan leaves the plate rim, not its middle. */
const FAN_R = PLATE * 0.55;
const FAN_SQUASH = 0.55;
const FAN_DEG = [70, 90, 110];

const RING_RADII = [92, 126, 162];

/* Bows -------------------------------------------------------------------- */

const BOW_X1 = 258;
const BOW_X2 = 462;
const BOW_TOP_Y = 175;
const BOW_BOTTOM_Y = 365;
const BOW_DEPTH = 105;
const BOW_REACH = 72;
/** Fraction of each bow drawn from either end, leaving a gap at the apex. */
const BOW_TRIM = 0.33;
const BADGE_R = 26;

type Pt = { x: number; y: number };
type Cubic = [Pt, Pt, Pt, Pt];

const mix = (a: Pt, b: Pt, t: number): Pt => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

const round = (n: number) => Math.round(n * 100) / 100;

/** De Casteljau: the leading `t` fraction of a cubic, as a path. */
function cubicHead([p0, p1, p2, p3]: Cubic, t: number) {
  const a = mix(p0, p1, t);
  const b = mix(p1, p2, t);
  const c = mix(p2, p3, t);
  const d = mix(a, b, t);
  const e = mix(b, c, t);
  const f = mix(d, e, t);
  return `M${round(p0.x)} ${round(p0.y)}C${round(a.x)} ${round(a.y)} ${round(
    d.x,
  )} ${round(d.y)} ${round(f.x)} ${round(f.y)}`;
}

const angleOf = (from: Pt, to: Pt) =>
  round((Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI);

/**
 * A symmetric bow from (x1,y) to (x2,y), bulging `depth` (signed) away from
 * that line. Returned as two trimmed halves so a badge can sit in the gap at
 * the apex without the stroke running underneath it.
 */
function bow(x1: number, y: number, x2: number, depth: number) {
  const dir = Math.sign(x2 - x1);
  const ctrlY = y + depth;
  const curve: Cubic = [
    { x: x1, y },
    { x: x1 + BOW_REACH * dir, y: ctrlY },
    { x: x2 - BOW_REACH * dir, y: ctrlY },
    { x: x2, y },
  ];
  const reversed: Cubic = [curve[3], curve[2], curve[1], curve[0]];

  return {
    // Apex of a symmetric cubic sits at three quarters of the control offset.
    apex: { x: (x1 + x2) / 2, y: y + depth * 0.75 },
    from: cubicHead(curve, BOW_TRIM),
    to: cubicHead(reversed, BOW_TRIM),
    start: curve[0],
    end: curve[3],
    endAngle: angleOf(curve[2], curve[3]),
  };
}

const WAIT = bow(BOW_X1, BOW_TOP_Y, BOW_X2, -BOW_DEPTH);
const REPEAT = bow(BOW_X2, BOW_BOTTOM_Y, BOW_X1, BOW_DEPTH);

/* --------------------------------------------------------------------------
 * Pieces
 * ----------------------------------------------------------------------- */

/**
 * A contact row. Same shape either way: an avatar slot, two content bars, and
 * a status badge. Dormant rows are held back to 55% and badged Pause; revived
 * rows come up to full with a gold check and a longer gold bar.
 */
function ContactCard({
  cx,
  cy,
  tone,
  awake = false,
}: {
  cx: number;
  cy: number;
  tone: Tone;
  awake?: boolean;
}) {
  const p = palette(tone);
  const x = cx - CARD_W / 2;
  const y = cy - CARD_H / 2;
  const badge = { x: x + CARD_W - 24, y: y + 20 };

  return (
    <g opacity={awake ? 1 : 0.55}>
      <rect
        x={x}
        y={y}
        width={CARD_W}
        height={CARD_H}
        rx={14}
        fill={p.cardFill}
        stroke={p.cardStroke}
        strokeWidth={1}
      />

      <g fill={p.chrome}>
        <circle cx={x + 15} cy={y + 14} r={2.5} />
        <circle cx={x + 23} cy={y + 14} r={2.5} />
        <circle cx={x + 31} cy={y + 14} r={2.5} fill={awake ? p.accent : p.chrome} />
      </g>

      {/* Avatar slot: a frame circle with the person glyph seated inside it. */}
      <circle
        cx={x + 35}
        cy={y + 47}
        r={18}
        fill={p.cardFill}
        stroke={p.cardStroke}
        strokeWidth={1}
      />
      <UserCircle
        x={x + 22}
        y={y + 34}
        width={26}
        height={26}
        color={p.cardIcon}
        weight="light"
      />

      <rect x={x + 64} y={y + 39} width={66} height={4} rx={2} fill={p.bar} />
      <rect
        x={x + 64}
        y={y + 51}
        width={awake ? 58 : 32}
        height={4}
        rx={2}
        fill={awake ? p.accent : p.link}
      />

      {awake ? (
        <CheckCircle
          x={badge.x - 14}
          y={badge.y - 14}
          width={28}
          height={28}
          color={p.accent}
          weight="light"
        />
      ) : (
        <g>
          <circle
            cx={badge.x}
            cy={badge.y}
            r={11.5}
            fill={p.cardFill}
            stroke={p.cardStroke}
            strokeWidth={1}
          />
          <Pause
            x={badge.x - 6.5}
            y={badge.y - 6.5}
            width={13}
            height={13}
            color={p.cardIcon}
            weight="light"
          />
        </g>
      )}
    </g>
  );
}

/** The disc that rides at the apex of a bow, in the gap left by the trim. */
function BowBadge({
  at,
  icon: Icon,
  tone,
}: {
  at: Pt;
  icon: typeof Clock;
  tone: Tone;
}) {
  const p = palette(tone);
  return (
    <g>
      <circle
        cx={at.x}
        cy={at.y}
        r={BADGE_R}
        fill={p.cardFill}
        stroke={p.link}
        strokeWidth={1.2}
      />
      <Icon
        x={at.x - 12}
        y={at.y - 12}
        width={24}
        height={24}
        color={p.accent}
        weight="light"
      />
    </g>
  );
}

/* --------------------------------------------------------------------------
 * Scene
 * ----------------------------------------------------------------------- */

/**
 * Follow-up: the system re-engaging what has gone quiet. Three dormant
 * contacts feed the bell, three come back out live, and the pair of bows
 * closes the loop — wait at the top, repeat at the bottom.
 */
export function ReviveCycle({
  tone = "dark",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const fan = FAN_DEG.map((d) => orbit(CX, CY, FAN_R, d, FAN_SQUASH));

  return (
    <Scene viewBox="0 0 720 540" className={className}>
      <Rings cx={CX} cy={CY} radii={RING_RADII} tone={tone} />

      {/* The cycle: over the top, then back under the bottom. */}
      <Link d={WAIT.from} tone={tone} />
      <Link d={WAIT.to} tone={tone} />
      <Node cx={WAIT.start.x} cy={WAIT.start.y} tone={tone} r={2.8} />
      <Arrow x={WAIT.end.x} y={WAIT.end.y} angle={WAIT.endAngle} tone={tone} />
      <BowBadge at={WAIT.apex} icon={Clock} tone={tone} />

      <Link d={REPEAT.from} tone={tone} />
      <Link d={REPEAT.to} tone={tone} />
      <Node cx={REPEAT.start.x} cy={REPEAT.start.y} tone={tone} r={2.8} />
      <Arrow
        x={REPEAT.end.x}
        y={REPEAT.end.y}
        angle={REPEAT.endAngle}
        tone={tone}
      />
      <BowBadge at={REPEAT.apex} icon={ArrowsClockwise} tone={tone} />

      {/* Gone-quiet feeds: dashed and dim, gathering to one point. */}
      {DORMANT.map((card) => (
        <Link
          key={`feed-${card.cy}`}
          d={hCurve(
            card.cx + CARD_W / 2,
            card.cy,
            CONVERGE.x,
            CONVERGE.y,
          )}
          tone={tone}
          dashed
          dim
        />
      ))}
      <Node cx={CONVERGE.x} cy={CONVERGE.y} tone={tone} r={3} />
      <Link
        d={`M${CONVERGE.x} ${CONVERGE.y}H${PLATE_IN.x - 8}`}
        tone={tone}
      />
      <Arrow x={PLATE_IN.x} y={PLATE_IN.y} angle={0} tone={tone} />

      {/* Re-activated fan: solid, beaded at both ends. */}
      {REVIVED.map((card, index) => {
        const anchor = fan[index];
        const port = { x: card.cx - CARD_W / 2, y: card.cy };
        return (
          <g key={`revive-${card.cy}`}>
            <Link
              d={hCurve(anchor.x, anchor.y, port.x, port.y)}
              tone={tone}
            />
            <Node cx={anchor.x} cy={anchor.y} tone={tone} r={2.8} />
            <Node cx={port.x} cy={port.y} tone={tone} r={2.8} />
          </g>
        );
      })}

      {DORMANT.map((card) => (
        <ContactCard
          key={`dormant-${card.cy}`}
          cx={card.cx}
          cy={card.cy}
          tone={tone}
        />
      ))}
      {REVIVED.map((card) => (
        <ContactCard
          key={`awake-${card.cy}`}
          cx={card.cx}
          cy={card.cy}
          tone={tone}
          awake
        />
      ))}

      <CorePlate
        cx={CX}
        cy={CY}
        width={PLATE}
        icon={BellRinging as never}
        tone={tone}
      />
    </Scene>
  );
}
