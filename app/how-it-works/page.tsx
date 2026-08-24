import type { Metadata } from "next";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";
import { Reveal } from "@/components/ui/Reveal";
import { PageIntro, Section, SectionHeading } from "@/components/ui/Section";
import { processSteps } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "How It Works",
  "Follow the Genesis path from a free consultation and paid Discovery through implementation, launch, and ongoing platform management.",
);

const stageDetails = [
  ["Current operating reality", "Highest-value friction", "Fit and next step"],
  ["Tools and data flow", "Written scope and roadmap", "Optional Pilot branch"],
  ["Platform provisioning", "Workflow and integration build", "Focused adoption"],
  ["Daily use and validation", "Human approval points", "Go-live support"],
  ["Monitoring and support", "Workflow refinement", "Continuous improvement"],
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
        eyebrow="The Genesis System"
        title="Underwrite the operation. Build what matters. Keep it running."
        description="Genesis treats an operation with the same discipline a deal receives before capital moves: understand it, quantify it, build deliberately, launch, and continue operating the system."
      />

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="The process"
            title="A commercial path with a useful outcome at every stage."
            description="Discovery produces a roadmap. Implementation produces a working platform. Managed service keeps that platform accountable after launch."
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

      <ConsultationCTA
        eyebrow="Start at the beginning"
        title="Bring the bottleneck. Leave with a clear next step."
        description="The first consultation is free and focused on how the operation runs today—not a generic software demonstration."
      />
    </>
  );
}
