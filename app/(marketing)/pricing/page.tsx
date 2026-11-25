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

import { pageMetadata } from "@/lib/metadata";
import { ministryLevels, ministryPriceAnswer } from "@/lib/ministryPage";
import { breadcrumbSchema, faqPageSchema, graph, managedServiceSchema } from "@/lib/schema";
import { managedOverview } from "@/lib/offers";

export const metadata: Metadata = pageMetadata("/pricing");

/* ?edition= from an edition page or a link: the business editions preselect, Ministry leads with church plans. */
function editionFrom(value: string | string[] | undefined): string {
  const raw = (Array.isArray(value) ? value[0] : value ?? "").toLowerCase().replace("-", "_");
  return raw;
}

const textLink =
  "inline-flex min-h-11 items-center font-bold underline decoration-ink/30 underline-offset-4 transition-colors duration-200 hover:text-gold-dark";

const ministryFrom = `${ministryLevels.levels[0].priceDisplay} a month`;

/** The church plans in one slim row, with its own heading so a pastor never takes the business Levels for theirs. */
function ChurchPlans({ className = "" }: { className?: string }) {
  return (
    <aside
      aria-labelledby="pricing-churches-title"
      className={`flex flex-wrap items-center justify-between gap-x-10 gap-y-1 rounded-[6px] border border-gold/45 bg-gold-light/10 px-5 py-3 ${className}`}
    >
      <div className="max-w-[70ch] text-[0.95rem]">
        {/* The site's small heading; the line under it carries the prices. */}
        <h2 id="pricing-churches-title" className="text-[1.15rem] leading-[1.38] font-normal tracking-[-0.01em]">
          Genesis Ministry, for churches.
        </h2>
        <p className="mt-2 text-muted-dark">
          {ministryPriceAnswer} Enterprise, for more than one campus, is scoped on a call.
        </p>
      </div>
      <TrackClick event="edition_link_clicked" from="pricing_churches">
        <TextLink className="shrink-0" href="/ministry#levels">See the Ministry Plans</TextLink>
      </TrackClick>
    </aside>
  );
}

export default async function PricingPage({ searchParams }: PageProps<"/pricing">) {
  const edition = editionFrom((await searchParams).edition);
  const church = edition === "ministry";
  return (
    <>
      <JsonLd data={graph(managedServiceSchema(), faqPageSchema(pricingFaqs, "/pricing"), breadcrumbSchema("/pricing"))} />

      {/* One header, in the same container as the cards below it, so the page has one left edge
          and the first price rises onto the first screen. The business Levels come first; the
          church plans follow them, unless the visitor came from Ministry. */}
      <section className="relative bg-paper pt-[calc(var(--header-height)+36px)] pb-[clamp(48px,6vw,80px)] text-ink md:pt-[calc(var(--header-height)+56px)]">
        {["custom-infrastructure", "infrastructure", "agent", "mini"].map((id) => (
          <span key={id} id={id} aria-hidden="true" className="absolute top-0 left-0 block size-px" />
        ))}
        <div className="shell">
          <div className="mb-[clamp(24px,3vw,40px)] grid gap-5 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
            <div>
              <Eyebrow>Pricing</Eyebrow>
              <h1 className="mt-4 text-[clamp(2.6rem,6vw,5.4rem)] leading-[1.02] font-light tracking-[-0.045em] text-balance">
                Three Levels, one price list.
              </h1>
            </div>
            <div className="grid gap-3">
              <p className="max-w-[52ch] text-[1rem] leading-relaxed text-muted-dark">{managedOverview.pricing.body}</p>
              <TrackClick event="assessment_link_clicked" from="pricing_hero" selector="a[href^='/assessment']">
                <p className="text-[0.95rem] text-muted-dark">
                  Not sure which Level?{" "}
                  <Link href="/assessment" className={textLink}>
                    Take the free assessment
                  </Link>
                </p>
              </TrackClick>
              {/* Most readers here price a business, so the business lede comes first; a pastor
                  still finds the church plans on the first screen, after it. */}
              {church ? null : (
                <TrackClick event="edition_link_clicked" from="pricing_hero_churches">
                  <p className="text-[0.95rem] text-muted-dark">
                    Leading a church?{" "}
                    <Link href="/ministry#levels" data-track-edition="ministry" className={textLink}>
                      See Ministry plans from {ministryFrom}
                    </Link>
                  </p>
                </TrackClick>
              )}
            </div>
          </div>

          {church ? <ChurchPlans className="mb-6" /> : null}

          {/* The outline goes h1, h2, then the h3 card titles. */}
          <h2 className="sr-only">The three Levels</h2>
          <ManagedComparison checkout initialEdition={edition} />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-3 border-t border-line-light pt-6">
            <p className="max-w-[60ch] text-[0.9rem] text-muted-dark">
              {managedOverview.pricing.closing} More than 25 users is{" "}
              <TrackClick event="edition_link_clicked" from="pricing_enterprise">
                <Link href="/enterprise" data-track-edition="enterprise" className={textLink}>
                  Genesis Enterprise
                </Link>
              </TrackClick>
              .
            </p>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-1">
              <TrackClick event="consultation_cta_clicked" from="pricing_levels">
                <TextLink href="/contact?topic=pricing#consultation-form">Book a Call</TextLink>
              </TrackClick>
              <TrackClick event="secondary_cta_clicked" from="pricing_levels">
                <TextLink href="/solutions">See How It Is Built</TextLink>
              </TrackClick>
            </div>
          </div>

          {church ? null : <ChurchPlans className="mt-10" />}
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
            <ConsultationButton href="/assessment" className="max-sm:w-full">Assess My Business</ConsultationButton>
          </TrackClick>
        }
      />
    </>
  );
}
