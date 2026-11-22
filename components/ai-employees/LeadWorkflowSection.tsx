import { Eyebrow } from "@/components/ui/Section";
import { leadWorkflowIntro } from "@/lib/leadWorkflow";
import { LeadWorkflow } from "./LeadWorkflow";

/** How the four employees work one lead. Illustrative, with the software line beside it. */
export function LeadWorkflowSection({
  titleId = "lead-workflow-title",
  onDark = false,
}: {
  titleId?: string;
  onDark?: boolean;
}) {
  const muted = onDark ? "text-muted-light" : "text-muted-dark";

  return (
    <div>
      <div className="mx-auto mb-[clamp(28px,4vw,40px)] max-w-[44rem] text-center">
        <Eyebrow>{leadWorkflowIntro.eyebrow}</Eyebrow>
        <h2
          id={titleId}
          className="mt-4 font-light text-[clamp(2.2rem,4.4vw,3.6rem)] leading-[1.02] tracking-[-0.045em] text-balance"
        >
          {leadWorkflowIntro.title}
        </h2>
        <p className={`mx-auto mt-5 max-w-[46ch] text-[1.02rem] leading-relaxed ${muted}`}>
          {leadWorkflowIntro.summary}
        </p>
      </div>
      <LeadWorkflow />
      <p className={`mx-auto mt-8 max-w-[56ch] text-center text-[0.84rem] leading-relaxed ${muted}`}>
        {leadWorkflowIntro.disclaimer}
      </p>
    </div>
  );
}
