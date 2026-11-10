import type { CSSProperties } from "react";
import { Card } from "@/components/ui/Blocks";
import { SubmitButton } from "@/components/ui/Button";
import { editionLevels, editionPricing, type EditionKey } from "@/lib/editionPlans";

/* The gold hairline gets stronger with the level, as on the pricing page. */
const TIER_EDGES = [
  "rgb(201 165 94 / 0.3)",
  "rgb(201 165 94 / 0.6)",
  "rgb(201 165 94 / 0.95)",
] as const;

/**
 * One edition's three Levels: the same price, setup fee and user limit as the
 * Managed AI Levels, with edition bullets. Every button posts the Level and
 * the edition to the managed checkout, so all buyers land on the same three
 * Stripe checkouts.
 */
export function EditionLevels({ edition }: { edition: EditionKey }) {
  const { name } = editionPricing[edition];

  return (
    <ol className="mx-auto grid max-w-[72rem] gap-4 md:grid-cols-3">
      {editionLevels(edition).map(({ plan, bullets }, index) => (
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
          <p className="font-display text-[0.62rem] tracking-[0.16em] text-gold-dark uppercase">
            Level {plan.step}
          </p>
          <h3 className="mt-3 text-[clamp(1.15rem,1.7vw,1.35rem)] leading-snug tracking-[-0.02em]">
            {name}
          </h3>
          <p className="mt-4 flex items-baseline gap-1.5">
            <span className="text-[clamp(2.1rem,3vw,2.7rem)] leading-none tracking-[-0.05em] tabular-nums">
              {plan.priceDisplay}
            </span>
            <span className="text-[0.9rem] text-muted-dark">per month</span>
          </p>
          <p className="mt-2 text-[0.85rem] text-muted-dark">{plan.setupLine}</p>

          <div className="mt-6 border-t border-line-light pt-4">
            <p className="font-display text-[0.6rem] tracking-[0.16em] text-muted-dark uppercase">
              Users
            </p>
            <p className="mt-2 text-[0.92rem] leading-snug">{plan.userLimit}</p>
          </div>

          <ul className="mt-6 grid gap-3 border-t border-line-light pt-5">
            {bullets.map((bullet) => (
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

          <form action="/api/managed/checkout" method="POST" className="mt-auto flex items-end pt-8">
            <input type="hidden" name="plan" value={plan.id} />
            <input type="hidden" name="edition" value={edition} />
            <SubmitButton variant="outline" className="w-full">
              Start Level {plan.step}
            </SubmitButton>
          </form>
        </Card>
      ))}
    </ol>
  );
}
