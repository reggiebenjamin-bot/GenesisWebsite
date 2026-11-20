import type { CSSProperties } from "react";
import { Card } from "@/components/ui/Blocks";
import { Button } from "@/components/ui/Button";
import { ministryLevels } from "@/lib/ministryPage";

/* The gold hairline gets stronger with the level, as on the edition Levels. */
const TIER_EDGES = [
  "rgb(201 165 94 / 0.3)",
  "rgb(201 165 94 / 0.55)",
  "rgb(201 165 94 / 0.8)",
  "rgb(201 165 94 / 0.95)",
] as const;

/**
 * The Genesis Ministry levels, in the same visual language as EditionLevels:
 * a gold edge that strengthens by level, the level label, its name, what it
 * includes, and one action. Draft levels with no prices: where the edition
 * cards show a price, these say pricing is set with Genesis, and every
 * button books a consultation with the level noted.
 */
export function MinistryLevels() {
  return (
    <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {ministryLevels.levels.map((level, index) => (
        <Card
          key={level.id}
          as="li"
          tone={level.step ? "light" : "inverse"}
          className="relative flex h-full flex-col overflow-hidden"
          style={{ "--tier-edge": TIER_EDGES[index] } as CSSProperties}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--tier-edge),transparent)]"
          />
          <p
            className={`font-display text-[0.62rem] tracking-[0.16em] uppercase ${
              level.step ? "text-gold-dark" : "text-gold-light"
            }`}
          >
            {level.step ? `Level ${level.step}` : "Scoped on a call"}
          </p>
          <h3 className="mt-3 font-light text-[clamp(1.9rem,2.6vw,2.4rem)] leading-none tracking-[-0.04em]">
            {level.name}
          </h3>
          <p className={`mt-3 text-[0.95rem] leading-snug ${level.step ? "text-muted-dark" : "text-ivory/70"}`}>
            {level.summary}
          </p>

          <p
            className={`mt-6 border-t pt-4 font-display text-[0.62rem] tracking-[0.16em] uppercase ${
              level.step ? "border-line-light text-muted-dark" : "border-line-dark text-ivory/60"
            }`}
          >
            {ministryLevels.priceLine}
          </p>

          <ul className={`mt-5 grid gap-3 border-t pt-5 ${level.step ? "border-line-light" : "border-line-dark"}`}>
            {level.bullets.map((bullet) => (
              <li
                key={bullet}
                className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2.5 text-[0.95rem] leading-snug"
              >
                <span aria-hidden="true" className={level.step ? "text-gold-dark" : "text-gold-light"}>
                  +
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-8">
            <Button
              href={level.action.href}
              variant={level.step ? "outline" : "gold"}
              className="w-full"
              aria-label={`${level.action.label}: ${level.step ? `Level ${level.step} ` : ""}${level.name}`}
            >
              {level.action.label}
            </Button>
          </div>
        </Card>
      ))}
    </ol>
  );
}
