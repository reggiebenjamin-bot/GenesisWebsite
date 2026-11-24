"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { UserLimitNote } from "@/components/offers/UserLimitNote";
import { Card } from "@/components/ui/Blocks";
import { SubmitButton } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { managedOverview, managedPlans } from "@/lib/offers";

/* The gold hairline gets stronger with the level. */
const TIER_EDGES = [
  "rgb(201 165 94 / 0.3)",
  "rgb(201 165 94 / 0.6)",
  "rgb(201 165 94 / 0.95)",
] as const;

/* The editions that share these Levels, in the nav order. */
const EDITIONS = [
  { value: "lending", label: "Lending" },
  { value: "real_estate", label: "Real Estate Pros" },
  { value: "business", label: "Business" },
] as const;

/**
 * The three Levels read across as well as down: the price, a plain line on
 * what the Level is, the users and the call to action, held level with each
 * other by subgrid so the cards stay the same size.
 *
 * With `checkout`, the three cards share one form: the visitor first says
 * which edition they are buying (Lending, Real Estate Pros or Business), and
 * each Start button posts its Level with that edition to the managed
 * checkout, so onboarding and the CRM always know what was bought.
 */
export function ManagedComparison({
  headingLevel = "h3",
  checkout = false,
}: {
  headingLevel?: "h3" | "h4";
  checkout?: boolean;
}) {
  const Heading = headingLevel;
  const [edition, setEdition] = useState("");
  const rows = checkout ? "md:[grid-template-rows:repeat(4,auto)]" : "md:[grid-template-rows:repeat(3,auto)]";
  const span = checkout ? "md:row-span-4" : "md:row-span-3";

  const cards = (
    <ol className={`grid gap-4 md:grid-cols-3 ${rows}`}>
      {managedPlans.map((plan, index) => (
        <Card
          key={plan.id}
          as="li"
          className={`relative grid content-start gap-5 overflow-hidden md:gap-4 md:[grid-template-rows:subgrid] ${span}`}
          style={{ "--tier-edge": TIER_EDGES[index] } as CSSProperties}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--tier-edge),transparent)]"
          />

          <div>
            <p className="font-display text-[0.75rem] tracking-[0.12em] text-gold-dark uppercase">Level {plan.step}</p>
            {/* "per month" sits under the price until the cards are wide, so every card's rows line up. */}
            <p className="mt-4 flex flex-wrap items-baseline gap-x-1.5">
              <span className="text-[clamp(2.1rem,3vw,2.7rem)] leading-none tracking-[-0.05em] tabular-nums">
                {plan.priceDisplay}
              </span>
              <span className="text-[0.9rem] whitespace-nowrap text-muted-dark max-lg:basis-full max-lg:pt-1">per month</span>
            </p>
            <p className="mt-2 text-[0.85rem] text-muted-dark">{plan.setupLine}</p>
          </div>

          <div>
            <Heading className="text-[clamp(1.15rem,1.7vw,1.35rem)] leading-snug tracking-[-0.02em]">{plan.ladder}</Heading>
            <p className="mt-2 text-[0.95rem] leading-relaxed">{plan.day}</p>
          </div>

          <Detail label="Users" value={plan.userLimit} note={<UserLimitNote plan={plan} className="text-muted-dark" />} />

          {checkout ? (
            <div className="mt-2 flex items-end">
              <SubmitButton
                type="submit"
                name="plan"
                value={plan.id}
                variant="outline"
                className="w-full"
                onClick={(event) => {
                  if (event.currentTarget.form?.checkValidity())
                    track("managed_plan_selected", { from: "pricing", level: plan.step, edition });
                }}
              >
                Start Level {plan.step}
              </SubmitButton>
            </div>
          ) : null}
        </Card>
      ))}
    </ol>
  );

  return (
    <div>
      {checkout ? (
        <form action="/api/managed/checkout" method="POST">
          <fieldset className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <legend className="float-left mr-2 text-[0.95rem] font-semibold">Your edition</legend>
            {EDITIONS.map((option) => (
              <label
                key={option.value}
                className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-[6px] border border-line-light bg-white/60 px-4 text-[0.95rem] transition-colors duration-200 hover:border-gold-dark has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-ivory has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold-dark/40"
              >
                <input
                  type="radio"
                  name="edition"
                  value={option.value}
                  required
                  checked={edition === option.value}
                  onChange={() => setEdition(option.value)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="grid size-4 place-items-center rounded-full border-[1.5px] border-ink/55 bg-white peer-checked:border-gold-light peer-checked:bg-gold-light"
                />
                {option.label}
              </label>
            ))}
            <span className="w-full text-[0.84rem] text-muted-dark sm:w-auto">The same Levels and prices for all three.</span>
          </fieldset>
          {cards}
        </form>
      ) : (
        cards
      )}

      <p className="mt-6 max-w-[72ch] text-[0.8rem] leading-relaxed text-muted-dark">{managedOverview.thirdPartyNote}</p>
    </div>
  );
}

function Detail({ label, value, note }: { label: string; value: string; note?: ReactNode }) {
  return (
    <div className="border-t border-line-light pt-4">
      <p className="font-display text-[0.75rem] tracking-[0.12em] text-muted-dark uppercase">{label}</p>
      <p className="mt-2 text-[0.92rem] leading-snug">{value}</p>
      {note}
    </div>
  );
}
