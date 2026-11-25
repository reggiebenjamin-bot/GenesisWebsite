"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { LevelAiEmployees } from "@/components/offers/LevelAiEmployees";
import { PriceTag } from "@/components/offers/PriceTag";
import { UserLimitNote } from "@/components/offers/UserLimitNote";
import { Card } from "@/components/ui/Blocks";
import { SubmitButton } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { editionPricing, isEditionKey } from "@/lib/editionPlans";
import { managedOverview, managedPlans } from "@/lib/offers";

/* The gold hairline gets stronger with the level. */
const TIER_EDGES = [
  "rgb(201 165 94 / 0.3)",
  "rgb(201 165 94 / 0.6)",
  "rgb(201 165 94 / 0.95)",
] as const;

/* The editions that share these Levels, in the nav order. */
export const MANAGED_EDITIONS = [
  { value: "lending", label: "Lending" },
  { value: "real_estate", label: "Real Estate Pros", short: "Real Estate" },
  { value: "business", label: "Business" },
] as const;

/**
 * The three Levels read across as well as down: the price, a plain line on
 * what the Level is, its AI employees, the users and the call to action, held level with each
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
  initialEdition = "",
}: {
  headingLevel?: "h3" | "h4";
  checkout?: boolean;
  /** The edition the visitor came from (?edition=), chosen for them. */
  initialEdition?: string;
}) {
  const Heading = headingLevel;
  const [edition, setEdition] = useState(
    MANAGED_EDITIONS.some((option) => option.value === initialEdition) ? initialEdition : "",
  );
  /* No edition yet: a visible message by the choice, never the browser's bubble on a hidden radio. */
  const [needsEdition, setNeedsEdition] = useState(false);
  const fieldset = useRef<HTMLFieldSetElement>(null);
  const rows = checkout ? "md:[grid-template-rows:repeat(5,auto)]" : "md:[grid-template-rows:repeat(4,auto)]";
  const span = checkout ? "md:row-span-5" : "md:row-span-4";

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
            <PriceTag amount={plan.priceDisplay} setup={plan.setupLine} className="mt-4" />
          </div>

          <div>
            <Heading className="text-[clamp(1.15rem,1.7vw,1.35rem)] leading-snug tracking-[-0.02em]">{plan.ladder}</Heading>
            <p className="mt-2 text-[0.95rem] leading-relaxed">{plan.day}</p>
            {/* With an edition chosen, the card says what that edition's Level includes. */}
            {checkout && isEditionKey(edition) ? (
              <ul aria-label={`Level ${plan.step} in ${editionPricing[edition].name}`} className="mt-3 grid gap-1.5">
                {editionPricing[edition].bullets[plan.id].map((bullet) => (
                  <li key={bullet} className="grid grid-cols-[8px_minmax(0,1fr)] gap-2.5 text-[0.92rem] leading-snug">
                    <span aria-hidden="true" className="mt-[0.42rem] size-1.5 rounded-full bg-gold-dark" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <LevelAiEmployees plan={plan} />

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
                  /* Every press is counted, then the edition is checked. */
                  track("managed_plan_attempted", { from: "pricing", level: plan.step, edition: edition || "none" });
                  if (!edition) {
                    event.preventDefault();
                    setNeedsEdition(true);
                    fieldset.current?.scrollIntoView({ block: "center", behavior: "smooth" });
                    fieldset.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
                    return;
                  }
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
          {/* On a phone: the label on its own line, then the three as an even segmented row. */}
          <fieldset
            ref={fieldset}
            aria-describedby="managed-edition-help"
            aria-invalid={needsEdition || undefined}
            className="mb-5 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-x-3"
          >
            <legend className="mb-2 text-[0.95rem] font-semibold sm:float-left sm:mr-2 sm:mb-0">Pick your edition to start</legend>
            {MANAGED_EDITIONS.map((option) => (
              <label
                key={option.value}
                className="flex min-h-11 cursor-pointer items-center justify-center gap-2.5 rounded-[6px] border border-line-light bg-white/60 px-2 text-center text-[0.95rem] leading-tight max-sm:text-[0.88rem] sm:px-4 transition-colors duration-200 hover:border-gold-dark has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-ivory has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold-dark/40"
              >
                <input
                  type="radio"
                  name="edition"
                  value={option.value}
                  checked={edition === option.value}
                  onChange={() => {
                    setEdition(option.value);
                    setNeedsEdition(false);
                  }}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="grid size-4 shrink-0 place-items-center rounded-full border-[1.5px] border-ink/55 bg-white peer-checked:border-gold-light peer-checked:bg-gold-light max-sm:hidden"
                />
                {"short" in option ? (
                  <>
                    <span className="sm:hidden">{option.short}</span>
                    <span className="max-sm:hidden">{option.label}</span>
                  </>
                ) : (
                  option.label
                )}
              </label>
            ))}
            <span id="managed-edition-help" className="col-span-3 text-[0.84rem] text-muted-dark sm:w-auto">
              The same Levels and prices for all three. Your edition sets up your onboarding.
            </span>
            {needsEdition ? (
              <p role="alert" className="col-span-3 w-full text-[0.9rem] font-semibold text-gold-dark">
                Choose your edition first, then press Start again.
              </p>
            ) : null}
          </fieldset>
          {cards}
        </form>
      ) : (
        cards
      )}

      <p className="mt-6 max-w-[72ch] text-[0.875rem] leading-relaxed text-muted-dark">{managedOverview.thirdPartyNote}</p>
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
