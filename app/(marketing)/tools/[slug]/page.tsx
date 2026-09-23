import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  DealArchitectMethod,
  ToolFacts,
  ToolHero,
  ToolOutputs,
  ToolStructure,
} from "@/components/tools/ToolPageSections";
import { SectionIntro, Sheet } from "@/components/ui/Blocks";
import { FaqList } from "@/components/ui/FaqList";
import { pageMetadata } from "@/lib/metadata";
import { genesisTools } from "@/lib/offers";
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
  const workspaceHref = `/workspace/${tool.id}`;

  return (
    <>
      <JsonLd data={graph(softwareApplicationSchema(tool), breadcrumbSchema(path))} />

      <ToolHero page={page} workspaceHref={workspaceHref} />

      {/* One sheet for both: two light sheets stacked would leave a hairline of
          the dark page between them. */}
      <Sheet surface="paper" aria-labelledby="facts-title" className="site-section">
        <ToolFacts page={page} />
        <div className="mt-[clamp(56px,7vw,96px)]">
          <ToolOutputs tool={tool} />
        </div>
      </Sheet>

      {tool.id === "deal-architect" ? (
        <Sheet surface="ink" rise aria-labelledby="method-title" className="site-section">
          <DealArchitectMethod />
        </Sheet>
      ) : null}

      {tool.id === "deal-packager" ? (
        <Sheet surface="ink" rise aria-labelledby="structure-title" className="site-section">
          <ToolStructure
            tool={tool}
            eyebrow="From inputs to package"
            title="Turn raw deal material into one clear package."
            note={{
              title: "You stay in control",
              body: "Deal Packager structures the material you provide. Review and approve every section before you export or share it.",
            }}
          />
        </Sheet>
      ) : null}

      {tool.id === "capital-advisor" ? (
        <Sheet surface="ink" rise aria-labelledby="structure-title" className="site-section">
          <ToolStructure
            tool={tool}
            eyebrow={tool.structure.label}
            title="Review the capital plan before you make the request."
            note={{
              title: "Illustrative, not an offer",
              body: "Capital Advisor reviews the assumptions you provide. It does not promise approval, rates, terms, or financing.",
            }}
          />
        </Sheet>
      ) : null}

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

    </>
  );
}
