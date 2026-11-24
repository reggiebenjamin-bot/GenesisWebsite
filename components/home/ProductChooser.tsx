import Link from "next/link";
import { Card } from "@/components/ui/Blocks";
import { ministryEdition } from "@/lib/editions";
import { ministryLevels } from "@/lib/ministryPage";
import { chooserProducts } from "@/lib/productChooser";

/* The edition page: the site's outline button on paper, the same as "Start Level 0X" on /pricing. */
const pageLink =
  "inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[6px] border border-ink/30 px-4 text-center text-[0.84rem] leading-[1.1] font-bold tracking-[0.025em] text-ink transition-colors duration-200 hover:bg-ink hover:text-ivory";

/* Each Level as a quieter row with a clear affordance: a border, a hover and an arrow. */
const levelLink =
  "group flex min-h-[52px] w-full items-center justify-between gap-3 rounded-[6px] border border-ink/20 px-4 py-2 text-left transition-colors duration-200 hover:border-ink";

/* A separate 44px link, never a small word inside a sentence. */
const consultLink =
  "inline-flex min-h-11 items-center font-bold underline decoration-ink/30 underline-offset-4 hover:text-gold-dark";

/**
 * Lending, Real Estate Pros and Business. Each card opens that edition's page
 * and the three existing checkout links for Level 01, Level 02, and Level 03.
 */
export function ProductChooser() {
  const products = chooserProducts();

  return (
    <div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card as="li" key={product.key} className="flex h-full flex-col">
            <h3 className="text-[1.7rem] font-light tracking-[-0.035em]">{product.label}</h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-dark">{product.summary}</p>
            {/* Pushed to the foot of the card, so the buttons line up across all three. */}
            <div className="mt-auto grid gap-2 pt-6">
              <Link href={product.href} className={pageLink}>
                Open {product.label}
              </Link>
              {product.levels.map((level) => (
                <Link key={level.id} href={level.href} className={levelLink}>
                  <span>
                    <span className="block text-[0.88rem] leading-none font-bold">Start Level {level.step}</span>
                    <span className="mt-1 block text-[0.84rem] leading-snug text-muted-dark">
                      {level.priceDisplay} a month, {level.setupLine}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-ink/50 transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </ul>

      <div className="mx-auto mt-8 flex max-w-[62ch] flex-wrap items-center justify-center gap-x-6 text-center text-[0.95rem] text-muted-dark">
        <span>Conversations, not checkout:</span>
        <Link href="/capital-desk" className={consultLink}>
          Capital Desk Consult
        </Link>
        <Link href="/leadscout" className={consultLink}>
          Leadscout Consult
        </Link>
      </div>
      <p className="mx-auto mt-2 flex max-w-[62ch] flex-wrap items-center justify-center gap-x-2 text-center text-[0.95rem] text-muted-dark">
        Leading a church?{" "}
        <Link href={ministryEdition.href} className={consultLink}>
          {ministryEdition.name}
        </Link>{" "}
        has its own plans, from {ministryLevels.levels[0].priceDisplay} a month.
      </p>
    </div>
  );
}
