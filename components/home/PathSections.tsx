import { ClosingBand, Sheet } from "@/components/ui/Blocks";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { HomeFaq } from "./HomeFaq";
import { ManagedBento } from "./ManagedBento";
import { OperatingThesis } from "./OperatingThesis";
import { PlanCards } from "./PlanCards";
import { ProcessTimeline } from "./ProcessTimeline";

/**
 * The homepage after the story: the thesis, what Managed AI does, the levels,
 * how an engagement runs, then the questions and the consultation.
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
        actions={<ConsultationButton href="/assessment">Assess My Business</ConsultationButton>}
      />
    </>
  );
}
