import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { EvidenceFlow } from "@/components/sections/EvidenceFlow";
import { Card, ClosingBand, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { Eyebrow, PageIntro } from "@/components/ui/Section";
import { proofItems } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, graph } from "@/lib/schema";

export const metadata: Metadata = pageMetadata("/results");

const proofRequirements = [
  ["01", "A specific starting point", "Document what was happening before implementation."],
  [
    "02",
    "A defined system change",
    "Identify the workflow, infrastructure, or operating process Genesis actually changed.",
  ],
  [
    "03",
    "An attributable outcome",
    "Tie the result to source data or an approved client statement with enough context to understand what the number means.",
  ],
  [
    "04",
    "Permission to publish",
    "Receive clear approval for the names, quotes, logos, figures, and details being disclosed.",
  ],
] as const;

/** What proof may eventually measure, once verified history exists. Not claims. */
const futureMeasures = [
  "Lead response coverage",
  "Follow-up completion",
  "Processing time",
  "Pipeline completeness",
  "Missing-document rates",
  "Workflow completion",
  "Manual touches or handoffs",
  "Time between operational handoffs",
  "Capacity supported by a workflow",
  "Conversion movement where attribution is appropriate",
] as const;

export default function ResultsPage() {
  return (
    <>
      <JsonLd data={graph(breadcrumbSchema("/results"))} />

      <PageIntro
        eyebrow="Results"
        title="Proof should stay connected to the operation that produced it."
        description={[
          "Genesis does not publish client case studies, testimonials, or performance figures until the source, starting point, system change, attribution, and permission to publish are confirmed.",
          "Until then, illustrative examples remain illustrative.",
        ]}
      />

      <Sheet surface="ink" aria-labelledby="evidence-title" className="site-section">
        <SectionIntro
          layout="split"
          eyebrow="Evidence architecture"
          title="A result should remain connected to its source."
          titleId="evidence-title"
          aside={
            <p className="max-w-[44ch] text-[0.95rem] leading-relaxed text-muted-light">
              A useful business outcome needs more than an impressive number. Genesis should be able
              to show what was measured, where the record came from, what changed in the system, and
              what the result actually represents.
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
          title="Four things must be clear before Genesis calls something a result."
          titleId="standard-title"
          aside={
            <p className="max-w-[30ch] text-[0.95rem] text-muted-dark">
              If those conditions are not met, the claim stays off the page.
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

      <Sheet surface="paper" aria-labelledby="measure-title" className="site-section">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionIntro
              eyebrow="Future proof"
              title="Measure operations, not AI hype."
              titleId="measure-title"
              className="mb-6"
            />
            <p className="max-w-[46ch] text-[0.98rem] leading-relaxed text-muted-dark">
              As managed deployments create enough verified history, useful proof may include:
            </p>
          </div>

          <div>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {futureMeasures.map((measure) => (
                <li
                  key={measure}
                  className="flex items-baseline gap-3 rounded-2xl border border-line-light bg-white/60 px-4 py-3 text-[0.94rem] leading-snug"
                >
                  <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-gold" />
                  {measure}
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-[60ch] text-[0.92rem] leading-relaxed text-muted-dark">
              Results should only be published when the measurement method, source, context,
              attribution, and client permission support the claim.
            </p>
          </div>
        </div>
      </Sheet>

      <ClosingBand
        title="Define what success should look like before the build."
        line="A Genesis consultation can identify the current workflow, the proposed system change, and the operational signals worth measuring."
        actions={<ConsultationButton href="/contact" />}
      />
    </>
  );
}
