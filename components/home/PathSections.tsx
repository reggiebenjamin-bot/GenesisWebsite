import { SwitchPathLink } from "@/components/offers/SwitchPathLink";
import { Card, ClosingBand, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { contact } from "@/lib/content";
import { TOOLS_INTEREST_SUBJECT, toolsOverview, toolsToManaged } from "@/lib/offers";
import { HomeFaq } from "./HomeFaq";
import { ManagedBento } from "./ManagedBento";
import { NumbersSplit } from "./NumbersSplit";
import { OperatingThesis } from "./OperatingThesis";
import { PlanCards } from "./PlanCards";
import { ProcessTimeline } from "./ProcessTimeline";
import { ToolCards } from "./ToolCards";
import { ToolFlow } from "./ToolFlow";

/**
 * The homepage after the hero, for Agent → Genesis Tools. Paper and ink
 * alternate as rising sheets: the tools as three cards, how the numbers are
 * handled beside the sample report, how the tools connect as a flow with the
 * way on to Managed AI, then the questions and the tools enquiry.
 */
export function AgentSections() {
  const toolsInterestHref = `mailto:${contact.email}?subject=${encodeURIComponent(
    TOOLS_INTEREST_SUBJECT,
  )}`;

  return (
    <>
      <Sheet surface="paper" rise aria-labelledby="tools-title">
        <SectionIntro
          eyebrow={toolsOverview.product}
          title="Three focused tools."
          titleId="tools-title"
        />
        <ToolCards />
      </Sheet>

      <Sheet surface="ink" rise aria-labelledby="numbers-title" className="site-section">
        <NumbersSplit />
      </Sheet>

      <Sheet surface="paper" rise aria-labelledby="flow-title" className="site-section">
        <SectionIntro title="How the tools connect." titleId="flow-title" />
        <ToolFlow />

        <Card
          tone="inverse"
          className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="max-w-[36ch] text-[clamp(1.15rem,1.6vw,1.35rem)] leading-snug tracking-[-0.01em]">
            {toolsToManaged.question}
          </p>
          <SwitchPathLink
            path="custom-infrastructure"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-gold-light/70 px-5 text-[0.88rem] font-bold text-ivory transition-colors duration-200 hover:bg-ivory hover:text-ink"
          >
            {toolsToManaged.action}
            <span aria-hidden="true">→</span>
          </SwitchPathLink>
        </Card>
      </Sheet>

      <HomeFaq path="agent" className="pt-0" />

      <ClosingBand
        eyebrow={toolsOverview.product}
        title="Ask about Genesis Tools."
        actions={<ConsultationButton href={toolsInterestHref}>Ask About Tools</ConsultationButton>}
        footnote="This email does not create an account, start a purchase, reserve a price, or grant product access."
      />
    </>
  );
}

/**
 * The homepage after the hero, for Custom Infrastructure → Genesis Managed
 * AI: the thesis as a diagram, what Managed AI does as a bento with the plans
 * as three even cards, how an engagement runs as a timeline, then the
 * questions and the consultation. Genesis Tools are offered at the close as a
 * first way to experience Genesis.
 */
export function CustomInfrastructureSections() {
  return (
    <>
      <OperatingThesis current="custom-infrastructure" />

      <Sheet surface="paper" rise aria-labelledby="managed-title" className="site-section">
        <ManagedBento />
        <div className="mt-[clamp(80px,10vw,128px)]">
          <PlanCards />
        </div>
      </Sheet>

      <Sheet surface="ink" rise aria-labelledby="process-title" className="site-section">
        <ProcessTimeline />
      </Sheet>

      <HomeFaq path="custom-infrastructure" rise />

      <ClosingBand
        title="Start with a consultation."
        line="A focused, no-cost conversation about your operation."
        actions={<ConsultationButton href="/contact" />}
        footnote={
          <>
            {toolsOverview.invitation.title}{" "}
            <SwitchPathLink
              path="agent"
              className="font-bold whitespace-nowrap text-ivory underline decoration-gold/60 underline-offset-4 transition-colors hover:text-gold-light"
            >
              Try Genesis Tools →
            </SwitchPathLink>
          </>
        }
      />
    </>
  );
}
