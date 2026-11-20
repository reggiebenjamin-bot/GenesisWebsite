import type { ComponentType, ReactNode } from "react";
import {
  Browser,
  CalendarBlank,
  ChatCircleText,
  Church,
  Coffee,
  DeviceMobile,
  HandsPraying,
  HandWaving,
  IdentificationCard,
  NotePencil,
  Palette,
  ShieldCheck,
  Signpost,
  Tray,
  UserPlus,
} from "@phosphor-icons/react/ssr";
import { RadialHub } from "@/components/visuals/scenes/RadialHub";
import {
  Arrow,
  CorePlate,
  GlassCard,
  Link,
  Node,
  Rings,
  Scene,
  cardSize,
  hCurve,
  palette,
} from "@/components/visuals/kit";
import styles from "./MinistryPosters.module.css";

/*
 * Stand-in posters for the Ministry films, drawn from the site's diagram kit.
 * Each one sits in a film frame until the real poster image and film are in
 * public/video/ministry/, so the page never shows a broken or empty player.
 * They are server components: plain SVG, no script.
 */

type IconType = ComponentType<Record<string, unknown>>;

const p = palette("dark");

/** The poster's frame: a quiet window bar with a label, and the drawing under it. */
function Poster({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.poster}>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.dots}>
          <span />
          <span />
          <span />
        </span>
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.stage}>{children}</div>
    </div>
  );
}

/**
 * Everything a church gets, around Genesis: the hero film's stand-in. Six
 * surfaces, with twelve and six o'clock left open so the frame's own button
 * never sits on a card.
 */
export function DemoPoster() {
  return (
    <Poster label="Genesis Ministry / Guided film">
      <RadialHub
        className={styles.hub}
        coreIcon={Church}
        spokes={[
          { icon: ChatCircleText, deg: 30, lit: true },
          { icon: UserPlus, deg: 90 },
          { icon: Tray, deg: 150 },
          { icon: DeviceMobile, deg: 210 },
          { icon: Palette, deg: 270 },
          { icon: Browser, deg: 330 },
        ]}
      />
    </Poster>
  );
}

/* ── front office: the guest pipeline ───────────────────────────────── */

const PIPE_Y = 128;
const PIPE_GAP = 64;
const PIPE_X0 = (720 - (4 * cardSize.w + 3 * PIPE_GAP)) / 2;
const PIPE: { icon: IconType; rows: number; lit?: number }[] = [
  { icon: UserPlus, rows: 3 },
  { icon: HandWaving, rows: 2, lit: 0 },
  { icon: Coffee, rows: 2 },
  { icon: Signpost, rows: 1 },
];

/** First visit, welcomed, connected, next step: one guest lit on the way through. */
export function FrontOfficePoster() {
  const midY = PIPE_Y + cardSize.h / 2;
  return (
    <Poster label="Front office / Guest pipeline">
      <Scene viewBox="0 0 720 405" className={styles.scene}>
        <Rings cx={360} cy={190} radii={[150, 210, 270]} />
        {PIPE.slice(0, -1).map((_, i) => {
          const x1 = PIPE_X0 + i * (cardSize.w + PIPE_GAP) + cardSize.w;
          const x2 = x1 + PIPE_GAP;
          return (
            <g key={`hop-${i}`}>
              <Link d={hCurve(x1, midY, x2, midY)} />
              <Arrow x={(x1 + x2) / 2 + 4} y={midY} angle={0} size={6} />
              <Node cx={x1} cy={midY} r={2.6} />
              <Node cx={x2} cy={midY} r={2.6} />
            </g>
          );
        })}
        {PIPE.map((stage, i) => {
          const x = PIPE_X0 + i * (cardSize.w + PIPE_GAP);
          return (
            <g key={`stage-${i}`}>
              <GlassCard x={x} y={PIPE_Y} icon={stage.icon as never} lit={i === 1} />
              {Array.from({ length: stage.rows }, (_, row) => {
                const lit = stage.lit === row;
                const y = PIPE_Y + cardSize.h + 22 + row * 24;
                return (
                  <g key={row}>
                    <rect
                      x={x}
                      y={y}
                      width={cardSize.w}
                      height={16}
                      rx={8}
                      fill={p.cardFill}
                      stroke={lit ? p.accent : p.cardStroke}
                      strokeWidth={lit ? 1.3 : 1}
                    />
                    <circle cx={x + 11} cy={y + 8} r={3.4} fill={lit ? p.accent : p.chrome} />
                    <rect x={x + 21} y={y + 6.3} width={lit ? 56 : 44} height={3.4} rx={1.7} fill={lit ? p.accent : p.bar} />
                  </g>
                );
              })}
            </g>
          );
        })}
      </Scene>
    </Poster>
  );
}

/* ── back office: many kinds of care, one record ────────────────────── */

const PLATE_X = 352;
const PLATE_Y = 176;
const PLATE_W = 136;
const SOURCES: { icon: IconType; y: number }[] = [
  { icon: HandsPraying, y: 40 },
  { icon: ChatCircleText, y: 146 },
  { icon: NotePencil, y: 252 },
];
const OUTPUTS: { icon: IconType; y: number; lit?: boolean }[] = [
  { icon: IdentificationCard, y: 82, lit: true },
  { icon: ShieldCheck, y: 208 },
];

