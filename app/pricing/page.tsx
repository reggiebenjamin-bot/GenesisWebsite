import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { ManagedComparison } from "@/components/offers/ManagedComparison";
import { PathToggle } from "@/components/offers/PathToggle";
import { ToolPriceCards } from "@/components/offers/ToolPriceCards";
import { ClosingBand, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { Button, TextLink } from "@/components/ui/Button";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { FaqList } from "@/components/ui/FaqList";
import { Eyebrow } from "@/components/ui/Section";
import { contact, pricingFaqs } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, graph, managedServiceSchema, softwareApplicationSchema } from "@/lib/schema";
import {
  genesisTools,
  managedOverview,
  offerPathHashAliases,
  offerPaths,
  TOOLS_INTEREST_SUBJECT,
  toolsOverview,
} from "@/lib/offers";

export const metadata: Metadata = pageMetadata("/pricing");


export default function PricingPage() {
  const toolsInterestHref = `mailto:${contact.email}?subject=${encodeURIComponent(
    TOOLS_INTEREST_SUBJECT,
  )}`;

  const toolsPanel = (
    <div>
      <SectionIntro
        layout="split"
        eyebrow={toolsOverview.product}
        title={toolsOverview.pricing.headline}
        aside={
          <p className="max-w-[32ch] text-[0.95rem] text-muted-dark">{toolsOverview.pricing.body}</p>
        }
      />

      <ToolPriceCards />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
        <p className="max-w-[40ch] text-[0.9rem] text-muted-dark">
          {toolsOverview.invitation.description}
        </p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <TextLink href={toolsInterestHref}>Ask About Tools</TextLink>
          <Button href="/tools" variant="outline" className="shrink-0">
            {toolsOverview.pricing.cta}
          </Button>
        </div>
      </div>
    </div>
  );

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

      <ManagedComparison />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
        <p className="max-w-[44ch] text-[0.9rem] text-muted-dark">{managedOverview.pricing.closing}</p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <TextLink href="/solutions">See how it is built</TextLink>
          <Button href="/contact" variant="outline" className="shrink-0">
            Book a Consultation
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <JsonLd data={graph(managedServiceSchema(), ...genesisTools.map(softwareApplicationSchema), breadcrumbSchema("/pricing"))} />

      <section className="border-b border-line-light bg-paper pt-[calc(var(--header-height)+42px)] pb-[42px] text-ink md:pt-[calc(var(--header-height)+56px)] md:pb-[52px]">
        <div className="shell max-w-[960px]">
          <Eyebrow>Pricing</Eyebrow>
          <h1 className="mt-5 text-[clamp(2.55rem,5.4vw,4.8rem)] leading-[1.02] tracking-[-0.045em]">
            How do you want to use Genesis?
          </h1>
          <div className="mt-5 grid max-w-[58ch] gap-3 text-[1.02rem] text-muted-dark md:text-[1.08rem]">
            <p>
              Use a Genesis Tool when you need help with a defined task. Choose Genesis Managed AI
              when the problem spans systems, people, data, communication, and workflows across the
              business.
            </p>
            <p>Two offers, priced differently because they solve different scopes of problems.</p>
          </div>
        </div>
      </section>

      {/* The path shown is chosen with the toggle here or in the navigation;
          old #mini and #infrastructure links still select one. */}
      <section data-offer-region className="relative bg-paper py-[clamp(40px,6vw,80px)] text-ink">
        {[...offerPaths.map((path) => path.id), ...Object.keys(offerPathHashAliases)].map((id) => (
          <span key={id} id={id} aria-hidden="true" className="absolute top-0 left-0 block size-px" />
        ))}

        <div className="shell">
          <div className="mb-[clamp(40px,6vw,72px)] flex justify-center">
            <PathToggle variant="section" />
          </div>
          <div data-offer-panel="agent">{toolsPanel}</div>
          <div data-offer-panel="custom-infrastructure">{managedPanel}</div>
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
        title="Not sure which scope fits?"
        line="Start with the operation, not the plan card."
        actions={<ConsultationButton href="/contact">Book a No-Cost Consultation</ConsultationButton>}
      />
    </>
  );
}
