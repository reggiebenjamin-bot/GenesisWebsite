import { SwitchPathLink } from "@/components/offers/SwitchPathLink";
import { ClosingBand, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import {
  toolsOverview,
} from "@/lib/offers";
import { HomeFaq } from "./HomeFaq";
import { ManagedBento } from "./ManagedBento";
import { NumbersSplit } from "./NumbersSplit";
import { OperatingThesis } from "./OperatingThesis";
import { PlanCards } from "./PlanCards";
import { ProcessTimeline } from "./ProcessTimeline";
import { ToolCards } from "./ToolCards";

/**
 * The homepage after the hero, for Agent → Genesis Tools. Each product card
 * opens its tool directly; the report preview and questions add context.
 */
export function AgentSections() {
  return (
    <>
      <Sheet surface="paper" rise aria-labelledby="tools-title">
        <SectionIntro
          layout="split"
          eyebrow={toolsOverview.product}
          title={toolsOverview.home.headline}
          titleId="tools-title"
          aside={
            <p className="max-w-[40ch] text-[0.95rem] leading-relaxed text-muted-dark">
              {toolsOverview.home.summary}
            </p>
          }
        />
        <ToolCards />
      </Sheet>

      <Sheet surface="ink" rise aria-labelledby="numbers-title" className="site-section">
        <NumbersSplit />
      </Sheet>

      <HomeFaq path="agent" className="pt-0" />
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
        title="Show us how the work moves today."
        line="We’ll look at where information enters the business, where context gets lost, which handoffs still depend on memory, and what Genesis should connect first."
        actions={
          <>
            <ConsultationButton href="/assessment">Assess My Business</ConsultationButton>
            <SwitchPathLink
              path="agent"
              className="inline-flex min-h-11 items-center gap-2.5 border-b border-ivory/35 font-bold text-ivory transition-colors duration-200 hover:border-gold-light hover:text-gold-light"
            >
              Try Genesis Tools
              <span aria-hidden="true">↗</span>
            </SwitchPathLink>
          </>
        }
      />
    </>
  );
}
