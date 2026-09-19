import { InfrastructureMap } from "@/components/offers/InfrastructureMap";
import { Card } from "@/components/ui/Blocks";
import { Eyebrow } from "@/components/ui/Section";
import { managedOverview, offerPaths } from "@/lib/offers";

const infrastructurePath = offerPaths.find((path) => path.id === "custom-infrastructure");

/**
 * Genesis Managed AI as a bento: the claim, what a deployment connects, and
 * how a customer puts it; the system map as the large tile; and what it does
 * beside it.
 */
export function ManagedBento() {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="flex flex-col lg:col-span-5">
        <Eyebrow>{managedOverview.eyebrow}</Eyebrow>
        <h2
          id="managed-title"
          className="mt-4 max-w-[18ch] text-[clamp(2rem,3.2vw,2.9rem)] leading-[1.04] tracking-[-0.045em] text-balance"
        >
          {managedOverview.headline}
        </h2>
        <p className="mt-5 text-[0.95rem] leading-relaxed text-muted-dark">
          {managedOverview.summary}
        </p>
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
        <ul className="mt-5 grid gap-5">
          {managedOverview.does.map((item) => (
            <li key={item.title} className="grid grid-cols-[8px_minmax(0,1fr)] gap-3">
              <span aria-hidden="true" className="mt-[0.5rem] size-1.5 rounded-full bg-gold" />
              <div>
                <p className="text-[1rem] leading-snug font-medium">{item.title}</p>
                <p className="mt-1 text-[0.9rem] leading-relaxed text-muted-dark">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
