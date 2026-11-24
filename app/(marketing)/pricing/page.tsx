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

import { pageMetadata } from "@/lib/metadata";
import { ministryPriceAnswer } from "@/lib/ministryPage";
import { breadcrumbSchema, faqPageSchema, graph, managedServiceSchema } from "@/lib/schema";
import { managedOverview } from "@/lib/offers";

export const metadata: Metadata = pageMetadata("/pricing");

/* Every edition, in the nav order: the three that share these Levels, then Enterprise and Ministry. */
const editionLinks = [
  { label: "Lending", href: editionPricing.lending.pricingPath },
  { label: "Real Estate Pros", href: editionPricing.real_estate.pricingPath },
  { label: "Business", href: editionPricing.business.pricingPath },
  { label: "Enterprise", href: "/enterprise" },
  { label: "Ministry", href: "/ministry#levels" },
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
          <div className="mb-[clamp(24px,3vw,40px)] grid gap-5 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
            <div>
              <Eyebrow>Pricing</Eyebrow>
              <h1 className="mt-4 text-[clamp(2.6rem,6vw,5.4rem)] leading-[1.02] tracking-[-0.045em] text-balance">
                Three Levels, one price list.
              </h1>
            </div>
            <div className="grid gap-3">
              <p className="max-w-[52ch] text-[1rem] leading-relaxed text-muted-dark">{managedOverview.pricing.body}</p>
              <div className="text-[0.95rem] text-muted-dark">
                <p className="max-sm:mb-0.5">Pricing by edition:</p>
                <TrackClick event="edition_link_clicked" from="pricing_header">
                  <ul className="flex flex-wrap gap-x-5">
                    {editionLinks.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className={editionLink}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </TrackClick>
              </div>
              <TrackClick event="assessment_link_clicked" from="pricing_hero" selector="a[href^='/assessment']">
                <p className="text-[0.95rem] text-muted-dark">
                  Not sure which Level?{" "}
                  <Link href="/assessment" className={editionLink}>
                    Take the free assessment
                  </Link>
                </p>
              </TrackClick>
            </div>
          </div>

          {/* Churches first see their own prices, before any business Level: one slim row. */}
          <aside
            aria-labelledby="pricing-churches-title"
            className="mb-6 flex flex-wrap items-center justify-between gap-x-10 gap-y-1 rounded-[6px] border border-gold/45 bg-gold-light/10 px-5 py-3"
          >
            <p className="max-w-[70ch] text-[0.95rem]">
              <span id="pricing-churches-title" className="font-semibold">Genesis Ministry, for churches. </span>
              <span className="text-muted-dark">
                {ministryPriceAnswer} Enterprise, for more than one campus, is scoped on a call.
              </span>
            </p>
            <TrackClick event="edition_link_clicked" from="pricing_churches">
              <TextLink className="shrink-0" href="/ministry#levels">See the Ministry Plans</TextLink>
            </TrackClick>
          </aside>

          <ManagedComparison checkout />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-3 border-t border-line-light pt-6">
            <p className="max-w-[60ch] text-[0.9rem] text-muted-dark">
              {managedOverview.pricing.closing}
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
        line="Take the free assessment. Your results suggest a Level from how many people would use Genesis."
        actions={
          <TrackClick event="assessment_link_clicked" from="pricing_close" selector="a[href^='/assessment']">
            <ConsultationButton href="/assessment">Assess My Business</ConsultationButton>
          </TrackClick>
        }
      />
    </>
  );
}
