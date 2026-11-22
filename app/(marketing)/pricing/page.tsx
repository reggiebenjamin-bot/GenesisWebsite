import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { ManagedComparison } from "@/components/offers/ManagedComparison";
import { ClosingBand, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { Button, TextLink } from "@/components/ui/Button";
import { FaqList } from "@/components/ui/FaqList";
import { Eyebrow } from "@/components/ui/Section";
import { pricingFaqs } from "@/lib/content";
import { FUNDING_LINE } from "@/lib/legal";
import { pageMetadata } from "@/lib/metadata";
import { ministryLevels } from "@/lib/ministryPage";
import { breadcrumbSchema, faqPageSchema, graph, managedServiceSchema } from "@/lib/schema";
import { managedOverview } from "@/lib/offers";

export const metadata: Metadata = pageMetadata("/pricing");

export default function PricingPage() {
  const managedPanel = (
    <div>
      <SectionIntro
        layout="split"
        eyebrow={managedOverview.product}
        title={managedOverview.pricing.headline}
        aside={
          <p className="max-w-[36ch] text-[0.95rem] text-muted-dark">{managedOverview.pricing.body}</p>
        }
      />

      <ManagedComparison checkout />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
        <p className="max-w-[44ch] text-[0.9rem] text-muted-dark">{managedOverview.pricing.closing}</p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <TextLink href="/solutions">See how it is built</TextLink>
          <Button href="/assessment" variant="outline" className="shrink-0">
            Assess My Business
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <JsonLd data={graph(managedServiceSchema(), faqPageSchema(pricingFaqs, "/pricing"), breadcrumbSchema("/pricing"))} />

      <section className="border-b border-line-light bg-paper pt-[calc(var(--header-height)+42px)] pb-[42px] text-ink md:pt-[calc(var(--header-height)+56px)] md:pb-[52px]">
        <div className="shell max-w-[960px]">
          <Eyebrow>Pricing</Eyebrow>
          <h1 className="mt-5 text-[clamp(2.55rem,5.4vw,4.8rem)] leading-[1.02] tracking-[-0.045em]">
            Managed AI plans.
          </h1>
          <div className="mt-5 grid max-w-[58ch] gap-3 text-[1.02rem] text-muted-dark md:text-[1.08rem]">
            <p>
              Genesis Managed AI connects the systems, people, data, communication, and workflows
              across the business. Choose the level that matches the scope of the operation.
            </p>
          </div>
          {/* These are the business plans. Genesis Ministry, for churches, has its own three
              plans and prices, so a church is pointed there before it reads a business number. */}
          <p className="mt-6 flex max-w-[58ch] flex-wrap items-center gap-x-3 gap-y-1 text-[0.95rem] text-muted-dark">
            <span>
              For churches: Genesis Ministry has its own plans, from {ministryLevels.levels[0].priceDisplay} a month.
            </span>
            <TextLink href="/ministry#levels">See the Ministry Plans</TextLink>
          </p>
        </div>
      </section>

      <section className="relative bg-paper pt-[clamp(40px,6vw,80px)] pb-[clamp(40px,6vw,80px)] text-ink">
        {["custom-infrastructure", "infrastructure", "agent", "mini"].map((id) => (
          <span key={id} id={id} aria-hidden="true" className="absolute top-0 left-0 block size-px" />
        ))}
        <div className="shell">{managedPanel}</div>
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
        <p className="mt-10 text-[0.8rem] text-muted-dark">{FUNDING_LINE}</p>
      </Sheet>

      <ClosingBand
        title="Not sure which level fits the operation?"
        line="Use the business assessment to find the clearest place to begin."
        actions={<Button href="/assessment">Assess My Business</Button>}
      />
    </>
  );
}
