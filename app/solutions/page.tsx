import type { Metadata } from "next";
import { ConsultationCTA, PageIntro, SectionHeading } from "@/components/Shared";
import { SystemLayers } from "@/components/SystemLayers";
import { Reveal } from "@/components/Reveal";
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
      <section className="section section-ivory">
        <div className="shell">
          <Reveal>
            <SectionHeading
              eyebrow="Connected by design"
              title="The four layers of the operating system."
              description="This is not a menu of unrelated services. Each layer gives the next one a stronger place to work."
            />
          </Reveal>
          <SystemLayers />
        </div>
      </section>
      <section className="section section-dark">
        <div className="shell">
          <Reveal>
            <SectionHeading
              light
              eyebrow="Use cases"
              title="One architecture, adapted to the way you operate."
              description="The system changes in scope—not in principle—as responsibilities, volume, and complexity increase."
            />
          </Reveal>
          <div className="audience-list">
            {audiences.map((audience, index) => (
              <Reveal key={audience.title} className="audience-row" delay={index * 0.05}>
                <span>0{index + 1}</span>
                <div>
                  <p>{audience.title}</p>
                  <h3>{audience.outcome}</h3>
                </div>
                <p>{audience.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <ConsultationCTA />
    </>
  );
}
