import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Blocks";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { ministryLevels } from "@/lib/ministryPage";

/* The gold hairline gets stronger with the plan, as on the edition Levels. */
const TIER_EDGES = ["rgb(201 165 94 / 0.3)", "rgb(201 165 94 / 0.6)", "rgb(201 165 94 / 0.95)"] as const;

/**
 * The three Genesis Ministry plans (Care, Shepherd and Plus), in the same
 * visual language as EditionLevels: light cards, a gold edge that strengthens
 * by plan, the plan name, who it suits, the monthly price, what it includes,
 * and the gold primary. No card is marked as the one most churches pick:
 * that would be a claim, so every card carries the same button.
 *
 * Under the cards, one row: Enterprise for more than one campus on the left,
 * and whatever the section adds (the assessment link) on the right.
 */
export function MinistryLevels({ aside }: { aside?: ReactNode }) {
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
            <p className="mt-3 text-[0.98rem] leading-snug">{plan.summary}</p>
            <p className="mt-1.5 text-[0.9rem] leading-snug text-muted-dark">{plan.suits}</p>

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
                  className="grid grid-cols-[8px_minmax(0,1fr)] gap-3 text-[0.95rem] leading-snug"
                >
                  <span aria-hidden="true" className="mt-[0.45rem] size-1.5 rounded-full bg-gold-dark" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-8">
              <ConsultationButton
                href={plan.action.href}
                className="w-full"
                aria-label={`${plan.action.label}: ${plan.name}, ${plan.priceDisplay} ${priceUnit}`}
              >
                {plan.action.label}
              </ConsultationButton>
            </div>
          </Card>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-2 border-t border-line-light pt-5">
        <p className="flex flex-wrap items-baseline gap-x-3 text-[0.95rem] text-muted-dark">
          <span>{enterprise.line}</span>
          <Link
            href={enterprise.action.href}
            aria-label={`${enterprise.action.label}: ${enterprise.name}`}
            className="inline-flex min-h-11 items-center font-bold text-ink underline decoration-gold/70 underline-offset-4 transition-colors duration-200 hover:text-gold-dark"
          >
            {enterprise.action.label}
          </Link>
        </p>
        {aside}
      </div>
    </>
  );
}
