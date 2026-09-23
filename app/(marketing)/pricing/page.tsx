import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { ManagedComparison } from "@/components/offers/ManagedComparison";
import { PathToggle } from "@/components/offers/PathToggle";
import { ClosingBand, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { Button, TextLink } from "@/components/ui/Button";
import { FaqList } from "@/components/ui/FaqList";
import { Eyebrow } from "@/components/ui/Section";
import { pricingFaqs } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, graph, managedServiceSchema, softwareApplicationSchema } from "@/lib/schema";
import {
  genesisTools,
  managedOverview,
  offerPathHashAliases,
  offerPaths,
  toolsOverview,
} from "@/lib/offers";

export const metadata: Metadata = pageMetadata("/pricing");

function ToolPricingLedger() {
  return (
    <ol className="border-t border-line-light">
      {genesisTools.map((tool) => {
        return (
          <li
            key={tool.id}
            className="grid gap-7 border-b border-line-light py-[clamp(28px,4vw,48px)] lg:grid-cols-[0.4fr_0.85fr_1.25fr_0.65fr] lg:items-start lg:gap-10"
          >
            <div className="flex items-center justify-between gap-4 lg:block">
              <p className="font-display text-[0.64rem] tracking-[0.16em] text-gold-dark uppercase">
                {tool.job}
              </p>
              <p className="font-display text-[0.6rem] tracking-[0.14em] text-muted-dark uppercase lg:mt-4">
                One-time
              </p>
            </div>

            <div>
              <h3 className="text-[clamp(1.5rem,2.7vw,2.2rem)] leading-none tracking-[-0.035em]">
                {tool.name}
              </h3>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-muted-dark">
                {tool.pricing.for}
              </p>
            </div>

            <div className="border-t border-line-light pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              <p className="font-display text-[0.6rem] tracking-[0.16em] text-muted-dark uppercase">
                Included
              </p>
              <ul className="mt-3 grid gap-2">
                {tool.pricing.get.map((point) => (
                  <li key={point} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2 text-[0.88rem]">
                    <span aria-hidden="true" className="text-gold-dark">
                      +
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:text-right">
              <p className="text-[clamp(2.1rem,3.6vw,3.1rem)] leading-none tracking-[-0.055em] tabular-nums">
                {tool.price.display}
              </p>
              <p className="mt-2 text-[0.8rem] text-muted-dark">per {tool.price.unit}</p>
              <Button href={tool.workspaceHref} className="mt-6 w-full lg:max-w-[220px]">
                View {tool.name}
              </Button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function PricingPage() {
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

      <ToolPricingLedger />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
        <p className="max-w-[40ch] text-[0.9rem] text-muted-dark">
          {toolsOverview.invitation.description}
        </p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <Button href="/tools#products" variant="outline" className="shrink-0">
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
          <Button href="/assessment" variant="outline" className="shrink-0">
            Assess My Business
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
        title="Not sure whether the problem is one task or the operation?"
        line="Use the business assessment to find the clearest place to begin."
        actions={<Button href="/assessment">Assess My Business</Button>}
      />
    </>
  );
}
