import type { ComponentType } from "react";
import {
  Archive,
  Certificate,
  ChartBar,
  File,
  FilePdf,
  FileText,
  IdentificationCard,
  Image,
  Receipt,
  Table,
} from "@phosphor-icons/react/ssr";
import {
  CorePlate,
  Link,
  Node,
  Rings,
  Scene,
  hCurve,
  palette,
  type Tone,
} from "../kit";

type IconType = ComponentType<{
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  weight?: "thin" | "light" | "regular" | "bold";
}>;

const CX = 360;
const CY = 270;
const PLATE = 150;

/* ------------------------------------------------------------------ *
 * Left: loose inbound documents.
 *
 * Five pages of a page's height will not stack inside 540, so they
 * zigzag between two loose columns. The three that sit level with the
 * core take the far column and the two extremes take the near one —
 * that ordering is what keeps the fan-in clean, because the steep
 * top and bottom runs then start to the RIGHT of everything they
 * would otherwise have had to cut across. Tilt and a wandering x are
 * what make the pile read as unsorted rather than as a second grid.
 * ------------------------------------------------------------------ */

const DOC_W = 76;
const DOC_H = 90;
const DOC_R = 9; // body corner radius
const DOC_FOLD = 20; // size of the turned-down top-right corner

type Doc = {
  icon: IconType;
  x: number;
  y: number;
  /** page tilt in degrees */
  tilt: number;
};

/** Ordered top to bottom; the rim points below are zipped to them in order. */
const DOCS: Doc[] = [
  { icon: Image, x: 172, y: 90, tilt: -7 },
  { icon: Table, x: 70, y: 157, tilt: 5 },
  { icon: FilePdf, x: 64, y: 270, tilt: -3 },
  { icon: IdentificationCard, x: 74, y: 383, tilt: 6 },
  { icon: File, x: 176, y: 450, tilt: -5 },
];

/* ------------------------------------------------------------------ *
 * The slab's own silhouette, so connectors can stop a consistent
 * hairline short of the lit edge instead of on a circle that cuts the
 * diamond at a different distance at every angle.
 * ------------------------------------------------------------------ */

/** Half-width and half-height of the 2:1 isometric diamond. */
const PLATE_HW = PLATE / 2;
const PLATE_HH = (PLATE * 0.55) / 2;
/** The rounded corner pulls each vertex back off the ideal diamond point. */
const PLATE_INSET = (PLATE / Math.SQRT2) * 0.16 * (Math.SQRT2 - 1);
/** How far clear of the lit edge every bead sits. */
const RIM_GAP = 5;
/** CorePlate stacks three shadow layers below the lit face, so the silhouette
    reaches this much further down than the diamond does. Anchors on the lower
    edge have to clear the whole solid, not just the lit top. */
const PLATE_STACK = PLATE * 0.075 * 3;

/**
 * A point just outside one of the two left-hand edges. `t` runs from the
 * left vertex (0) to the top or bottom vertex (1); `dir` picks which.
 */
function leftRim(t: number, dir: 1 | -1) {
  const len = Math.hypot(PLATE_HW, PLATE_HH);
  const base = dir === 1 ? CY + PLATE_STACK : CY;
  return {
    x: CX - PLATE_HW + t * PLATE_HW - (RIM_GAP * PLATE_HH) / len,
    y: base + dir * (t * PLATE_HH + (RIM_GAP * PLATE_HW) / len),
  };
}

const RIMS = [
  leftRim(0.45, -1),
  leftRim(0.2, -1),
  { x: CX - PLATE_HW + PLATE_INSET - RIM_GAP, y: CY },
  leftRim(0.2, 1),
  leftRim(0.45, 1),
];

/** Where the fan-out leaves the slab, mirrored across the same gap. */
const TRUNK_START = { x: CX + PLATE_HW - PLATE_INSET + RIM_GAP, y: CY };

/* ------------------------------------------------------------------ *
 * Right: the destinations. Perfectly aligned, evenly pitched — the
 * visual opposite of the left-hand pile.
 * ------------------------------------------------------------------ */