/** Prayer, messages and notes arrive in one care inbox and become one person's page. */
export function BackOfficePoster() {
  const sourceX = 52;
  const outX = 564;
  const rimL = PLATE_X - PLATE_W / 2;
  const rimR = PLATE_X + PLATE_W / 2;
  return (
    <Poster label="Back office / Care inbox">
      <Scene viewBox="0 0 720 405" className={styles.scene}>
        <Rings cx={PLATE_X} cy={PLATE_Y + 10} radii={[120, 170, 228]} />
        {SOURCES.map((source) => {
          const y = source.y + cardSize.h / 2;
          const x = sourceX + cardSize.w;
          return (
            <g key={source.y}>
              <Link d={hCurve(x, y, rimL - 8, PLATE_Y)} />
              <Node cx={x} cy={y} r={2.6} />
            </g>
          );
        })}
        <Node cx={rimL - 8} cy={PLATE_Y} r={3.2} />
        {OUTPUTS.map((out) => {
          const y = out.y + cardSize.h / 2;
          return (
            <g key={out.y}>
              <Link d={hCurve(rimR + 8, PLATE_Y, outX, y)} dim={!out.lit} />
              <Node cx={outX} cy={y} r={2.6} />
            </g>
          );
        })}
        <Node cx={rimR + 8} cy={PLATE_Y} r={3.2} />
        {SOURCES.map((source) => (
          <GlassCard key={`card-${source.y}`} x={sourceX} y={source.y} icon={source.icon as never} />
        ))}
        {OUTPUTS.map((out) => (
          <GlassCard key={`out-${out.y}`} x={outX} y={out.y} icon={out.icon as never} lit={out.lit} />
        ))}
        <CorePlate cx={PLATE_X} cy={PLATE_Y} width={PLATE_W} icon={Tray as never} />
      </Scene>
    </Poster>
  );
}

/* ── member app: the church on a phone ──────────────────────────────── */

const PHONE = { x: 276, y: 26, w: 168, h: 354, r: 28 };
const APP_ROWS: { icon: IconType; lit?: boolean }[] = [
  { icon: CalendarBlank },
  { icon: ChatCircleText },
  { icon: HandsPraying, lit: true },
];

/** A phone with the week ahead, a message and a prayer request heading to the care inbox. */
export function MemberAppPoster() {
  const inner = { x: PHONE.x + 14, w: PHONE.w - 28 };
  const rowY = (i: number) => PHONE.y + 92 + i * 68;
  const litY = rowY(2) + 26;
  const inbox = { x: 540, y: litY - cardSize.h / 2 };
  return (
    <Poster label="Member app / On every phone">
      <Scene viewBox="0 0 720 405" className={styles.scene}>
        <Rings cx={360} cy={203} radii={[150, 205, 262]} />

        <Link d={hCurve(PHONE.x + PHONE.w, litY, inbox.x, litY)} />
        <Node cx={PHONE.x + PHONE.w} cy={litY} r={2.6} />
        <Node cx={inbox.x} cy={litY} r={2.6} />
        <Link d={hCurve(176, 116, PHONE.x, rowY(0) + 26)} dim />
        <Node cx={PHONE.x} cy={rowY(0) + 26} r={2.4} />

        <GlassCard x={72} y={72} icon={CalendarBlank as never} />
        <GlassCard x={inbox.x} y={inbox.y} icon={Tray as never} lit />

        {/* The phone: solid ground so nothing behind it shows through. */}
        <rect x={PHONE.x} y={PHONE.y} width={PHONE.w} height={PHONE.h} rx={PHONE.r} fill={p.ground} />
        <rect
          x={PHONE.x}
          y={PHONE.y}
          width={PHONE.w}
          height={PHONE.h}
          rx={PHONE.r}
          fill={p.cardFill}
          stroke={p.markStroke}
          strokeWidth={1.2}
        />
        <rect x={PHONE.x + PHONE.w / 2 - 22} y={PHONE.y + 12} width={44} height={8} rx={4} fill={p.chrome} />
        <rect x={inner.x} y={PHONE.y + 40} width={70} height={6} rx={3} fill={p.accent} />
        <rect x={inner.x} y={PHONE.y + 56} width={104} height={4} rx={2} fill={p.bar} />

        {APP_ROWS.map((row, i) => {
          const Icon = row.icon;
          const y = rowY(i);
          return (
            <g key={i}>
              <rect
                x={inner.x}
                y={y}
                width={inner.w}
                height={52}
                rx={12}
                fill={p.cardFill}
                stroke={row.lit ? p.accent : p.cardStroke}
                strokeWidth={row.lit ? 1.4 : 1}
              />
              <Icon x={inner.x + 12} y={y + 14} width={24} height={24} color={row.lit ? p.accent : p.cardIcon} weight="light" />
              <rect x={inner.x + 46} y={y + 18} width={row.lit ? 70 : 62} height={4} rx={2} fill={row.lit ? p.accent : p.bar} />
              <rect x={inner.x + 46} y={y + 30} width={44} height={4} rx={2} fill={p.bar} />
            </g>
          );
        })}
        <rect x={PHONE.x + PHONE.w / 2 - 30} y={PHONE.y + PHONE.h - 16} width={60} height={4} rx={2} fill={p.chrome} />
      </Scene>
    </Poster>
  );
}
