import type { Metadata } from "next";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";
import { EvidenceFlow } from "@/components/sections/EvidenceFlow";
import { Reveal } from "@/components/ui/Reveal";
import {
  Eyebrow,
  PageIntro,
  Section,
  SectionHeading,
} from "@/components/ui/Section";
import { proofItems } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "Results",
  "See what Genesis can verify today and the evidence required before client results are published.",
);

const proofRequirements = [
  [
    "01",
    "A specific starting point",
    "What was happening before implementation and why change was needed.",
  ],
  [
    "02",
    "A defined system change",
    "What Genesis implemented, managed, or improved.",
  ],
  [
    "03",
    "An attributable outcome",
    "A result supported by source data or an approved client statement.",
  ],
  [
    "04",
    "Permission to publish",
    "Clear approval for names, quotes, logos, or identifying details.",
  ],
] as const;

export default function ResultsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Results"
        title="A clear line between verified facts and future client proof."
        description="No approved client case studies, testimonials, or performance figures are presented here yet. Genesis will publish them only when the source, context, attribution, and permission are confirmed."
      />

      <Section tone="dark">
        <Reveal>
          <SectionHeading
            eyebrow="Evidence architecture"
            title="A result should remain connected to its source."
            description="This illustrative model shows the standard: define the starting state, identify the system change, measure from source records, and keep unsupported conclusions out of the story."
          />
        </Reveal>
        <Reveal delay={0.08}>
          <EvidenceFlow />
        </Reveal>
      </Section>

      {proofItems.length > 0 ? (
        <Section>
          <div className="grid gap-12">
            {proofItems.map((item) => (
              <article
                key={item.slug}
                className="border-t border-line-light pt-8"
              >
                <Eyebrow>Verified case study</Eyebrow>
                <h2 className="mt-4 text-[clamp(2rem,4vw,3.4rem)]">
                  {item.client}
                </h2>
                <dl className="mt-8 grid gap-6 md:grid-cols-3">
                  {[
                    ["Starting point", item.challenge],
                    ["Implementation", item.implementation],
                    ["Outcome", item.outcome],
                  ].map(([term, detail]) => (
                    <div key={term}>
                      <dt className="font-display text-[0.66rem] tracking-[0.14em] text-gold-dark uppercase">
                        {term}
                      </dt>
                      <dd className="mt-3 text-muted-dark">{detail}</dd>
                    </div>
                  ))}
                </dl>
                {item.attribution ? (
                  <p className="mt-6 text-[0.9rem] text-muted-dark italic">
                    {item.attribution}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <SectionHeading
              eyebrow="The proof standard"
              title="What Genesis requires before calling something a result."
              description="A case study must explain the starting condition, the work completed, the supported outcome, and who approved publication."
            />
          </Reveal>
          <div className="grid gap-8">
            {proofRequirements.map(([number, title, copy], index) => (
              <Reveal
                key={number}
                delay={index * 0.05}
                className="border-t border-line-light pt-6"
              >
                <span className="font-display text-[0.68rem] text-gold-dark">
                  {number}
                </span>
                <h3 className="mt-4">{title}</h3>
                <p className="mt-3 text-muted-dark">{copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="dark">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <Eyebrow>What is verifiable today</Eyebrow>
            <h2 className="mt-5 text-[clamp(2.4rem,5vw,5rem)]">
              The service boundary defines who remains responsible.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-muted-light">
              The current Genesis materials support the two-product model, the
              published Infrastructure starting prices, and ongoing monitoring, support,
              maintenance, and workflow refinement when those services are in
              scope. Client outcomes remain separate until they can be supported
              and attributed.
            </p>
          </Reveal>
        </div>
      </Section>

      <ConsultationCTA
        eyebrow="Evaluate the fit"
        title="Discuss the operation without relying on unsupported claims."
        description="The Infrastructure consultation reviews the current system, the proposed scope, and what can be measured before you decide to proceed."
        buttonLabel="Book an Infrastructure consultation"
      />
    </>
  );
}
