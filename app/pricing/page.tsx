import type { Metadata } from "next";
import { ManagedComparison } from "@/components/offers/ManagedComparison";
import { PathToggle } from "@/components/offers/PathToggle";
import { ToolPriceCards } from "@/components/offers/ToolPriceCards";
import { ClosingBand, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { Button, TextLink } from "@/components/ui/Button";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { FaqList } from "@/components/ui/FaqList";
import { Eyebrow } from "@/components/ui/Section";
import { contact } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import {
  managedOverview,
  offerPathHashAliases,
  offerPaths,
  TOOLS_INTEREST_SUBJECT,
  toolsOverview,
} from "@/lib/offers";

export const metadata: Metadata = pageMetadata(
  "Pricing",
  "Compare Genesis Tools, focused self-service AI applications, with Genesis Managed AI plans that operate across the business.",
);

const pricingFaqs = [
  {
    question: "Why aren't the tools priced like the managed plans?",
    answer:
      "They solve different scopes of problems. Genesis Tools help you perform a specific task yourself. Genesis Managed AI integrates Genesis into the way your business operates.",
  },
  {
    question: "Which tool is a subscription?",
    answer:
      "Deal Desk is the recurring product, at $49 per month. Deal Architect is priced per full analysis and Funding Ready per financing package.",
  },
  {
    question: "Does Funding Ready guarantee financing?",
    answer:
      "No. Funding Ready turns a deal into a professional, lender-ready financing submission. It does not imply guaranteed approval, guaranteed rates, or guaranteed financing.",
  },
  {
    question: "Are third-party software costs included in a managed plan?",
    answer: managedOverview.thirdPartyNote,
  },
  {
    question: "What changes between the managed plans?",
    answer:
      "The three plans represent increasing levels of implementation, integration, automation, intelligence, and operational support: Genesis assists the operator, then connects and assists the team, then helps orchestrate the operation.",
  },
] as const;

export default function PricingPage() {
  const toolsInterestHref = `mailto:${contact.email}?subject=${encodeURIComponent(
    TOOLS_INTEREST_SUBJECT,
  )}`;

  const toolsPanel = (
    <div>
      <SectionIntro
        layout="split"
        eyebrow={toolsOverview.product}
        title={toolsOverview.headline}
        aside={
          <p className="max-w-[32ch] text-[0.95rem] text-muted-dark">
            {toolsOverview.summary} Deal Desk is the recurring one.
          </p>
        }
      />

      <ToolPriceCards />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
        <p className="max-w-[40ch] text-[0.9rem] text-muted-dark">
          {toolsOverview.invitation.description}
        </p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <TextLink href="/mini">See the tools</TextLink>
          <Button href={toolsInterestHref} variant="outline" className="shrink-0">
            Ask About Tools
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
        title={managedOverview.headline}
        aside={
          <p className="max-w-[32ch] text-[0.95rem] text-muted-dark">{managedOverview.progression}</p>
        }
      />

      <ManagedComparison />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
        <p className="max-w-[44ch] text-[0.9rem] text-muted-dark">
          A consultation confirms the right level for your operation.
        </p>
        <TextLink href="/solutions">See how it is built</TextLink>
      </div>
    </div>
  );

  return (
    <>
      <section className="border-b border-line-light bg-paper pt-[calc(var(--header-height)+42px)] pb-[42px] text-ink md:pt-[calc(var(--header-height)+56px)] md:pb-[52px]">
        <div className="shell max-w-[960px]">
          <Eyebrow>Pricing</Eyebrow>
          <h1 className="mt-5 text-[clamp(2.55rem,5.4vw,4.8rem)] leading-[1.02] tracking-[-0.045em]">
            How do you want to use Genesis?
          </h1>
          <p className="mt-5 max-w-[46ch] text-[1.02rem] text-muted-dark md:text-[1.08rem]">
            Two offers, priced differently because they solve different scopes of problems.
          </p>
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
        title="Not sure which one fits?"
        line="A focused, no-cost conversation about your operation."
        actions={<ConsultationButton href="/contact" />}
      />
    </>
  );
}
