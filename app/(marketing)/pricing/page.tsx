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
import { breadcrumbSchema, graph, managedServiceSchema, softwareApplicationSchema } from "@/lib/schema";
import {
  genesisTools,
  managedOverview,
  toolsOverview,
} from "@/lib/offers";

export const metadata: Metadata = pageMetadata("/pricing");

function ToolPricingCompact() {
  return (
    <ol className="grid gap-3 md:grid-cols-3">
      {genesisTools.map((tool) => (
        <li
          key={tool.id}
          className="flex h-full flex-col border border-line-light bg-white/40 p-5"
        >
          <p className="font-display text-[0.6rem] tracking-[0.16em] text-gold-dark uppercase">
            {tool.job}
          </p>
          <h3 className="mt-3 text-[1.2rem] leading-none tracking-[-0.03em]">{tool.name}</h3>
          <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-dark">{tool.pricing.for}</p>
          <p className="mt-5 flex items-baseline gap-1.5">
            <span className="text-[1.6rem] leading-none tracking-[-0.04em] tabular-nums">
              {tool.price.display}
            </span>
            <span className="text-[0.78rem] text-muted-dark">per {tool.price.unit}, one-time</span>
          </p>
          <div className="mt-auto pt-5">
            <Button href={tool.workspaceHref} variant="outline" className="w-full">
              View {tool.name}
            </Button>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function PricingPage() {
  const toolsPanel = (
    <div>
      <SectionIntro
        layout="split"
        eyebrow={toolsOverview.product}
        title="Try a tool first."
        aside={
          <p className="max-w-[32ch] text-[0.95rem] text-muted-dark">
            {toolsOverview.invitation.description}
          </p>
        }
      />

      <ToolPricingCompact />

      <div className="mt-6">
        <TextLink href="/tools#products">{toolsOverview.pricing.cta}</TextLink>
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

      {/* The Levels are the main offer and come first; the tools sit below. The
          old #mini, #agent and #infrastructure hashes still land on a section. */}
      <section className="relative bg-paper pt-[clamp(40px,6vw,80px)] text-ink">
        {["custom-infrastructure", "infrastructure"].map((id) => (
          <span key={id} id={id} aria-hidden="true" className="absolute top-0 left-0 block size-px" />
        ))}
        <div className="shell">{managedPanel}</div>
      </section>

      <section className="relative bg-paper pt-[clamp(48px,7vw,96px)] pb-[clamp(40px,6vw,80px)] text-ink">
        {["agent", "mini"].map((id) => (
          <span key={id} id={id} aria-hidden="true" className="absolute top-0 left-0 block size-px" />
        ))}
        <div className="shell border-t border-line-light pt-[clamp(32px,5vw,56px)]">{toolsPanel}</div>
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
        title="Not sure whether the problem is one task or the operation?"
        line="Use the business assessment to find the clearest place to begin."
        actions={<Button href="/assessment">Assess My Business</Button>}
      />
    </>
  );
}
