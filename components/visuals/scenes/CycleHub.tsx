import {
  ArrowsClockwise,
  ChartBar,
  Database,
  Lifebuoy,
  Pulse,
  ShieldCheck,
  Wrench,
} from "@phosphor-icons/react/ssr";
import {
  Arrow,
  CorePlate,
  GlassCard,
  Link,
  Node,
  Rings,
  Scene,
  cardSize,
  orbit,
  type Tone,
} from "../kit";

const CX = 360;
const CY = 270;
const RX = 250;
const RY = 205;
const SQUASH = RY / RX;
const PLATE = 150;
const RING_RADII = [120, 165];

/** How far a bead sits off a card's edge, so its glow never touches the card. */
const CARD_PAD = 9;

/**
 * The six duties of the service, in loop order: degrees clockwise from twelve
 * o'clock, which is also the order the ring hands work from one to the next.
 */
const STATIONS = [
  { deg: 0, icon: Pulse },
  { deg: 60, icon: ArrowsClockwise },
  { deg: 120, icon: ShieldCheck },
  { deg: 180, icon: Database },
  { deg: 240, icon: Wrench },
  { deg: 300, icon: ChartBar },
];

/** A point on the card ring. */
const at = (deg: number) => orbit(CX, CY, RX, deg, SQUASH);

/** True once the ring has left a card's footprint, with room to spare. */
function clearsCard(deg: number, cardDeg: number) {
  const p = at(deg);
  const c = at(cardDeg);
  return (
    Math.abs(p.x - c.x) > cardSize.w / 2 + CARD_PAD ||
    Math.abs(p.y - c.y) > cardSize.h / 2 + CARD_PAD
  );
}

/**
 * The angle at which the ring escapes a card, walking away from its centre.
 * Found by stepping rather than solved in closed form: the card is a rectangle
 * on an ellipse, so which edge it exits through changes around the dial.
 */
function escapeAngle(cardDeg: number, dir: 1 | -1) {
  for (let step = 1; step <= 120; step += 1) {
    const deg = cardDeg + dir * step * 0.25;
    if (clearsCard(deg, cardDeg)) return deg;
  }
  return cardDeg + dir * 30;
}

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Six arcs, one per gap, each riding the same ellipse the cards sit on so the
 * broken line still reads as a single ring. Endpoints stop clear of the cards
 * on either side; the chevron rides the tangent at the midpoint.
 */
const ARCS = STATIONS.map((station, index) => {
  const raw = STATIONS[(index + 1) % STATIONS.length].deg;
  const nextDeg = raw > station.deg ? raw : raw + 360;

  const from = escapeAngle(station.deg, 1);
  const to = escapeAngle(nextDeg, -1);
  const start = at(from);
  const end = at(to);

  const midDeg = (from + to) / 2;
  const mid = at(midDeg);
  const rad = (midDeg * Math.PI) / 180;

  return {
    key: station.deg,
    // largeArc 0, sweep 1: the short way round, travelled clockwise.
    d: `M${round(start.x)} ${round(start.y)}A${RX} ${RY} 0 0 1 ${round(end.x)} ${round(end.y)}`,
    start,
    end,
    mid,
    heading:
      (Math.atan2(RY * Math.sin(rad), RX * Math.cos(rad)) * 180) / Math.PI,
  };
});

/**
 * Genesis run as a managed service: the platform lit in the middle while the
 * duties that keep it alive hand off to one another around a closed ring. No
 * spokes — the loop is the point, and it never stops turning.
 */
export function CycleHub({
  tone = "dark",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  return (
    <Scene viewBox="0 0 720 540" className={className}>
      <Rings cx={CX} cy={CY} radii={RING_RADII} tone={tone} />

      {ARCS.map((arc) => (
        <g key={`arc-${arc.key}`}>
          <Link d={arc.d} tone={tone} />
          <Arrow x={arc.mid.x} y={arc.mid.y} angle={arc.heading} tone={tone} />
          <Node cx={arc.start.x} cy={arc.start.y} tone={tone} r={2.6} />
          <Node cx={arc.end.x} cy={arc.end.y} tone={tone} r={2.6} />
        </g>
      ))}

      {STATIONS.map((station) => {
        const centre = at(station.deg);
        return (
          <GlassCard
            key={`card-${station.deg}`}
            x={centre.x - cardSize.w / 2}
            y={centre.y - cardSize.h / 2}
            icon={station.icon}
            tone={tone}
          />
        );
      })}

      <CorePlate cx={CX} cy={CY} width={PLATE} icon={Lifebuoy} tone={tone} />
    </Scene>
  );
}
