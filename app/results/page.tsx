import type { Metadata } from "next";
import { EvidenceFlow } from "@/components/sections/EvidenceFlow";
import { Card, ClosingBand, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { Eyebrow, PageIntro } from "@/components/ui/Section";
import { proofItems } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "Results",
  "See what Genesis can verify today and the evidence required before client results are published.",
);

const proofRequirements = [
  ["01", "A specific starting point", "What was happening before implementation."],
  ["02", "A defined system change", "What Genesis implemented, managed, or improved."],
  ["03", "An attributable outcome", "Supported by source data or an approved client statement."],
  ["04", "Permission to publish", "Clear approval for names, quotes, logos, or details."],
] as const;

export default function ResultsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Results"
        title="A clear line between verified facts and future client proof."
        description="No client case studies, testimonials, or performance figures are published here yet. Genesis will publish them only once the source, context, attribution, and permission are confirmed."
      />

      <Sheet surface="ink" aria-labelledby="evidence-title" className="site-section">
        <SectionIntro
          layout="split"
          eyebrow="Evidence architecture"
          title="A result should remain connected to its source."
          titleId="evidence-title"
          aside={
            <p className="max-w-[30ch] text-[0.95rem] text-muted-light">
              An illustrative model, not a client outcome.
            </p>
          }
        />
        <EvidenceFlow />
      </Sheet>

      {proofItems.length > 0 ? (
        <Sheet surface="paper" rise className="site-section">
          <div className="grid gap-12">
            {proofItems.map((item) => (
              <article key={item.slug} className="border-t border-line-light pt-8">
                <Eyebrow>Verified case study</Eyebrow>
                <h2 className="mt-4 text-[clamp(2rem,4vw,3.4rem)]">{item.client}</h2>
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
                  <p className="mt-6 text-[0.9rem] text-muted-dark italic">{item.attribution}</p>
                ) : null}
              </article>
            ))}
          </div>
        </Sheet>
      ) : null}

      <Sheet surface="paper" rise aria-labelledby="standard-title" className="site-section">
        <SectionIntro
          layout="split"
          eyebrow="The proof standard"
          title="What Genesis requires before calling something a result."
          titleId="standard-title"
          aside={
            <p className="max-w-[30ch] text-[0.95rem] text-muted-dark">
              All four, or it stays off the page.
            </p>
          }
        />

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {proofRequirements.map(([number, title, copy]) => (
            <Card key={number} as="li" className="flex flex-col">
              <span className="font-display text-[0.7rem] tracking-[0.14em] text-gold-dark">
                {number}
              </span>
              <h2 className="mt-5 text-[clamp(1.2rem,1.7vw,1.4rem)] leading-snug tracking-[-0.02em]">
                {title}
              </h2>
              <p className="mt-3 text-[0.92rem] leading-relaxed text-muted-dark">{copy}</p>
            </Card>
          ))}
        </ol>
      </Sheet>

      <Sheet surface="paper" aria-labelledby="today-title" className="site-section">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <SectionIntro
            eyebrow="What is verifiable today"
            title="The service boundary defines who remains responsible."
            titleId="today-title"
            className="mb-0"
          />
          <p className="self-center text-[1.02rem] leading-relaxed text-muted-dark">
            Current Genesis materials support the two-product model, the published starting
            prices, and ongoing monitoring, support, maintenance, and workflow refinement when
            those services are in scope. Client outcomes stay separate until they can be
            supported and attributed.
          </p>
        </div>
      </Sheet>

      <ClosingBand
        eyebrow="Evaluate the fit"
        title="Discuss the operation without relying on unsupported claims."
        line="The consultation reviews the current system, the proposed scope, and what can be measured."
        actions={
          <ConsultationButton href="/contact">Book an Infrastructure consultation</ConsultationButton>
        }
      />
    </>
  );
}
