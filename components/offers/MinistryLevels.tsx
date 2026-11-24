import type { CSSProperties } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Blocks";
import { Button } from "@/components/ui/Button";
import { ministryLevels } from "@/lib/ministryPage";

/* The gold hairline gets stronger with the plan, as on the edition Levels. */
const TIER_EDGES = ["rgb(201 165 94 / 0.3)", "rgb(201 165 94 / 0.6)", "rgb(201 165 94 / 0.95)"] as const;

/**
 * The three Genesis Ministry plans (Care, Shepherd and Plus), in the same
 * visual language as EditionLevels: light cards, a gold edge that strengthens
 * by plan, the plan name, what it is for, the monthly price in the edition
 * price style, what it includes, and one outline action. Every button books a
 * consultation with the plan and its price in the starting note.
 *
 * Enterprise, for more than one campus, is the line under the cards, as
 * Genesis Enterprise is under the edition levels.
 */
export function MinistryLevels() {
  const { enterprise, priceUnit } = ministryLevels;
  return (
    <>
      <ol className="grid gap-4 md:grid-cols-3">
        {ministryLevels.levels.map((plan, index) => (
          <Card
            key={plan.id}
            as="li"
            className="relative flex h-full flex-col overflow-hidden"
            style={{ "--tier-edge": TIER_EDGES[index] } as CSSProperties}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--tier-edge),transparent)]"
            />
            <h3 className="font-light text-[clamp(1.9rem,2.6vw,2.4rem)] leading-none tracking-[-0.04em]">
              {plan.name}
            </h3>
            <p className="mt-3 text-[0.95rem] leading-snug text-muted-dark">{plan.summary}</p>

            <p className="mt-6 flex items-baseline gap-1.5 border-t border-line-light pt-5">
              <span className="text-[clamp(2.1rem,3vw,2.7rem)] leading-none tracking-[-0.05em] tabular-nums">
                {plan.priceDisplay}
              </span>
              <span className="text-[0.9rem] text-muted-dark">{priceUnit}</span>
            </p>

            <ul className="mt-6 grid gap-3 border-t border-line-light pt-5">
              {plan.bullets.map((bullet) => (
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
                href={plan.action.href}
                variant="outline"
                className="w-full"
                aria-label={`${plan.action.label}: ${plan.name}, ${plan.priceDisplay} ${priceUnit}`}
              >
                {plan.action.label}
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
          className="inline-flex min-h-11 items-center font-bold text-ink underline decoration-gold/70 underline-offset-4 transition-colors duration-200 hover:text-gold-dark"
        >
          {enterprise.action.label}
        </Link>
      </p>
    </>
  );
}
