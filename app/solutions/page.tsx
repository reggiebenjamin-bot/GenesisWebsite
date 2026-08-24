import type { Metadata } from "next";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";
import { GenesisSystemScale } from "@/components/sections/GenesisSystemScale";
import { Reveal } from "@/components/ui/Reveal";
import { PageIntro, Section, SectionHeading } from "@/components/ui/Section";
import { audiences } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "Solutions",
  "See the four connected parts of the Genesis Applied AI system: operational infrastructure, data synthesis, optional CRM, and ongoing management.",
);

export default function SolutionsPage() {
  return (
    <>
      <PageIntro
        eyebrow="The Genesis System"
        title="Not four tools bolted together. One managed system built around the operation."
        description="A reusable Genesis platform powers the product. Managed delivery fits it to the operation. Together they create the system the client actually uses."
      />

      <Section>
        <GenesisSystemScale />
      </Section>

      <Section tone="dark">
        <Reveal>
          <SectionHeading
            eyebrow="Built around the operator"
            title="One platform, adapted to different deal operations."
            description="Scope changes with the team, volume, and complexity. The operating principle stays the same: connect the work, apply intelligence, and keep someone accountable for the system."
          />
        </Reveal>

        <div className="border-t border-line-dark">
          {audiences.map((audience, index) => (
            <Reveal
              key={audience.title}
              delay={index * 0.05}
              className="grid items-start gap-6 border-b border-line-dark py-10 lg:grid-cols-[80px_1fr_1fr] lg:gap-12"
            >
              <span className="font-display text-[0.7rem] text-gold">
                0{index + 1}
              </span>
              <div>
                <p className="font-display text-[0.66rem] tracking-[0.12em] text-gold-dark uppercase">
                  {audience.title}
                </p>
                <h3 className="mt-3 text-ivory">{audience.outcome}</h3>
              </div>
              <p className="text-muted-light">{audience.description}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <ConsultationCTA
        eyebrow="Find the right architecture"
        title="See what Genesis would connect inside your operation."
        description="Start with a focused consultation about the workflows, data, and handoffs your team is carrying today."
      />
    </>
  );
}
