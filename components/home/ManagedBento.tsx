import { InfrastructureMap } from "@/components/offers/InfrastructureMap";
import { Card, Points } from "@/components/ui/Blocks";
import { Eyebrow } from "@/components/ui/Section";
import { managedOverview, offerPaths } from "@/lib/offers";

const infrastructurePath = offerPaths.find((path) => path.id === "custom-infrastructure");

/**
 * Genesis Managed AI as a bento: the claim and how a customer puts it, the
 * system map as the large tile, and what it does beside it.
 */
export function ManagedBento() {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="flex flex-col lg:col-span-5">
        <Eyebrow>{managedOverview.product}</Eyebrow>
        <h2
          id="managed-title"
          className="mt-4 max-w-[14ch] text-[clamp(2.1rem,3.6vw,3.2rem)] leading-[1.03] tracking-[-0.045em] text-balance"
        >
          {managedOverview.headline}
        </h2>
        {infrastructurePath ? (
          <p className="mt-auto flex items-baseline gap-3 pt-8 text-[1.05rem] leading-snug text-ink/80">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-gold-dark" />
            “{infrastructurePath.distinction}”
          </p>
        ) : null}
      </Card>

      <Card className="grid place-items-center lg:col-span-7 lg:row-span-2">
        <InfrastructureMap className="max-w-[460px]" />
      </Card>

      <Card className="flex flex-col justify-center lg:col-span-5">
        <p className="font-display text-[0.64rem] tracking-[0.16em] text-gold-dark uppercase">
          What it does
        </p>
        <Points items={managedOverview.points} className="mt-5" />
      </Card>
    </div>
  );
}
