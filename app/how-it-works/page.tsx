import type { Metadata } from "next";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";
import { EngagementPath } from "@/components/sections/EngagementPath";
import { Reveal } from "@/components/ui/Reveal";
import { PageIntro, Section, SectionHeading } from "@/components/ui/Section";
import { processSteps } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "How It Works",
  "See what Genesis reviews, scopes, builds, and manages during a custom Infrastructure engagement.",
);

const stageDetails = [
  [
    "Current systems and responsibilities",
    "Highest-value operating friction",
    "Fit and recommended next step",
  ],
  [
    "Tools, access, and data flow",
    "Recommended scope and implementation order",
    "Paid Discovery or a focused Pilot only when warranted",
  ],
  [
    "In-scope provisioning and configuration",
    "Workflow and integration build",
    "Client access and adoption requirements",
  ],
  [
    "Daily use and validation",
    "Human approval points",
    "Go-live support",
  ],
  [
    "Monitoring and support",
    "Maintenance and workflow refinement",
    "Improvements within the agreed boundary",
  ],
];

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
];

export default function HowItWorksPage() {
  return (
    <>
      <PageIntro
        eyebrow="Genesis Infrastructure"
        title="What happens after you book a consultation."
        description="Genesis reviews the operation, confirms the scope, builds the agreed system, supports launch, and remains responsible for the ongoing work included in the engagement."
      />

      <Section tone="dark">
        <Reveal>
          <SectionHeading
            eyebrow="The engagement path"
            title="One path from first conversation to continuous operation."
            description="The consultation establishes fit and a recommended next step. Paid Discovery or a focused Pilot may be proposed when complexity warrants deeper scoping before implementation."
          />
        </Reveal>
        <Reveal delay={0.08}>
          <EngagementPath />
        </Reveal>
      </Section>

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="The process"
            title="A defined outcome at every stage."
            description="Scoping establishes the recommended boundary. Implementation produces the agreed system. Launch puts it into use. Ongoing management keeps the in-scope environment supported and current."
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
              eyebrow="What clients can expect"
              title="The boundary is established before the system changes."
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
        eyebrow="Begin with the review"
        title="Bring the current setup. Leave with a clearer next step."
        description="The Infrastructure consultation covers the existing environment, the work creating friction, and the starting scope Genesis would recommend."
        buttonLabel="Book an Infrastructure consultation"
      />
    </>
  );
}
