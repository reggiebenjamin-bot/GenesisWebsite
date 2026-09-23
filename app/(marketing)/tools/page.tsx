import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { DealReportPreview } from "@/components/offers/DealReportPreview";
import { ToolCatalog } from "@/components/tools/ToolPageSections";
import { Points, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { FaqList } from "@/components/ui/FaqList";
import { Eyebrow } from "@/components/ui/Section";
import { toolFaqs } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, graph, toolsCollectionSchema } from "@/lib/schema";
import {
  dataProvenance,
  dataProvenanceMeaning,
  neverFabricatedSentence,
  numbersHandled,
  toolsOverview,
} from "@/lib/offers";

export const metadata: Metadata = pageMetadata("/tools");

/**
 * The public catalog explains the three independent jobs. Each choice opens
 * its selected product page with a read-only example and free brief.
 */
export default function ToolsPage() {
  return (
    <>
      <JsonLd data={graph(toolsCollectionSchema(), breadcrumbSchema("/tools"))} />

      <section className="border-b border-line-dark bg-ink pt-[calc(var(--header-height)+clamp(36px,5vw,68px))] pb-[clamp(56px,8vw,104px)] text-ivory">
        <div className="shell">
          <div className="max-w-[760px]">
            <Eyebrow>{toolsOverview.product}</Eyebrow>
            <h1 className="mt-5 max-w-[12ch] text-[clamp(3rem,6.2vw,6.25rem)] leading-[0.98] tracking-[-0.055em] text-balance">
              Three jobs. Three focused products.
            </h1>
            <p className="mt-5 max-w-[54ch] text-[clamp(1rem,1.5vw,1.2rem)] leading-relaxed text-ivory/72">
              View an example without paying. Prepare your own brief for free, then pay once for the finished result.
            </p>
          </div>
          <div className="mt-[clamp(36px,5vw,64px)]">
            <ToolCatalog />
          </div>
        </div>
      </section>

      <Sheet surface="ink" rise aria-labelledby="numbers-title" className="site-section">
        <div className="grid items-center gap-[clamp(40px,6vw,88px)] lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionIntro
              eyebrow="How the numbers are handled"
              title={numbersHandled.title}
              titleId="numbers-title"
              className="mb-8"
            />
            <Points items={numbersHandled.points} />

            <details className="group mt-9 border-t border-line-dark">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-[0.94rem] font-medium [&::-webkit-details-marker]:hidden">
                How figures are labeled
                <span aria-hidden="true" className="text-xl leading-none transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none">+</span>
              </summary>
              <dl className="grid gap-0 border-t border-line-dark">
                {dataProvenance.map((label) => (
                  <div
                    key={label}
                    className="grid gap-1 border-b border-line-dark py-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6"
                  >
                    <dt className="font-display text-[0.62rem] leading-6 tracking-[0.14em] text-gold uppercase">
                      {label}
                    </dt>
                    <dd className="text-[0.92rem] text-ivory/80">{dataProvenanceMeaning[label]}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </div>

          <div className="min-w-0">
            <DealReportPreview className="bg-paper" />
            <p className="mt-6 text-[0.88rem] leading-relaxed text-muted-light">
              {neverFabricatedSentence}
            </p>
          </div>
        </div>
      </Sheet>

      <Sheet surface="paper" aria-labelledby="tools-faq-title" className="site-section">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionIntro
            eyebrow="FAQ"
            title="Genesis Tools questions."
            titleId="tools-faq-title"
            className="mb-0"
          />
          <FaqList items={toolFaqs} />
        </div>
      </Sheet>

    </>
  );
}
