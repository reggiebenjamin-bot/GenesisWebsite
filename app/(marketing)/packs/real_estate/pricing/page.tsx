import type { Metadata } from "next";
import Image from "next/image";
import { Card, Sheet } from "@/components/ui/Blocks";
import { Eyebrow } from "@/components/ui/Section";
import { realEstatePack } from "@/lib/realEstatePack";
import { absoluteUrl } from "@/lib/seo";
import { indexable } from "@/lib/site";

const PATH = "/packs/real_estate/pricing";

const description =
  "Genesis captures and routes every buyer and seller lead the moment it lands. See Agent and Team plans for real estate pros, priced so one closed listing pays for the plan.";

export const metadata: Metadata = {
  title: "Real Estate Pros Pricing",
  description,
  alternates: indexable ? { canonical: absoluteUrl(PATH) } : undefined,
  openGraph: {
    title: "Real Estate Pros Pricing | Genesis AI",
    description,
    type: "website",
    siteName: "Genesis AI",
    locale: "en_US",
    url: absoluteUrl(PATH),
  },
  twitter: {
    card: "summary_large_image",
    title: "Real Estate Pros Pricing | Genesis AI",
    description,
  },
};

/* Dark button with a gold outline, used for both tier calls to action. */
const ctaButton =
  "inline-flex min-h-[52px] w-full items-center justify-center rounded-[6px] border border-gold bg-ink px-6 text-[0.84rem] leading-[1.1] font-bold tracking-[0.025em] text-ivory transition-colors duration-200 hover:bg-ink-soft";

export default function RealEstatePackPricingPage() {
  return (
    <>
      <section className="border-b border-line-dark bg-ink pt-[calc(var(--header-height)+72px)] pb-24 text-center text-ivory md:pb-32">
        <div className="shell max-w-[920px]">
          <Image
            src="/brand/genesis-logo-gradient.svg"
            alt=""
            width={84}
            height={84}
            priority
            className="mx-auto h-[84px] w-[84px]"
          />
          <div className="mx-auto mt-6 h-px w-16 bg-gold" />
          <Eyebrow className="mt-8">{realEstatePack.eyebrow}</Eyebrow>
          <h1 className="mx-auto mt-5 max-w-[20ch] font-light text-[clamp(2.8rem,6vw,5.4rem)] leading-[1.02] tracking-[-0.045em] text-balance">
            {realEstatePack.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-[48ch] text-[1.08rem] leading-relaxed text-ivory/74">
            {realEstatePack.lede}
          </p>
        </div>
      </section>

      <Sheet surface="paper" rise aria-labelledby="plans-title" className="site-section">
        <h2 id="plans-title" className="sr-only">
          Plans
        </h2>
        <ol className="mx-auto grid max-w-[64rem] gap-4 lg:grid-cols-2">
          {realEstatePack.tiers.map((tier) => (
            <Card as="li" key={tier.id} className="flex h-full flex-col">
              <h3 className="font-light text-[clamp(1.9rem,3vw,2.6rem)] leading-none tracking-[-0.04em]">
                {tier.name}
              </h3>
              <p className="mt-4 text-[1rem] leading-relaxed text-muted-dark">{tier.tagline}</p>

              <div className="mt-7 border-t border-line-light pt-6">
                <p className="font-light text-[clamp(2.6rem,4vw,3.4rem)] leading-none tracking-[-0.05em] text-gold-dark tabular-nums">
                  {tier.priceDisplay}
                </p>
                <p className="mt-2 text-[0.9rem] text-muted-dark">
                  {tier.cadence} {tier.setupLabel}
                </p>
              </div>

              <ul className="mt-7 grid gap-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2.5 text-[0.95rem] leading-snug"
                  >
                    <span aria-hidden="true" className="text-gold-dark">
                      +
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <a className={ctaButton} href={tier.href}>
                  {tier.cta}
                </a>
              </div>
            </Card>
          ))}
        </ol>

        <p className="mx-auto mt-12 max-w-[56ch] text-center text-[0.84rem] text-muted-dark">
          {realEstatePack.footer}
        </p>
      </Sheet>
    </>
  );
}
