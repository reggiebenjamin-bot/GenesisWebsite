import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  DealArchitectMethod,
  ToolFacts,
  ToolHero,
  ToolJourneyStrip,
  ToolOutputs,
  ToolStructure,
} from "@/components/tools/ToolPageSections";
import { ClosingBand, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { TextLink } from "@/components/ui/Button";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { FaqList } from "@/components/ui/FaqList";
import { contact } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { genesisTools, TOOLS_INTEREST_SUBJECT } from "@/lib/offers";
import { breadcrumbSchema, graph, softwareApplicationSchema } from "@/lib/schema";
import { isToolId, toolPages } from "@/lib/toolPages";

type Props = { params: Promise<{ slug: string }> };

/* One page per tool, generated at build time. Anything else under /tools/ is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return genesisTools.map((tool) => ({ slug: tool.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return pageMetadata(`/tools/${slug}`);
}

/**
 * A tool's own page: the page that answers a search for what this tool does.
 * The homepage and the tools overview introduce the tools; each tool's
 * task-level searches land here.
 */
export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  if (!isToolId(slug)) notFound();

  const page = toolPages[slug];
  const { tool } = page;
  const path = `/tools/${tool.id}`;
  const interestHref = `mailto:${contact.email}?subject=${encodeURIComponent(
    `${TOOLS_INTEREST_SUBJECT}: ${tool.name}`,
  )}`;

  return (
    <>
      <JsonLd data={graph(softwareApplicationSchema(tool), breadcrumbSchema(path))} />

      <ToolHero page={page} interestHref={interestHref} />

      {/* One sheet for both: two light sheets stacked would leave a hairline of
          the dark page between them. */}
      <Sheet surface="paper" aria-labelledby="facts-title" className="site-section">
        <ToolFacts page={page} />
        <div className="mt-[clamp(88px,10vw,136px)]">
          <ToolOutputs tool={tool} />
        </div>
      </Sheet>

      {tool.id === "deal-architect" ? (
        <Sheet surface="ink" rise aria-labelledby="method-title" className="site-section">
          <DealArchitectMethod />
        </Sheet>
      ) : null}

      {tool.id === "funding-ready" ? (
        <Sheet surface="ink" rise aria-labelledby="structure-title" className="site-section">
          <ToolStructure
            tool={tool}
            eyebrow="Intake"
            title="Five parts, one lender-ready package."
            note={{
              title: "No guarantees",
              body: "Funding Ready prepares the information. It does not promise approval, rates, terms, or financing. Approval, pricing, terms, and lending decisions remain with the appropriate lender and decision-makers.",
            }}
          />
        </Sheet>
      ) : null}

      {tool.id === "deal-desk" ? (
        <Sheet surface="ink" rise aria-labelledby="structure-title" className="site-section">
          <ToolStructure
            tool={tool}
            eyebrow={tool.structure.label}
            title="What Deal Desk works from."
          />
        </Sheet>
      ) : null}

      <Sheet surface="paper" rise aria-labelledby="journey-title" className="site-section">
        <ToolJourneyStrip current={tool.id} />
      </Sheet>

      <Sheet surface="paper" aria-labelledby="tool-faq-title" className="site-section">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionIntro
            eyebrow="FAQ"
            title={`${tool.name} questions.`}
            titleId="tool-faq-title"
            className="mb-0"
          />
          <FaqList items={page.faqs} />
        </div>
      </Sheet>

      <ClosingBand
        eyebrow="Genesis Tools"
        title={`Ask about ${tool.name}.`}
        actions={
          <>
            <ConsultationButton href={interestHref}>Ask About {tool.name}</ConsultationButton>
            <TextLink light href="/tools">
              See all three tools
            </TextLink>
          </>
        }
        footnote="This email does not create an account, start a purchase, reserve a price, or grant product access."
      />
    </>
  );
}
