import type { ComponentType } from "react";
import {
  CorePlate,
  GlassCard,
  Link,
  Node,
  Rings,
  Scene,
  cardSize,
  hCurve,
  orbit,
  vCurve,
  type Tone,
} from "../kit";

type IconType = ComponentType<Record<string, unknown>>;

export type Spoke = { icon: IconType; deg: number; lit?: boolean };

const CX = 360;
const CY = 270;
const RX = 252;
const RY = 206;
const PLATE = 152;

/** Which edge of a card faces the middle, given where the card sits. */
function portFor(deg: number) {
  const a = ((deg % 360) + 360) % 360;
  if (a < 45 || a >= 315) return "bottom" as const;
  if (a < 135) return "left" as const;
  if (a < 225) return "top" as const;
  return "right" as const;
}

/**
 * Genesis at the centre with the surfaces it serves arranged around it.
 * Carries FIG 0.1 and the three audience marks: change the icons and the
 * story changes, the composition does not.
 */
export function RadialHub({
  coreIcon,
  spokes,
  tone = "dark",
  className = "",
}: {
  coreIcon: IconType;
  spokes: Spoke[];
  tone?: Tone;
  className?: string;
}) {
  return (
    <Scene viewBox="0 0 720 540" className={className}>
      <Rings cx={CX} cy={CY} radii={[150, 196, 246]} tone={tone} />

      {spokes.map((spoke) => {
        const centre = orbit(CX, CY, RX, spoke.deg, RY / RX);
        const port = portFor(spoke.deg);
        const anchor = orbit(CX, CY, PLATE * 0.54, spoke.deg, 0.55);

        const edge = {
          left: { x: centre.x - cardSize.w / 2, y: centre.y },
          right: { x: centre.x + cardSize.w / 2, y: centre.y },
          top: { x: centre.x, y: centre.y - cardSize.h / 2 },
          bottom: { x: centre.x, y: centre.y + cardSize.h / 2 },
        }[port];

        // Arrive square to the edge the connector meets, never at a slant.
        const d =
          port === "left" || port === "right"
            ? hCurve(anchor.x, anchor.y, edge.x, edge.y)
            : vCurve(anchor.x, anchor.y, edge.x, edge.y);

        return (
          <g key={spoke.deg}>
            <Link d={d} tone={tone} />
            <Node cx={anchor.x} cy={anchor.y} tone={tone} r={2.8} />
            <Node cx={edge.x} cy={edge.y} tone={tone} r={2.8} />
          </g>
        );
      })}

      {spokes.map((spoke) => {
        const centre = orbit(CX, CY, RX, spoke.deg, RY / RX);
        return (
          <GlassCard
            key={`card-${spoke.deg}`}
            x={centre.x - cardSize.w / 2}
            y={centre.y - cardSize.h / 2}
            icon={spoke.icon as never}
            tone={tone}
            lit={spoke.lit}
          />
        );
      })}

      <CorePlate cx={CX} cy={CY} width={PLATE} icon={coreIcon as never} tone={tone} />
    </Scene>
  );
}