const FOLDER_X = 548;
const FOLDER_W = 146;
const FOLDER_H = 74;
const FOLDER_R = 10;
const TAB_W = 52;
const TAB_H = 11;
const TAB_R = 5;

/** Where the fan-out leaves the plate halo, and where it splits. */
const TRUNK_X = 462;

const FOLDERS: { icon: IconType; cy: number }[] = [
  { icon: Receipt, cy: 120 },
  { icon: Certificate, cy: 220 },
  { icon: ChartBar, cy: 320 },
  { icon: Archive, cy: 420 },
];

/** A page: rounded rect with the top-right corner turned down. Drawn
 *  around the origin so the whole card can be tilted by transform. */
const DOC_PATH = (() => {
  const hw = DOC_W / 2;
  const hh = DOC_H / 2;
  return [
    `M${-hw + DOC_R} ${-hh}`,
    `L${hw - DOC_FOLD} ${-hh}`,
    `L${hw} ${-hh + DOC_FOLD}`,
    `L${hw} ${hh - DOC_R}`,
    `Q${hw} ${hh} ${hw - DOC_R} ${hh}`,
    `L${-hw + DOC_R} ${hh}`,
    `Q${-hw} ${hh} ${-hw} ${hh - DOC_R}`,
    `L${-hw} ${-hh + DOC_R}`,
    `Q${-hw} ${-hh} ${-hw + DOC_R} ${-hh}`,
    "Z",
  ].join("");
})();

/** The two edges of the turned-down corner. */
const DOC_FOLD_PATH = (() => {
  const hw = DOC_W / 2;
  const hh = DOC_H / 2;
  return `M${hw - DOC_FOLD} ${-hh}L${hw - DOC_FOLD} ${-hh + DOC_FOLD}L${hw} ${-hh + DOC_FOLD}`;
})();

/** The lit run along the top of a folder: tab, shoulder, top edge. */
function folderCrest(cy: number) {
  const L = FOLDER_X;
  const R = FOLDER_X + FOLDER_W;
  const T = cy - FOLDER_H / 2;
  const tabTop = T - TAB_H;
  const tabR = L + TAB_W;
  return [
    `M${L} ${tabTop + TAB_R}`,
    `Q${L} ${tabTop} ${L + TAB_R} ${tabTop}`,
    `L${tabR - TAB_R} ${tabTop}`,
    `Q${tabR} ${tabTop} ${tabR + 7} ${T}`,
    `L${R - FOLDER_R} ${T}`,
    `Q${R} ${T} ${R} ${T + FOLDER_R}`,
  ].join("");
}

/** The closed folder outline, tab included. */
function folderPath(cy: number) {
  const L = FOLDER_X;
  const R = FOLDER_X + FOLDER_W;
  const T = cy - FOLDER_H / 2;
  const B = cy + FOLDER_H / 2;
  const tabTop = T - TAB_H;
  const tabR = L + TAB_W;
  return [
    `M${L} ${tabTop + TAB_R}`,
    `Q${L} ${tabTop} ${L + TAB_R} ${tabTop}`,
    `L${tabR - TAB_R} ${tabTop}`,
    `Q${tabR} ${tabTop} ${tabR + 7} ${T}`,
    `L${R - FOLDER_R} ${T}`,
    `Q${R} ${T} ${R} ${T + FOLDER_R}`,
    `L${R} ${B - FOLDER_R}`,
    `Q${R} ${B} ${R - FOLDER_R} ${B}`,
    `L${L + FOLDER_R} ${B}`,
    `Q${L} ${B} ${L} ${B - FOLDER_R}`,
    "Z",
  ].join("");
}

/**
 * Documents: everything arriving on the left is loose, tilted and of no
 * agreed shape; everything leaving on the right is filed, square and on
 * a pitch. The gold slab in the middle is the only thing that changed.
 */
