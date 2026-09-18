import type { Metadata } from "next";
import { DealReportPreview } from "@/components/offers/DealReportPreview";
import { ToolDetailCards } from "@/components/offers/ToolDetailCards";
import { ToolFlow } from "@/components/home/ToolFlow";
import { ClosingBand, Points, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { TextLink } from "@/components/ui/Button";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { PageIntro } from "@/components/ui/Section";
import { contact } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import {
  dataProvenance,
  dataProvenanceMeaning,
  neverFabricated,
  numbersHandled,
  TOOLS_INTEREST_SUBJECT,
  toolsOverview,
  toolsToManaged,
} from "@/lib/offers";

export const metadata: Metadata = pageMetadata(
  "Genesis Tools",
  "Focused, self-service AI applications for real estate professionals: Deal Architect, Funding Ready, and Deal Desk.",
);

/**
 * The Agent path: Genesis Tools. Kept at /mini so every existing link to the
 * agent offer still resolves.
 */
export default function ToolsPage() {
  const interestHref = `mailto:${contact.email}?subject=${encodeURIComponent(
    TOOLS_INTEREST_SUBJECT,
  )}`;

  return (
    <>
      <PageIntro
        eyebrow={toolsOverview.product}
        title={toolsOverview.invitation.title}
        description={toolsOverview.invitation.description}
      />

      <Sheet surface="paper" aria-labelledby="tools-title" className="site-section">
        <SectionIntro
          layout="split"
          eyebrow="Three focused tools"
          title={toolsOverview.headline}
          titleId="tools-title"
          aside={
            <p className="max-w-[32ch] text-[0.95rem] text-muted-dark">
              {toolsOverview.summary} Deal Desk is the recurring one.
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
              <span className="text-ivory">Never fabricated:</span>{" "}
              {neverFabricated.join(", ").toLowerCase()}.
            </p>
          </div>
        </div>
      </Sheet>

      <Sheet surface="paper" rise aria-labelledby="journey-title" className="site-section">
        <SectionIntro
          eyebrow="How the tools connect"
          title="One tool leads to the next."
          titleId="journey-title"
        />
        <ToolFlow />

        <div className="mt-[clamp(36px,5vw,56px)] flex flex-wrap items-center justify-between gap-x-10 gap-y-4 border-t border-line-light pt-8">
          <p className="max-w-[46ch] text-[0.98rem] text-muted-dark">{toolsToManaged.question}</p>
          <TextLink href="/#custom-infrastructure">{toolsToManaged.action}</TextLink>
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
