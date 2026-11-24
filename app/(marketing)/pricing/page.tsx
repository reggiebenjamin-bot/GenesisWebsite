import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { ManagedComparison } from "@/components/offers/ManagedComparison";
import { ClosingBand, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { TextLink } from "@/components/ui/Button";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { FaqList } from "@/components/ui/FaqList";
import { Eyebrow } from "@/components/ui/Section";
import { TrackClick } from "@/components/ui/TrackClick";
import { pricingFaqs } from "@/lib/content";
import { editionPricing } from "@/lib/editionPlans";
import { FUNDING_LINE } from "@/lib/legal";
import { pageMetadata } from "@/lib/metadata";
import { ministryPriceAnswer } from "@/lib/ministryPage";
import { breadcrumbSchema, faqPageSchema, graph, managedServiceSchema } from "@/lib/schema";
import { managedOverview } from "@/lib/offers";

export const metadata: Metadata = pageMetadata("/pricing");

/* The same three Levels, priced the same, with each edition's own bullets on its own pricing page. */
const editionLinks = [
  { label: "Lending", href: editionPricing.lending.pricingPath },
  { label: "Real Estate Pros", href: editionPricing.real_estate.pricingPath },
  { label: "Business", href: "/business#levels" },
];

const editionLink =
  "inline-flex min-h-11 items-center font-bold underline decoration-ink/30 underline-offset-4 transition-colors duration-200 hover:text-gold-dark";

export default function PricingPage() {
  return (
    <>
      <JsonLd data={graph(managedServiceSchema(), faqPageSchema(pricingFaqs, "/pricing"), breadcrumbSchema("/pricing"))} />

      {/* One header, in the same container as the cards below it, so the page has one left edge
          and the first price rises onto the first screen. */}
      <section className="relative bg-paper pt-[calc(var(--header-height)+36px)] pb-[clamp(48px,6vw,80px)] text-ink md:pt-[calc(var(--header-height)+56px)]">
        {["custom-infrastructure", "infrastructure", "agent", "mini"].map((id) => (
          <span key={id} id={id} aria-hidden="true" className="absolute top-0 left-0 block size-px" />
        ))}
        <div className="shell">
          <div className="mb-[clamp(28px,4vw,48px)] grid gap-5 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
            <div>
              <Eyebrow>Pricing</Eyebrow>
              <h1 className="mt-4 text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.02] tracking-[-0.045em]">
                Managed AI plans.
              </h1>
            </div>
            <div className="grid gap-3">
              <p className="max-w-[52ch] text-[1rem] leading-relaxed text-muted-dark">{managedOverview.pricing.body}</p>
              <p className="flex flex-wrap items-center gap-x-5 text-[0.95rem] text-muted-dark">
                <span>Pricing by edition:</span>
                {editionLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={editionLink}>
                    {link.label}
                  </Link>
                ))}
              </p>
            </div>
          </div>

          <ManagedComparison checkout />

          {/* Genesis Ministry, for churches, has its own plans and prices: one slim row after the
              Levels, so the business setup lines never read as a church's. */}
          <aside
            aria-labelledby="pricing-churches-title"
            className="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-3 rounded-[6px] border border-ink/15 bg-white/60 px-5 py-4"
          >
            <div className="max-w-[70ch]">
              <h2 id="pricing-churches-title" className="text-[1rem] leading-snug font-semibold tracking-[-0.01em]">
                Genesis Ministry, for churches
              </h2>
              <p className="mt-1 text-[0.95rem] text-muted-dark">
                {ministryPriceAnswer} Enterprise, for more than one campus, is scoped on a call.
              </p>
            </div>
            <TextLink className="shrink-0" href="/ministry#levels">See the Ministry Plans</TextLink>
          </aside>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-3 border-t border-line-light pt-6">
            <p className="max-w-[60ch] text-[0.9rem] text-muted-dark">
              {managedOverview.pricing.closing} {FUNDING_LINE}
            </p>
            <TextLink href="/solutions">See How It Is Built</TextLink>
          </div>
        </div>
      </section>

      <Sheet surface="paper" aria-labelledby="pricing-faq-title" className="site-section border-t border-line-light">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionIntro
            eyebrow="Pricing FAQ"
            title="Pricing questions."
            titleId="pricing-faq-title"
            className="mb-0"
          />
          <FaqList items={pricingFaqs} />
        </div>
      </Sheet>

      <ClosingBand
        title="Not sure which Level fits?"
        line="Take the free assessment. Your results suggest a Level from your team size."
        actions={
          <TrackClick event="assessment_link_clicked" from="pricing_close" selector="a[href^='/assessment']">
            <ConsultationButton href="/assessment">Assess My Business</ConsultationButton>
          </TrackClick>
        }
      />
    </>
  );
}