export function SortFlow({
  tone = "dark",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const p = palette(tone);

  const docs = DOCS.map((doc, index) => {
    const rad = (doc.tilt * Math.PI) / 180;
    // Midpoint of the page's right edge, carried round by its own tilt.
    const port = {
      x: doc.x + (DOC_W / 2) * Math.cos(rad),
      y: doc.y + (DOC_W / 2) * Math.sin(rad),
    };
    return { ...doc, port, rim: RIMS[index], key: `${doc.x}-${doc.y}` };
  });

  return (
    <Scene viewBox="0 0 720 540" className={className}>
      <Rings cx={CX} cy={CY} radii={[104, 158, 214]} tone={tone} />

      {/* Inbound: five pages funnelling into the left rim. */}
      {docs.map((doc) => (
        <g key={`in-${doc.key}`}>
          <Link d={hCurve(doc.port.x, doc.port.y, doc.rim.x, doc.rim.y)} tone={tone} />
          <Node cx={doc.port.x} cy={doc.port.y} tone={tone} r={2.8} />
          <Node cx={doc.rim.x} cy={doc.rim.y} tone={tone} r={2.8} />
        </g>
      ))}

      {/* Outbound: one trunk off the right rim, then a four-way fan. */}
      <Link d={`M${TRUNK_START.x} ${TRUNK_START.y}L${TRUNK_X} ${CY}`} tone={tone} />
      <Node cx={TRUNK_START.x} cy={TRUNK_START.y} tone={tone} r={2.8} />
      {FOLDERS.map((folder) => (
        <g key={`out-${folder.cy}`}>
          <Link d={hCurve(TRUNK_X, CY, FOLDER_X, folder.cy)} tone={tone} />
          <Node cx={FOLDER_X} cy={folder.cy} tone={tone} r={2.8} />
        </g>
      ))}
      <Node cx={TRUNK_X} cy={CY} tone={tone} r={3.2} />

      {/* The pile. */}
      {docs.map((doc) => {
        const Icon = doc.icon;
        const barX = -DOC_W / 2 + 13;
        const barW = DOC_W - 26;
        return (
          <g
            key={`doc-${doc.key}`}
            transform={`translate(${doc.x} ${doc.y}) rotate(${doc.tilt})`}
          >
            <path d={DOC_PATH} fill={p.cardFill} stroke={p.cardStroke} strokeWidth={1} />
            <path
              d={DOC_FOLD_PATH}
              fill="none"
              stroke={p.cardStroke}
              strokeWidth={1}
              strokeLinejoin="round"
            />
            <circle
              cx={-DOC_W / 2 + 22}
              cy={-DOC_H / 2 + 26}
              r={13}
              fill={p.cardFill}
              stroke={p.cardStroke}
              strokeWidth={1}
            />
            <Icon
              x={-DOC_W / 2 + 14.5}
              y={-DOC_H / 2 + 18.5}
              width={15}
              height={15}
              color={p.cardIcon}
              weight="light"
            />
            <rect
              x={barX}
              y={DOC_H / 2 - 33}
              width={barW}
              height={3.6}
              rx={1.8}
              fill={p.bar}
            />
            <rect
              x={barX}
              y={DOC_H / 2 - 24}
              width={barW * 0.56}
              height={3.6}
              rx={1.8}
              fill={p.bar}
            />
          </g>
        );
      })}

      {/* The destinations. */}
      {FOLDERS.map((folder) => {
        const Icon = folder.icon;
        const barX = FOLDER_X + 50;
        const barW = FOLDER_W - 70;
        return (
          <g key={`folder-${folder.cy}`}>
            <path
              d={folderPath(folder.cy)}
              fill={p.cardFill}
              stroke={p.cardStroke}
              strokeWidth={1}
            />
            <path
              d={folderCrest(folder.cy)}
              fill="none"
              stroke={p.accent}
              strokeWidth={1.4}
              strokeLinecap="round"
            />
            <Icon
              x={FOLDER_X + 18}
              y={folder.cy - 11}
              width={22}
              height={22}
              color={p.cardIcon}
              weight="light"
            />
            <rect
              x={barX}
              y={folder.cy - 8.5}
              width={barW}
              height={3.6}
              rx={1.8}
              fill={p.bar}
            />
            <rect
              x={barX}
              y={folder.cy + 2.5}
              width={barW * 0.5}
              height={3.6}
              rx={1.8}
              fill={p.link}
            />
          </g>
        );
      })}

      <CorePlate cx={CX} cy={CY} width={PLATE} icon={FileText} tone={tone} />
    </Scene>
  );
}
