import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { DealReportPreview } from "@/components/offers/DealReportPreview";
import { ToolDetailCards } from "@/components/offers/ToolDetailCards";
import { ToolFlow } from "@/components/home/ToolFlow";
import { ClosingBand, Points, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { TextLink } from "@/components/ui/Button";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { FaqList } from "@/components/ui/FaqList";
import { PageIntro } from "@/components/ui/Section";
import { contact, toolFaqs } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, graph, toolsCollectionSchema } from "@/lib/schema";
import {
  dataProvenance,
  dataProvenanceMeaning,
  neverFabricatedSentence,
  numbersHandled,
  toolFlow,
  TOOLS_INTEREST_SUBJECT,
  toolsOverview,
  toolsToManaged,
} from "@/lib/offers";

export const metadata: Metadata = pageMetadata("/tools");

/**
 * The Agent path: Genesis Tools, the three tools side by side. Each tool has
 * its own page under /tools/; this one compares them. It lived at /mini, which
 * now redirects here.
 */
export default function ToolsPage() {
  const interestHref = `mailto:${contact.email}?subject=${encodeURIComponent(
    TOOLS_INTEREST_SUBJECT,
  )}`;

  return (
    <>
      <JsonLd data={graph(toolsCollectionSchema(), breadcrumbSchema("/tools"))} />

      <PageIntro
        eyebrow={toolsOverview.product}
        title={toolsOverview.page.headline}
        description={toolsOverview.page.summary}
        actions={<ConsultationButton href={interestHref}>{toolsOverview.page.cta}</ConsultationButton>}
      />

      <Sheet surface="paper" aria-labelledby="tools-title" className="site-section">
        <SectionIntro
          layout="split"
          eyebrow={toolsOverview.page.introEyebrow}
          title={toolsOverview.page.introHeadline}
          titleId="tools-title"
          aside={
            <p className="max-w-[40ch] text-[0.95rem] leading-relaxed text-muted-dark">
              {toolsOverview.page.introBody}
            </p>
          }
        />

        <ToolDetailCards />
      </Sheet>

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

            <dl className="mt-10 grid gap-0 border-t border-line-dark">
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
          </div>

          <div className="min-w-0">
            <DealReportPreview className="bg-paper" />
            <p className="mt-6 text-[0.88rem] leading-relaxed text-muted-light">
              {neverFabricatedSentence}
            </p>
          </div>
        </div>
      </Sheet>

      <Sheet surface="paper" rise aria-labelledby="journey-title" className="site-section">
        <SectionIntro eyebrow={toolFlow.eyebrow} title={toolFlow.headline} titleId="journey-title" />
        <ToolFlow />

        <div className="mt-[clamp(36px,5vw,56px)] flex flex-wrap items-center justify-between gap-x-10 gap-y-4 border-t border-line-light pt-8">
          <div className="max-w-[56ch]">
            <p className="text-[1.15rem] leading-snug tracking-[-0.01em]">{toolsToManaged.headline}</p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-dark">{toolsToManaged.body}</p>
          </div>
          <TextLink href="/#custom-infrastructure">{toolsToManaged.action}</TextLink>
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

      <ClosingBand
        eyebrow={toolsOverview.product}
        title="Ask about Genesis Tools."
        actions={<ConsultationButton href={interestHref}>Ask About Tools</ConsultationButton>}
        footnote="This email does not create an account, start a purchase, reserve a price, or grant product access."
      />
    </>
  );
}
