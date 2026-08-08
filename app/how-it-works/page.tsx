import type { Metadata } from "next";
import { ConsultationCTA, PageIntro, SectionHeading } from "@/components/Shared";
import { Reveal } from "@/components/Reveal";
import { processSteps } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "How It Works",
  "From consultation and system design through implementation, support, and ongoing improvement.",
);

const stageDetails = [
  ["Current tools and responsibilities", "Operational bottlenecks", "Priority outcomes"],
  ["System architecture", "Workflow priorities", "Implementation sequence"],
  ["Foundation provisioning", "Workflow configuration", "Focused adoption"],
  ["Support and maintenance", "Monitoring", "Continuous improvement"],
];

export default function HowItWorksPage() {
  return (
    <>
      <PageIntro
        eyebrow="How it works"
        title="A practical path from consultation to continuous improvement."
        description="Genesis starts with how the operation works today, implements in focused stages, and stays involved after launch."
      />
      <section className="section section-ivory">
        <div className="shell">
          <Reveal>
            <SectionHeading
              eyebrow="The process"
              title="Clear decisions at every stage."
              description="The goal is a system your operation can actually use—not a long transformation project that loses momentum."
            />
          </Reveal>
          <div className="process-timeline">
            {processSteps.map((step, index) => (
              <Reveal key={step.number} className="timeline-step" delay={index * 0.06}>
                <div className="timeline-step__number">{step.number}</div>
                <div className="timeline-step__body">
                  <h2>{step.title}</h2>
                  <p>{step.description}</p>
                </div>
                <ul>
                  {stageDetails[index].map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section process-principles section-dark">
        <div className="shell process-principles__grid">
          <Reveal>
            <SectionHeading
              light
              eyebrow="Implementation principles"
              title="Useful from the beginning. Managed for the long term."
            />
          </Reveal>
          <div className="principle-list">
            {[
              ["Start with the work", "Technology follows the operational need."],
              ["Build in stages", "Focused releases keep the system understandable and usable."],
              ["Stay accountable", "Management continues after implementation."],
            ].map(([title, copy], index) => (
              <Reveal key={title} className="principle" delay={index * 0.05}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <ConsultationCTA />
    </>
  );
}
