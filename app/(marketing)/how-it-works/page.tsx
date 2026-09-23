import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { EngagementPath } from "@/components/sections/EngagementPath";
import { ProcessStages } from "@/components/sections/ProcessStages";
import { Card, ClosingBand, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { TextLink } from "@/components/ui/Button";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { Eyebrow, PageIntro } from "@/components/ui/Section";
import { pageMetadata } from "@/lib/metadata";
import { offerPaths } from "@/lib/offers";
import { breadcrumbSchema, graph } from "@/lib/schema";

export const metadata: Metadata = pageMetadata("/how-it-works");

const [toolsPath, managedPath] = offerPaths;

/** The two ways to use Genesis: the scope determines the product. */
const ways = [
  {
    eyebrow: toolsPath.product,
    quote: toolsPath.distinction,
    body: "Bring Genesis a defined problem: analyze an opportunity, organize a financing request, or work through an active transaction.",
    action: { label: "Explore Genesis Tools", href: "/tools" },
    tone: "light",
  },
  {
    eyebrow: managedPath.product,
    quote: managedPath.distinction,
    body: "Genesis maps and connects the systems, data, workflows, communication, automation, and AI capabilities behind the broader operation.",
    action: { label: "Explore Custom Infrastructure", href: "/solutions" },
    tone: "inverse",
  },
] as const;

/** Where work repeatedly slows down or loses context. */
const weight = [
  "Leads that arrive but are not consistently worked.",
  "Follow-up that depends on someone remembering.",
  "Information copied between systems.",
  "Documents that have to be chased manually.",
  "Pipeline status that is difficult to trust.",
  "Handoffs where context disappears.",
  "Questions that require gathering information from five different places.",
  "Knowledge that lives inside one person's head.",
  "Repeatable work that still has to be manually coordinated.",
] as const;

/** What intelligence may do, what it must not pretend to be, and what stays fixed. */
const judgment = [
  "Genesis can classify, summarize, generate, organize, identify missing information, select defined workflows, and reason over supplied business context.",
  "It should not pretend an AI model is a lender, appraiser, attorney, database, calculator, or final authority.",
  "Deterministic calculations remain deterministic. Structured facts remain sourced. Missing information remains missing. Decisions requiring professional, regulated, or business judgment remain with the appropriate people.",
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd data={graph(breadcrumbSchema("/how-it-works"))} />

      <PageIntro
        eyebrow="How Genesis Works"
        title="Start with the workflow, not the AI."
        description={[
          "Before Genesis automates anything, we need to understand how the work actually moves: where information enters, what systems carry it, where context gets lost, which handoffs depend on people, and where human judgment still belongs.",
          "Then we build the infrastructure around that reality.",
        ]}
        actions={<ConsultationButton href="/assessment">Assess My Business</ConsultationButton>}
      />

      <Sheet surface="paper" aria-labelledby="ways-title" className="site-section">
        <SectionIntro title="The scope determines the product." titleId="ways-title" />

        <ul className="grid gap-4 md:grid-cols-2">
          {ways.map((way) => (
            <Card key={way.eyebrow} as="li" tone={way.tone} className="flex flex-col">
              <Eyebrow className={way.tone === "inverse" ? "text-gold" : "text-gold-dark"}>
                {way.eyebrow}
              </Eyebrow>
              <p className="mt-5 text-[clamp(1.5rem,2.1vw,1.9rem)] leading-[1.06] tracking-[-0.03em]">
                “{way.quote}”
              </p>
              <p
                className={`mt-4 text-[0.98rem] leading-relaxed ${
                  way.tone === "inverse" ? "text-muted-light" : "text-muted-dark"
                }`}
              >
                {way.body}
              </p>
              <div className="mt-auto pt-8">
                <TextLink light={way.tone === "inverse"} href={way.action.href}>
                  {way.action.label}
                </TextLink>
              </div>
            </Card>
          ))}
        </ul>
      </Sheet>

      <Sheet surface="ink" rise aria-labelledby="path-title" className="site-section">
        <SectionIntro
          layout="split"
          eyebrow="The engagement path"
          title="One path from first conversation to continuous operation."
          titleId="path-title"
          aside={
            <p className="max-w-[30ch] text-[0.95rem] text-muted-light">
              Deeper scoping is proposed only when complexity warrants it.
            </p>
          }
        />
        <EngagementPath />
      </Sheet>

      <Sheet surface="paper" rise aria-labelledby="process-title" className="site-section">
        <SectionIntro
          eyebrow="Managed implementation"
          title="Understand. Connect. Implement. Operate. Improve."
          titleId="process-title"
        />

        <ProcessStages />
      </Sheet>

      <Sheet surface="ink" rise aria-labelledby="weight-title" className="site-section">
        <SectionIntro
          layout="split"
          title="Where is the operation carrying unnecessary weight?"
          titleId="weight-title"
          aside={
            <p className="max-w-[34ch] text-[0.95rem] text-muted-light">
              Genesis looks for the places where work repeatedly slows down or loses context:
            </p>
          }
        />

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {weight.map((item, index) => (
            <Card key={item} as="li" tone="dark" className="flex items-baseline gap-4">
              <span className="font-display text-[0.64rem] tracking-[0.14em] text-gold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-[1rem] leading-snug">{item}</p>
            </Card>
          ))}
        </ul>

        <div className="mt-[clamp(40px,5vw,64px)] grid gap-3 border-t border-line-dark pt-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <p className="max-w-[60ch] text-[1rem] leading-relaxed text-muted-light">
            Not every problem needs AI. Some need better structure. Some need integration. Some need
            automation. Some need clearer human ownership.
          </p>
          <p className="text-[clamp(1.25rem,2vw,1.6rem)] leading-snug tracking-[-0.02em]">
            Genesis determines the difference before building.
          </p>
        </div>
      </Sheet>

      <Sheet surface="paper" rise aria-labelledby="judgment-title" className="site-section">
        <SectionIntro
          eyebrow="Where people stay in control"
          title="Intelligence should support the operation, not blur responsibility."
          titleId="judgment-title"
        />

        <ul className="grid gap-4 md:grid-cols-3">
          {judgment.map((paragraph, index) => (
            <Card key={paragraph} as="li">
              <span className="font-display text-[0.7rem] tracking-[0.14em] text-gold-dark">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-5 text-[0.98rem] leading-relaxed">{paragraph}</p>
            </Card>
          ))}
        </ul>
      </Sheet>

      <ClosingBand
        title="Show us one workflow that should work better."
        line="The consultation starts with how that work moves today and whether Genesis is the right infrastructure for improving it."
        actions={<ConsultationButton href="/assessment">Assess My Business</ConsultationButton>}
      />
    </>
  );
}
