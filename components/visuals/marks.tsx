import type { ReactNode } from "react";
import { hCurve, palette, type Tone } from "./kit";

/**
 * The small tier.
 *
 * Flat and front-facing, unlike the full scenes. Isometric slabs and 20px
 * icons both stop reading at roughly 120px: the slant eats the silhouette and
 * the glyph turns to grey mush. So these carry the idea in arrangement — how
 * many things there are, which way they move, and which one is lit — with no
 * icons at all.
 *
 * The finish is what makes them look built rather than diagrammed: a halo
 * behind the lit element, faint orbits behind it, a bead where connectors
 * meet, ports where a connector leaves a card, and a reflection under
 * anything standing on a surface. All of it is low-frequency, so it survives
 * being shrunk; none of it adds anything to read.
 *
 * Every container holds something. An empty outline reads as a rendering bug
 * rather than as a placeholder.
 */

const VB = "0 0 168 116";

type P = ReturnType<typeof palette>;

function Mark({
  tone,
  className,
  children,
}: {
  tone: Tone;
  className: string;
  children: (p: P) => ReactNode;
}) {
  const p = palette(tone);
  return (
    // No base width: a `w-full` here competes with the caller's own width
    // class and Tailwind resolves that by source order, not class order, so
    // the caller silently lost. Width belongs to whoever places the mark.
    <svg viewBox={VB} fill="none" aria-hidden="true" className={className}>
      {children(p)}
    </svg>
  );
}

/* ── surfaces ─────────────────────────────────────────────────────────── */

/** A neutral container. Outlined, lightly filled, never empty. */
function Box({
  p,
  x,
  y,
  w,
  h,
  r = 7,
  dashed = false,
}: {
  p: P;
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  dashed?: boolean;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={r}
      fill={p.markFill}
      stroke={p.markStroke}
      strokeWidth={2}
      strokeDasharray={dashed ? "5 4" : undefined}
    />
  );
}

/**
 * The lit one. Solid so it wins at any size, with a highlight across the top
 * third — a flat fill reads as a sticker, and a real gradient would need defs
 * this file deliberately does without.
 */
function Gold({
  p,
  x,
  y,
  w,
  h,
  r = 7,
}: {
  p: P;
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={r}
        fill={p.plate}
        stroke={p.plateEdge}
        strokeWidth={2}
      />
      <rect
        x={x + 1.5}
        y={y + 1.5}
        width={w - 3}
        height={h * 0.42}
        rx={r - 1.5}
        fill="rgb(255 255 255 / 0.16)"
      />
    </g>
  );
}

/** A ghost of an element, stacked behind it. Matches whatever it sits under. */
function Stack({
  p,
  x,
  y,
  w,
  h,
  r = 7,
  gold = true,
}: {
  p: P;
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  gold?: boolean;
}) {
  const fill = gold ? p.plate : p.markFill;
  const stroke = gold ? "none" : p.markStroke;
  return (
    <>
      <rect
        x={x + 9}
        y={y - 7}
        width={w}
        height={h}
        rx={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
        opacity={gold ? 0.34 : 0.5}
      />
      <rect
        x={x + 4.5}
        y={y - 3.5}
        width={w}
        height={h}
        rx={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
        opacity={gold ? 0.6 : 0.75}
      />
    </>
  );
}

/** Content inside a container, so nothing reads as blank. */
function Bar({
  p,
  x,
  y,
  w,
  on = false,
}: {
  p: P;
  x: number;
  y: number;
  w: number;
  on?: boolean;
}) {
  return (
    <rect x={x} y={y} width={w} height={4.5} rx={2.25} fill={on ? p.onGold : p.markBar} />
  );
}

/* ── finish ───────────────────────────────────────────────────────────── */

/**
 * The halo. Stacked circles rather than a gradient, so no defs are needed.
 *
 * Dark only. Light emission makes sense against ink; the same warm wash on an
 * ivory ground just reads as a stain behind the shape, so on light the gold
 * fill is left to carry itself.
 */
function Halo({ p, x, y, r }: { p: P; x: number; y: number; r: number }) {
  if (p.mode === "light") return null;
  return (
    <>
      {[1, 0.82, 0.66, 0.52, 0.4].map((s) => (
        <circle key={s} cx={x} cy={y} r={r * s} fill={`rgb(${p.glow} / 0.055)`} />
      ))}
    </>
  );
}

/** Faint orbits behind the lit element. They run off the frame on purpose. */
function Orbits({ p, x, y, rs }: { p: P; x: number; y: number; rs: number[] }) {
  return (
    <g stroke={p.markStroke} strokeWidth={1} fill="none" opacity={0.3}>
      {rs.map((r, i) => (
        <circle key={r} cx={x} cy={y} r={r} strokeDasharray={i % 2 ? "3 6" : undefined} />
      ))}
    </g>
  );
}

/** The bead where connectors meet. */
function Bead({ p, x, y, r = 4 }: { p: P; x: number; y: number; r?: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={r * 3.2} fill={`rgb(${p.glow} / 0.1)`} />
      <circle cx={x} cy={y} r={r * 1.9} fill={`rgb(${p.glow} / 0.18)`} />
      <circle cx={x} cy={y} r={r} fill={p.plateEdge} />
    </>
  );
}

/** Where a connector leaves a card. */
function Port({ p, x, y }: { p: P; x: number; y: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={6} fill={`rgb(${p.glow} / 0.14)`} />
      <circle cx={x} cy={y} r={2.8} fill={p.accent} />
    </>
  );
}

/**
 * Something standing on a surface has a reflection under it: light spilling on
 * ink, an actual shadow on ivory.
 */
function Reflect({ p, x, y, w }: { p: P; x: number; y: number; w: number }) {
  return (
    <ellipse
      cx={x}
      cy={y}
      rx={w / 2}
      ry={3.2}
      fill={p.mode === "light" ? "rgb(8 9 14 / 0.07)" : `rgb(${p.glow} / 0.16)`}
    />
  );
}

/** A little dust in the light. */
function Sparks({ p, at }: { p: P; at: [number, number, number][] }) {
  return (
    <g fill={p.accent}>
      {at.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} opacity={p.mode === "light" ? 0.34 : 0.55} />
      ))}
    </g>
  );
}

