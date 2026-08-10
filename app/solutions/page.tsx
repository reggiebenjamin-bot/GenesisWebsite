import type { Metadata } from "next";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";
import { GenesisSystemScale } from "@/components/sections/GenesisSystemScale";
import { Reveal } from "@/components/ui/Reveal";
import { PageIntro, Section, SectionHeading } from "@/components/ui/Section";
import { audiences } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "Solutions",
  "See how Genesis connects Microsoft 365, practical AI workflows, an optional CRM, and ongoing management into one operating system.",
);

export default function SolutionsPage() {
  return (
    <>
      <PageIntro
        eyebrow="The Genesis system"
        title="Infrastructure, workflows, and support—designed as one managed system."
        description="Genesis connects the foundational tools, practical automation, and ongoing management that help real-estate operations move with more speed and consistency."
      />

      <Section>
        <GenesisSystemScale />
      </Section>

      <Section tone="dark">
        <Reveal>
          <SectionHeading
            eyebrow="Use cases"
            title="One architecture, adapted to the way you operate."
            description="The system changes in scope—not in principle—as responsibilities, volume, and complexity increase."
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

      <ConsultationCTA />
    </>
  );
}
