import Link from "next/link";
import { Card } from "@/components/ui/Blocks";
import { chooserProducts } from "@/lib/productChooser";

const pageLink =
  "inline-flex min-h-[52px] w-full items-center justify-center rounded-[6px] border border-gold bg-ink px-4 text-center text-[0.84rem] leading-[1.1] font-bold tracking-[0.025em] text-ivory transition-colors duration-200 hover:bg-ink-soft";

const levelLink =
  "flex min-h-[52px] w-full flex-col items-start justify-center rounded-[6px] border border-ink/25 px-4 py-2 text-left transition-colors duration-200 hover:border-ink";

const consultLink = "font-bold underline decoration-ink/30 underline-offset-4 hover:text-gold-dark";

/**
 * Business, Real Estate, and Lending. Each card opens that edition's page
 * and the three existing checkout links for Level 01, Level 02, and Level 03.
 */
export function ProductChooser() {
  const products = chooserProducts();

  return (
    <div>
      <ul className="grid gap-4 md:grid-cols-3">
        {products.map((product) => (
          <Card as="li" key={product.key} className="flex h-full flex-col">
            <h3 className="text-[1.7rem] font-light tracking-[-0.035em]">{product.label}</h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-dark">{product.summary}</p>
            <div className="mt-6 grid gap-2">
              <Link href={product.href} className={pageLink}>
                Open {product.label}
              </Link>
              {product.levels.map((level) => (
                // Plain <a>, not <Link>: /start/* opens a live Stripe Checkout
                // Session, so it must never be prefetched or fetched as RSC.
                <a key={level.id} href={level.href} rel="nofollow" className={levelLink}>
                  <span className="text-[0.84rem] leading-none font-bold">Level {level.step}</span>
                  <span className="mt-1 text-[0.8rem] leading-snug text-muted-dark">
                    {level.priceDisplay} a month, {level.setupLine}
                  </span>
                </a>
              ))}
            </div>
          </Card>
        ))}
      </ul>

      <p className="mx-auto mt-8 max-w-[62ch] text-center text-[0.95rem] leading-relaxed text-muted-dark">
        <Link href="/capital-desk" className={consultLink}>
          Capital Desk consult
        </Link>{" "}
        for brokers, and a{" "}
        <Link href="/leadscout" className={consultLink}>
          Leadscout consult
        </Link>
        . These are conversations. They do not start checkout.
      </p>
    </div>
  );
}
