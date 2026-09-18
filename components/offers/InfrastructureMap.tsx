import Image from "next/image";
import { managedOverview } from "@/lib/offers";
import { cn } from "@/lib/utils";
import styles from "./InfrastructureMap.module.css";

/* Cell centres in a 300 × 300 space: the eight capabilities around the core. */
const RING = [
  [50, 50],
  [150, 50],
  [250, 50],
  [50, 150],
  [250, 150],
  [50, 250],
  [150, 250],
  [250, 250],
] as const;

/**
 * Genesis Managed AI as a picture: eight capabilities wired into one
 * integrated infrastructure, with a pulse running down each wire into the
 * core. Decorative — the copy beside it states the same sentence in full — so
 * it is hidden from assistive technology.
 */
export function InfrastructureMap({ className }: { className?: string }) {
  const capabilities = managedOverview.capabilities;
  const before = capabilities.slice(0, 4);
  const after = capabilities.slice(4);

  return (
    <div aria-hidden="true" className={cn("relative mx-auto w-full max-w-[540px]", className)}>
      <div className="relative aspect-square">
        <span className={styles.glow} />

        <svg viewBox="0 0 300 300" className={styles.wiring}>
          <g className={styles.ring}>
            <circle
              cx="150"
              cy="150"
              r="118"
              fill="none"
              stroke="rgb(118 84 38 / 0.3)"
              strokeWidth="1"
              strokeDasharray="2 6"
              vectorEffect="non-scaling-stroke"
            />
          </g>
          <g className={styles.ringOuter}>
            <circle
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke="rgb(118 84 38 / 0.16)"
              strokeWidth="1"
              strokeDasharray="1 11"
              vectorEffect="non-scaling-stroke"
            />
          </g>

          {RING.map(([x, y]) => (
            <line
              key={`${x}-${y}`}
              x1={x}
              y1={y}
              x2="150"
              y2="150"
              stroke="rgb(118 84 38 / 0.4)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {RING.map(([x, y], index) => (
            <line
              key={`pulse-${x}-${y}`}
              x1={x}
              y1={y}
              x2="150"
              y2="150"
              pathLength={100}
              fill="none"
              stroke="rgb(118 84 38 / 0.9)"
              strokeWidth="1.8"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className={styles.pulse}
              style={{ animationDelay: `${index * 0.42}s` }}
            />
          ))}
        </svg>

        <div className="relative grid size-full grid-cols-3 grid-rows-3 gap-[clamp(12px,3vw,22px)]">
          {before.map((capability, index) => (
            <Cell key={capability} index={index} label={capability} />
          ))}

          <div className={styles.core}>
            <Image
              src="/brand/genesis-logo.svg"
              alt=""
              width={56}
              height={56}
              className="size-11 sm:size-14"
            />
            <span className={styles.coreLabel}>Integrated AI infrastructure</span>
          </div>

          {after.map((capability, index) => (
            <Cell key={capability} index={index + 4} label={capability} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Cell({ index, label }: { index: number; label: string }) {
  return (
    <div className={styles.cell}>
      <span className={styles.cellIndex}>{String(index + 1).padStart(2, "0")}</span>
      <span className={styles.cellLabel}>{label}</span>
    </div>
  );
}