function Line({ p, d, dashed = false }: { p: P; d: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      stroke={p.accent}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeDasharray={dashed ? "4 4" : undefined}
      fill="none"
    />
  );
}

function Tip({ p, x, y, a = 0 }: { p: P; x: number; y: number; a?: number }) {
  return (
    <path
      d="M-8 -6L0 0L-8 6"
      transform={`translate(${x} ${y}) rotate(${a})`}
      stroke={p.accent}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

function Tick({ p, x, y }: { p: P; x: number; y: number }) {
  return (
    <path
      d={`M${x - 11} ${y}l7 8l15 -17`}
      stroke={p.onGold}
      strokeWidth={4.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

/* ── the four agent marks ─────────────────────────────────────────────── */

/** Follow-up: a record that went quiet, woken back up, again and again. */
function FollowUpMark({ className = "" }: { className?: string }) {
  return (
    <Mark tone="dark" className={className}>
      {(p) => (
        <>
          <Orbits p={p} x={40} y={52} rs={[34, 44]} />
          <Orbits p={p} x={128} y={50} rs={[36, 47]} />
          <Halo p={p} x={128} y={50} r={44} />

          <Reflect p={p} x={40} y={80} w={44} />
          <Reflect p={p} x={128} y={80} w={48} />

          <Box p={p} x={17} y={28} w={46} h={44} />
          <Bar p={p} x={28} y={42} w={26} />
          <Bar p={p} x={28} y={53} w={16} />
          {/* The badge that says this one has been sitting. */}
          <circle cx={63} cy={30} r={7.5} fill={p.ground} stroke={p.markStroke} strokeWidth={2} />

          <Line p={p} d="M60 68C84 70 82 50 98 50" />
          <Tip p={p} x={102} y={50} />

          <Gold p={p} x={105} y={27} w={46} h={46} r={9} />
          <Tick p={p} x={128} y={52} />

          <Sparks p={p} at={[[86, 24, 1.8], [160, 68, 2], [74, 92, 1.6]]} />
        </>
      )}
    </Mark>
  );
}

/** Documents: loose things arriving, ending up in one filed place. */
function DocumentsMark({ className = "" }: { className?: string }) {
  const loose = [14, 45, 76];
  const JX = 96;

  return (
    <Mark tone="dark" className={className}>
      {(p) => (
        <>
          <Orbits p={p} x={132} y={58} rs={[40, 52]} />
          <Halo p={p} x={132} y={58} r={48} />

          {loose.map((y) => (
            <g key={y}>
              <Line p={p} d={hCurve(52, y + 13, JX, 58)} />
              <Box p={p} x={6} y={y} w={46} h={26} r={6} />
              <Bar p={p} x={15} y={y + 7} w={26} />
              <Bar p={p} x={15} y={y + 16} w={16} />
              <Port p={p} x={52} y={y + 13} />
            </g>
          ))}

          <Bead p={p} x={JX} y={58} />
          <Line p={p} d={`M${JX} 58H110`} />

          <Stack p={p} x={110} y={24} w={44} h={68} />
          <Gold p={p} x={110} y={24} w={44} h={68} />
          <Bar p={p} x={120} y={40} w={24} on />
          <Bar p={p} x={120} y={52} w={24} on />
          <Bar p={p} x={120} y={64} w={16} on />

          <Sparks p={p} at={[[88, 20, 1.8], [163, 96, 1.8], [80, 100, 1.5]]} />
        </>
      )}
    </Mark>
  );
}

/** Pipeline: stages, and the one at the end that closed. */
function PipelineMark({ className = "" }: { className?: string }) {
  const cols = [
    { x: 10, h: 26 },
    { x: 48, h: 40 },
    { x: 86, h: 58 },
    { x: 124, h: 82 },
  ];
  const BASE = 98;

  return (
    <Mark tone="dark" className={className}>
      {(p) => (
        <>
          <path
            d="M4 88C36 40 92 8 168 4"
            stroke={p.markStroke}
            strokeWidth={1}
            strokeDasharray="3 6"
            opacity={0.3}
            fill="none"
          />
          <Halo p={p} x={141} y={22} r={30} />

          {/* One eased line over the tops rather than a folded polyline. */}
          <Line
            p={p}
            d="M27 72C46 70 46 60 65 58C84 56 84 44 103 40C122 36 122 24 141 16"
          />

          <path
            d={`M6 ${BASE + 1}H162`}
            stroke={p.markStroke}
            strokeWidth={1.4}
            strokeLinecap="round"
            opacity={0.5}
            fill="none"
          />

          {cols.map((c, i) => {
            const last = i === cols.length - 1;
            const top = BASE - c.h;
            return (
              <g key={c.x}>
                <Reflect p={p} x={c.x + 17} y={BASE + 5} w={30} />
                {last ? (
                  <Gold p={p} x={c.x} y={top} w={34} h={c.h} />
                ) : (
                  <Box p={p} x={c.x} y={top} w={34} h={c.h} />
                )}
                <Bar p={p} x={c.x + 8} y={top + 12} w={18} on={last} />
                {last ? (
                  <>
                    <circle cx={c.x + 17} cy={top} r={11} stroke={p.plateEdge} strokeWidth={1.4} fill="none" opacity={0.55} />
                    <Bead p={p} x={c.x + 17} y={top} r={4.4} />
                  </>
                ) : (
                  <Bead p={p} x={c.x + 17} y={top} r={3} />
                )}
              </g>
            );
          })}

          <Sparks p={p} at={[[158, 44, 1.8], [16, 30, 1.5]]} />
        </>
      )}
    </Mark>
  );
}

/** Decision briefs: several sources, one page you can act on. */
function BriefsMark({ className = "" }: { className?: string }) {
  const rows = [14, 46, 78];
  const JX = 100;

  return (
    <Mark tone="dark" className={className}>
      {(p) => (
        <>
          <Orbits p={p} x={134} y={58} rs={[42, 54]} />
          <Halo p={p} x={134} y={58} r={50} />

          {rows.map((y) => (
            <g key={y}>
              <Line p={p} d={hCurve(54, y + 12, JX, 58)} />
              <Box p={p} x={6} y={y} w={48} h={24} r={6} />
              <circle cx={17} cy={y + 12} r={3.6} fill={p.markBar} />
              <Bar p={p} x={26} y={y + 5} w={20} />
              <Bar p={p} x={26} y={y + 14} w={14} />
              <Port p={p} x={54} y={y + 12} />
            </g>
          ))}

          <Bead p={p} x={JX} y={58} r={4.6} />

          <g transform="rotate(-2 134 58)">
            <Gold p={p} x={110} y={14} w={48} h={88} />
            <Bar p={p} x={120} y={28} w={28} on />
            <Bar p={p} x={120} y={40} w={28} on />
            <Bar p={p} x={120} y={52} w={28} on />
            <Bar p={p} x={120} y={64} w={28} on />
            <Bar p={p} x={120} y={76} w={16} on />
          </g>

          <Sparks p={p} at={[[92, 20, 1.8], [96, 98, 1.6]]} />
        </>
      )}
    </Mark>
  );
}

export const agentMarks = {
  "follow-up": FollowUpMark,
  documents: DocumentsMark,
  pipeline: PipelineMark,
  briefs: BriefsMark,
} as const;

/* ── the four audience marks ──────────────────────────────────────────── */

/** Broker-owners: several parts of the business, one system across them. */
function BrokerageMark({ className = "" }: { className?: string }) {
  const xs = [12, 50, 88, 126];

  return (
    <Mark tone="light" className={className}>
      {(p) => (
        <>
          <Halo p={p} x={84} y={24} r={54} />
          <Gold p={p} x={12} y={12} w={144} h={24} r={9} />
          <Bar p={p} x={26} y={22} w={54} on />

          {xs.map((x) => (
            <g key={x}>
              <Line p={p} d={`M${x + 15} 36V62`} />
              <Port p={p} x={x + 15} y={38} />
              <Reflect p={p} x={x + 15} y={105} w={26} />
              <Box p={p} x={x} y={62} w={30} h={40} />
              <Bar p={p} x={x + 7} y={74} w={16} />
              <Bar p={p} x={x + 7} y={84} w={10} />
            </g>
          ))}
        </>
      )}
    </Mark>
  );
}

/** Lending principals: a document-heavy file that reaches an approval. */
function LendingMark({ className = "" }: { className?: string }) {
  return (
    <Mark tone="light" className={className}>
      {(p) => (
        <>
          <Orbits p={p} x={130} y={53} rs={[36, 47]} />
          <Halo p={p} x={130} y={53} r={42} />

          <Stack p={p} x={8} y={20} w={50} h={66} gold={false} />
          <Box p={p} x={8} y={20} w={50} h={66} />
          <Bar p={p} x={18} y={32} w={30} />
          <Bar p={p} x={18} y={45} w={30} />
          <Bar p={p} x={18} y={58} w={20} />

          <Port p={p} x={58} y={53} />
          <Line p={p} d="M62 53H90" />
          <Tip p={p} x={95} y={53} />

          <circle cx={130} cy={53} r={26} fill={p.plate} stroke={p.plateEdge} strokeWidth={2} />
          <path
            d="M108 47a26 26 0 0 1 44 -6"
            fill="rgb(255 255 255 / 0.18)"
            stroke="none"
          />
          <Tick p={p} x={130} y={54} />

          <Sparks p={p} at={[[86, 22, 1.8], [162, 88, 1.6]]} />
        </>
      )}
    </Mark>
  );
}

/** Acquisitions and builders: something going up, course by course. */
function AcquisitionsMark({ className = "" }: { className?: string }) {
  const courses = [
    { y: 70, gold: false },
    { y: 44, gold: false },
    { y: 18, gold: true },
  ];

  return (
    <Mark tone="light" className={className}>
      {(p) => (
        <>
          <Halo p={p} x={84} y={30} r={44} />
          <path
            d="M38 96H130"
            stroke={p.markStroke}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Reflect p={p} x={84} y={99} w={70} />

          {courses.map((c) => (
            <g key={c.y}>
              {c.gold ? (
                <Gold p={p} x={48} y={c.y} w={72} h={24} />
              ) : (
                <Box p={p} x={48} y={c.y} w={72} h={24} />
              )}
              <Bar p={p} x={60} y={c.y + 10} w={30} on={c.gold} />
            </g>
          ))}

          <Line p={p} d="M136 64V38" />
          <Tip p={p} x={136} y={32} a={-90} />
          <Sparks p={p} at={[[28, 34, 1.8], [150, 82, 1.6]]} />
        </>
      )}
    </Mark>
  );
}

/** Solo operators: one of you, then the capacity to run four things at once. */
function SoloMark({ className = "" }: { className?: string }) {
  const grid = [
    { x: 98, y: 22, gold: true },
    { x: 134, y: 22, gold: false },
    { x: 98, y: 60, gold: false },
    { x: 134, y: 60, gold: false },
  ];

  return (
    <Mark tone="light" className={className}>
      {(p) => (
        <>
          <Halo p={p} x={29} y={58} r={38} />
          <Reflect p={p} x={29} y={84} w={40} />

          <Gold p={p} x={8} y={38} w={42} h={40} />
          <Bar p={p} x={18} y={52} w={22} on />

          <Port p={p} x={52} y={58} />
          <Line p={p} d="M56 58H76" />
          <Tip p={p} x={81} y={58} />

          {grid.map((g) => (
            <g key={`${g.x}-${g.y}`}>
              {g.gold ? (
                <Gold p={p} x={g.x} y={g.y} w={30} h={32} r={6} />
              ) : (
                <Box p={p} x={g.x} y={g.y} w={30} h={32} r={6} />
              )}
              <Bar p={p} x={g.x + 7} y={g.y + 13} w={16} on={g.gold} />
            </g>
          ))}

          <Sparks p={p} at={[[88, 16, 1.8], [88, 100, 1.6]]} />
        </>
      )}
    </Mark>
  );
}

export const audienceMarks = [
  BrokerageMark,
  LendingMark,
  AcquisitionsMark,
  SoloMark,
] as const;
