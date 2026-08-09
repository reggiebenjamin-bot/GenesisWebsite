import type { Metadata } from "next";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";
import { Reveal } from "@/components/ui/Reveal";
import { PageIntro, Section, SectionHeading } from "@/components/ui/Section";
import { processSteps } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "How It Works",
  "From consultation and system design through implementation, support, and ongoing improvement.",
);

const stageDetails = [
  [
    "Current tools and responsibilities",
    "Operational bottlenecks",
    "Priority outcomes",
  ],
  ["System architecture", "Workflow priorities", "Implementation sequence"],
  ["Foundation provisioning", "Workflow configuration", "Focused adoption"],
  ["Support and maintenance", "Monitoring", "Continuous improvement"],
];

const principles = [
  ["Start with the work", "Technology follows the operational need."],
  [
    "Build in stages",
    "Focused releases keep the system understandable and usable.",
  ],
  ["Stay accountable", "Management continues after implementation."],
];

export default function HowItWorksPage() {
  return (
    <>
      <PageIntro
        eyebrow="How it works"
        title="A practical path from consultation to continuous improvement."
        description="Genesis starts with how the operation works today, implements in focused stages, and stays involved after launch."
      />

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="The process"
            title="Clear decisions at every stage."
            description="The goal is a system your operation can actually use—not a long transformation project that loses momentum."
          />
        </Reveal>

        <div className="border-t border-line-light">
          {processSteps.map((step, index) => (
            <Reveal
              key={step.number}
              delay={index * 0.06}
              className="grid items-start gap-6 border-b border-line-light py-12 lg:grid-cols-[80px_1.4fr_1fr] lg:gap-12"
            >
              <div className="font-display text-[0.7rem] text-gold-dark">
                {step.number}
              </div>
              <div>
                <h2 className="text-[clamp(1.6rem,2.6vw,2.4rem)]">
                  {step.title}
                </h2>
                <p className="mt-4 text-muted-dark">{step.description}</p>
              </div>
              <ul>
                {stageDetails[index].map((detail) => (
                  <li
                    key={detail}
                    className="relative py-1.5 pl-[18px] text-[0.92rem] text-muted-dark before:absolute before:top-[15px] before:left-0 before:size-1.5 before:bg-gold before:content-['']"
                  >
                    {detail}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="dark">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <SectionHeading
              eyebrow="Implementation principles"
              title="Useful from the beginning. Managed for the long term."
            />
          </Reveal>
          <div className="grid gap-8">
            {principles.map(([title, copy], index) => (
              <Reveal
                key={title}
                delay={index * 0.05}
                className="border-t border-line-dark pt-6"
              >
                <h3 className="text-ivory">{title}</h3>
                <p className="mt-3 text-muted-light">{copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <ConsultationCTA />
    </>
  );
}
