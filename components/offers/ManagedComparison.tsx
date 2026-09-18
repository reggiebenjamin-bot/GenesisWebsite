import type { CSSProperties } from "react";
import { Card } from "@/components/ui/Blocks";
import { managedOverview, managedPlans } from "@/lib/offers";

/* The gold hairline gets stronger with the level, the way the plan cards on
   the homepage do. */
const TIER_EDGES = [
  "rgb(201 165 94 / 0.3)",
  "rgb(201 165 94 / 0.6)",
  "rgb(201 165 94 / 0.95)",
] as const;

/**
 * The three managed levels read across as well as down: four aligned rows —
 * the price, what Genesis does, the deployment, and the automation — held
 * level with each other by subgrid, so the cards stay the same size and only
 * the answers differ. Where subgrid is unavailable the cards simply size
 * themselves, which reads the same on one column.
 */
export function ManagedComparison({ headingLevel = "h3" }: { headingLevel?: "h3" | "h4" }) {
  const Heading = headingLevel;

  return (
    <div>
      <ol className="grid gap-4 md:grid-cols-3 md:[grid-template-rows:repeat(4,auto)]">
        {managedPlans.map((plan, index) => (
          <Card
            key={plan.id}
            as="li"
            className="relative grid content-start gap-6 overflow-hidden md:row-span-4 md:gap-4 md:[grid-template-rows:subgrid]"
            style={{ "--tier-edge": TIER_EDGES[index] } as CSSProperties}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--tier-edge),transparent)]"
            />

            <div>
              <p className="font-display text-[0.62rem] tracking-[0.16em] text-gold-dark uppercase">
                Level {plan.step}
              </p>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="text-[clamp(2.1rem,3vw,2.7rem)] leading-none tracking-[-0.05em] tabular-nums">
                  {plan.priceDisplay}
                </span>
                <span className="text-[0.9rem] text-muted-dark">per month</span>
              </p>
            </div>

            <Heading className="text-[clamp(1.15rem,1.7vw,1.35rem)] leading-snug tracking-[-0.02em]">
              {plan.ladder}
            </Heading>

            <Detail label="Deployment" value={plan.scope} />
            <Detail label="Automation" value={plan.automationLevel} />
          </Card>
        ))}
      </ol>

      <p className="mt-6 max-w-[72ch] text-[0.8rem] leading-relaxed text-muted-dark">
        {managedOverview.thirdPartyNote}
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-line-light pt-4">
      <p className="font-display text-[0.6rem] tracking-[0.16em] text-muted-dark uppercase">
        {label}
      </p>
      <p className="mt-2 text-[0.92rem] leading-snug">{value}</p>
    </div>
  );
}
