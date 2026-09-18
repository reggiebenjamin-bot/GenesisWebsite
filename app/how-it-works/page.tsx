import type { Metadata } from "next";
import { EngagementPath } from "@/components/sections/EngagementPath";
import { ProcessStages } from "@/components/sections/ProcessStages";
import { Card, ClosingBand, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { PageIntro } from "@/components/ui/Section";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "How It Works",
  "See what Genesis reviews, scopes, builds, and manages during a custom Infrastructure engagement.",
);

const principles = [
  [
    "Start with the current operation",
    "Genesis reviews the systems and manual work already in place before recommending changes.",
  ],
  [
    "Confirm the scope first",
    "The implementation priorities, required access, and client responsibilities are documented before the build begins.",
  ],
  [
    "Keep one accountable owner",
    "When ongoing management is included, Genesis continues monitoring, supporting, maintaining, and refining the agreed system.",
  ],
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <PageIntro
        eyebrow="Genesis Infrastructure"
        title="What happens after you book a consultation."
        description="Review the operation, confirm the scope, build the agreed system, support launch, stay responsible for what is in scope."
      />

      <Sheet surface="ink" aria-labelledby="path-title" className="site-section">
        <SectionIntro
          layout="split"
          eyebrow="The engagement path"
          title="One path from first conversation to continuous operation."
          titleId="path-title"
          aside={
            <p className="max-w-[30ch] text-[0.95rem] text-muted-light">
              Deeper scoping is proposed only when complexity warrants it.
            </p>
          }
        />
        <EngagementPath />
      </Sheet>

      <Sheet surface="paper" rise aria-labelledby="process-title" className="site-section">
        <SectionIntro
          layout="split"
          eyebrow="The process"
          title="A defined outcome at every stage."
          titleId="process-title"
          aside={
            <p className="max-w-[30ch] text-[0.95rem] text-muted-dark">
              Five stages, each with something to show for it.
            </p>
          }
        />

        <ProcessStages />

      </Sheet>

      <Sheet surface="paper" aria-labelledby="expect-title" className="site-section">
        <SectionIntro
          eyebrow="What clients can expect"
          title="The boundary is established before the system changes."
          titleId="expect-title"
        />

        <ul className="grid gap-4 md:grid-cols-3">
          {principles.map(([title, copy]) => (
            <Card key={title} as="li">
              <h3 className="text-[clamp(1.2rem,1.7vw,1.4rem)] leading-snug tracking-[-0.02em]">
                {title}
              </h3>
              <p className="mt-4 text-[0.94rem] leading-relaxed text-muted-dark">{copy}</p>
            </Card>
          ))}
        </ul>
      </Sheet>

      <ClosingBand
        eyebrow="Begin with the review"
        title="Bring the current setup. Leave with a clearer next step."
        line="The consultation covers the existing environment, the work creating friction, and the scope Genesis would recommend."
        actions={
          <ConsultationButton href="/contact">Book an Infrastructure consultation</ConsultationButton>
        }
      />
    </>
  );
}
