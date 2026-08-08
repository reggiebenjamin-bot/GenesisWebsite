import type { Metadata } from "next";
import { ConsultationCTA, PageIntro, SectionHeading } from "@/components/Shared";
import { Reveal } from "@/components/Reveal";
import { proofItems } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "Results",
  "The Genesis AI standard for publishing verified case studies, testimonials, and operating results.",
);

const proofRequirements = [
  ["01", "A specific starting point", "What was happening before implementation and why change was needed."],
  ["02", "A defined system change", "What Genesis implemented, managed, or improved."],
  ["03", "An attributable outcome", "A result supported by source data or an approved client statement."],
  ["04", "Permission to publish", "Clear approval for names, quotes, logos, or identifying details."],
] as const;

export default function ResultsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Results"
        title="Credibility is built with evidence—not decorated with claims."
        description="Genesis publishes client outcomes only when the source, context, and permission are verified. No unsupported testimonials or performance figures are shown."
      />
      {proofItems.length > 0 ? (
        <section className="section section-ivory">
          <div className="shell case-study-list">
            {proofItems.map((item) => (
              <article className="case-study" key={item.slug}>
                <p className="eyebrow">Verified case study</p>
                <h2>{item.client}</h2>
                <dl>
                  <div><dt>Starting point</dt><dd>{item.challenge}</dd></div>
                  <div><dt>Implementation</dt><dd>{item.implementation}</dd></div>
                  <div><dt>Outcome</dt><dd>{item.outcome}</dd></div>
                </dl>
                {item.attribution ? <p>{item.attribution}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <section className="section section-ivory">
        <div className="shell results-grid">
          <Reveal>
            <SectionHeading
              eyebrow="The proof standard"
              title="What belongs in a Genesis case study."
              description="The publishing system is ready for verified work without presenting placeholders as proof."
            />
          </Reveal>
          <div className="proof-requirements">
            {proofRequirements.map(([number, title, copy], index) => (
              <Reveal key={number} className="proof-requirement" delay={index * 0.05}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section results-accountability section-dark">
        <div className="shell results-accountability__grid">
          <Reveal>
            <p className="eyebrow">What is verifiable today</p>
            <h2>Genesis remains involved after implementation.</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p>
              The supplied service model includes monitoring, support,
              maintenance, and ongoing improvement. That continuing ownership is
              built into every plan—not sold as an afterthought.
            </p>
          </Reveal>
        </div>
      </section>
      <ConsultationCTA />
    </>
  );
}
