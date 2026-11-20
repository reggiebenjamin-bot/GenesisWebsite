import type { CSSProperties } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Blocks";
import { Button } from "@/components/ui/Button";
import { ministryLevels } from "@/lib/ministryPage";

/* The gold hairline gets stronger with the level, as on the edition Levels. */
const TIER_EDGES = ["rgb(201 165 94 / 0.3)", "rgb(201 165 94 / 0.6)", "rgb(201 165 94 / 0.95)"] as const;

/**
 * The Genesis Ministry levels, in the same visual language as EditionLevels:
 * light cards, a gold edge that strengthens by level, the level label, its
 * name, what it includes, and one outline action. Draft levels with no
 * prices: where the edition cards show a price, these say pricing is set with
 * Genesis, and every button books a consultation with the level noted.
 *
 * Enterprise, for more than one campus, is the line under the cards, as
 * Genesis Enterprise is under the edition levels.
 */
export function MinistryLevels() {
  const { enterprise } = ministryLevels;
  return (
    <>
      <ol className="grid gap-4 md:grid-cols-3">
        {ministryLevels.levels.map((level, index) => (
          <Card
            key={level.id}
            as="li"
            className="relative flex h-full flex-col overflow-hidden"
            style={{ "--tier-edge": TIER_EDGES[index] } as CSSProperties}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--tier-edge),transparent)]"
            />
            <p className="font-display text-[0.62rem] tracking-[0.16em] text-gold-dark uppercase">
              Level {level.step}
            </p>
            <h3 className="mt-3 font-light text-[clamp(1.9rem,2.6vw,2.4rem)] leading-none tracking-[-0.04em]">
              {level.name}
            </h3>
            <p className="mt-3 text-[0.95rem] leading-snug text-muted-dark">{level.summary}</p>

            <p className="mt-6 border-t border-line-light pt-4 font-display text-[0.62rem] tracking-[0.16em] text-muted-dark uppercase">
              {ministryLevels.priceLine}
            </p>

            <ul className="mt-5 grid gap-3 border-t border-line-light pt-5">
              {level.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2.5 text-[0.95rem] leading-snug"
                >
                  <span aria-hidden="true" className="text-gold-dark">
                    +
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-8">
              <Button
                href={level.action.href}
                variant="outline"
                className="w-full"
                aria-label={`${level.action.label}: Level ${level.step} ${level.name}`}
              >
                {level.action.label}
              </Button>
            </div>
          </Card>
        ))}
      </ol>
      <p className="mt-8 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 text-center text-[0.95rem] text-muted-dark">
        <span>{enterprise.line}</span>
        <Link
          href={enterprise.action.href}
          aria-label={`${enterprise.action.label}: ${enterprise.name}`}
          className="font-bold text-ink underline decoration-gold/70 underline-offset-4 transition-colors duration-200 hover:text-gold-dark"
        >
          {enterprise.action.label}
        </Link>
      </p>
    </>
  );
}
