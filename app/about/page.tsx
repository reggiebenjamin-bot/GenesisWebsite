import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import Image from "next/image";
import { Card, ClosingBand, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { PageIntro } from "@/components/ui/Section";
import { FactList } from "@/components/ui/FactList";
import { contact } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import {
  genesisPositioning,
  genesisTools,
  managedOverview,
  offerPaths,
  toolsOverview,
} from "@/lib/offers";
import { aboutPageSchema, breadcrumbSchema, graph, organizationSchema } from "@/lib/schema";

export const metadata: Metadata = pageMetadata("/about");

/* Both portraits are square and already framed, so the card shows them whole. */
const teamMembers = [
  { name: "Reggie", role: "Founder", image: "/images/team/reggie.webp" },
  { name: "Graham", role: "Head of Operations", image: "/images/team/graham.webp" },
] as const;

const toolNames = genesisTools.map((tool) => tool.name).join(", ");
const [toolsPath, managedPath] = offerPaths;

/*
 * The source of truth about the company, in one place: what Genesis is, who
 * it is for, who runs it, how the offers relate, and what it is not. Every
 * answer restates something the site already says elsewhere.
 */
const companyFacts = [
  { label: "What it is", value: genesisPositioning.brandDescription },
  {
    label: "Who it is for",
    value:
      "Real estate agents and teams, brokerages, lenders, investors, acquisition teams, and development operators.",
  },
  { label: "Who runs it", value: "Reginald Benjamin, Founder, and Graham, Head of Operations." },
  {
    label: toolsOverview.product,
    value: `${toolsOverview.summary} ${toolNames}. “${toolsPath.distinction}”`,
  },
  {
    label: managedOverview.product,
    value: `${managedOverview.summary} “${managedPath.distinction}”`,
  },
  {
    label: "How the tools relate",
    value:
      "Deal Architect helps you understand an opportunity. When financing becomes part of the path, Funding Ready organizes the submission. When the deal needs ongoing work, Deal Desk keeps its context in one recurring workspace.",
  },
  {
    label: "What it is not",
    value:
      "Not a guarantee of financing, approval, or rates. Not AI doing the deal math: figures come from deterministic formulas. Not a smaller version of a managed plan: the tools and Managed AI solve different scopes of problems.",
  },
  { label: "Contact", value: `${contact.email} · ${contact.phoneDisplay}` },
];

/** How Genesis builds: infrastructure before spectacle. */
const principles = [
  {
    title: "Understand the business before automating it.",
    body: "A bad process does not become a good process because an AI agent performs part of it. Genesis begins with how the work enters, moves, changes hands, and reaches a decision.",
  },
  {
    title: "Connect context before adding intelligence.",
    body: "AI becomes more useful when the surrounding systems, data, permissions, history, and workflow are clear.",
  },
  {
    title: "Use the right system for the right job.",
    body: "Calculations should be deterministic. Facts should come from structured or approved sources. AI should be used for the work it is suited for: interpretation, classification, explanation, generation, summarization, workflow selection, and reasoning over supplied context.",
  },
  {
    title: "Keep human responsibility clear.",
    body: "AI can support judgment without pretending to replace the humans responsible for financial, legal, regulated, or consequential business decisions.",
  },
  {
    title: "Build reusable infrastructure, not disposable bots.",
    body: "A one-off agent can solve one problem. Genesis is designed so knowledge, workflows, integrations, and operational context can continue becoming useful across the business.",
  },
  {
    title: "Managed should actually mean managed.",
    body: "When ongoing support is part of the scope, Genesis should keep the agreed infrastructure supported and improving rather than handing the customer another system to maintain alone.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <JsonLd data={graph(organizationSchema(), aboutPageSchema(), breadcrumbSchema("/about"))} />

      <PageIntro
        eyebrow="About Genesis"
        title="Build the operating layer, not another AI demo."
        description="Genesis AI builds infrastructure for real estate professionals around a simple belief: as the business grows, its systems should become more useful, not more fragmented."
      />

      <Sheet surface="paper" aria-labelledby="why-title" className="site-section">
        <SectionIntro
          eyebrow="Why Genesis exists"
          title="Real estate businesses rarely have a software shortage."
          titleId="why-title"
        />

        <ul className="grid gap-4 md:grid-cols-2">
          <Card as="li" className="grid content-start gap-4">
            <p className="text-[1.08rem] leading-relaxed">
              They have leads in one place, conversations in another, documents somewhere else, a
              CRM holding part of the picture, employees carrying processes in their heads, and
              automations trying to connect everything in between.
            </p>
            <p className="text-[0.98rem] leading-relaxed text-muted-dark">
              Growth adds more transactions and more opportunity—but it often adds more
              administrative weight with it.
            </p>
          </Card>

          <Card as="li" tone="inverse">
            <h2 className="text-[clamp(1.5rem,2.1vw,1.9rem)] leading-[1.06] tracking-[-0.03em]">
              Genesis exists to change that relationship.
            </h2>
            <p className="mt-4 text-[0.98rem] leading-relaxed text-muted-light">
              We connect the workflows, information, communication, data, software, and intelligence
              behind the operation so the business can build on what it learns instead of recreating
              the same manual coordination at a larger scale.
            </p>
          </Card>
        </ul>
      </Sheet>

      <Sheet surface="ink" rise className="site-section text-center">
        <blockquote className="mx-auto max-w-[24ch] text-[clamp(2.2rem,4.4vw,3.9rem)] leading-[1.04] tracking-[-0.045em] text-balance">
          Become trusted before needed.
        </blockquote>
        <p className="mx-auto mt-7 max-w-[52ch] text-muted-light">
          That principle shapes how Genesis scopes work, communicates what is included, and stays
          accountable when an operation depends on the system.
        </p>
      </Sheet>

      <Sheet surface="paper" rise aria-labelledby="principles-title" className="site-section">
        <SectionIntro
          eyebrow="How Genesis builds"
          title="Infrastructure before spectacle."
          titleId="principles-title"
        />

        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {principles.map((principle, index) => (
            <Card key={principle.title} as="li">
              <span className="font-display text-[0.7rem] tracking-[0.14em] text-gold-dark">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-[clamp(1.2rem,1.6vw,1.35rem)] leading-snug tracking-[-0.02em]">
                {principle.title}
              </h3>
              <p className="mt-3 text-[0.94rem] leading-relaxed text-muted-dark">{principle.body}</p>
            </Card>
          ))}
        </ul>
      </Sheet>

      <Sheet surface="paper" aria-labelledby="team-title" className="site-section">
        <SectionIntro eyebrow="Leadership" title="The people building Genesis." titleId="team-title" />

        <ul className="grid gap-5 sm:grid-cols-2 lg:max-w-[820px]">
          {teamMembers.map((member) => (
            <li key={member.name}>
              <article className="h-full overflow-hidden rounded-[24px] border border-line-light bg-white/70 shadow-[0_18px_44px_rgb(8_9_14/0.06)]">
                <div className="relative aspect-square overflow-hidden bg-ink">
                  <Image
                    src={member.image}
                    alt={`${member.name}, ${member.role} at Genesis AI`}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="p-[clamp(22px,2.4vw,32px)]">
                  <h3 className="text-[clamp(1.6rem,2.2vw,2rem)] leading-[1.05] tracking-[-0.03em]">
                    {member.name}
                  </h3>
                  <p className="mt-2 text-[0.95rem] text-muted-dark">{member.role}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Sheet>

      <Sheet surface="paper" aria-labelledby="facts-title" className="site-section">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <SectionIntro
            eyebrow="At a glance"
            title="Genesis AI, in brief."
            titleId="facts-title"
            className="mb-0"
          />
          <FactList facts={companyFacts} />
        </div>
      </Sheet>

      <ClosingBand
        title="Your infrastructure should learn from the business it supports."
        line="Start by showing us how the operation works today."
        actions={<ConsultationButton href="/contact" />}
      />
    </>
  );
}
