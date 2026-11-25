import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, ClosingBand, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { FaqList } from "@/components/ui/FaqList";
import { Eyebrow } from "@/components/ui/Section";
import { TrackClick } from "@/components/ui/TrackClick";
import { aiEmployeePersonas } from "@/lib/aiEmployees";
import { faqs, pricingFaqs } from "@/lib/content";
import { levelsFaqAnswer, type EditionKey } from "@/lib/editionPlans";
import type { Edition, EditionCta } from "@/lib/editions";
import { levelAiEmployeesSummary } from "@/lib/offers";
import { breadcrumbSchema, editionServiceSchema, enterpriseServiceSchema, faqPageSchema, graph } from "@/lib/schema";
import { cn } from "@/lib/utils";

/* The site's secondary action on ink: dark with a gold hairline, the same height as the gold primary. */
const secondaryCta = "secondary-action inline-flex min-h-[52px] w-full items-center justify-center px-6";

/** A single link that renders as a Next Link for internal routes, an anchor for external. */
function CtaLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

/** The two hero actions: the gold primary, then one secondary. */
/* The event a secondary action reports: an edition's pricing, or a call. */
function secondaryEvent(cta: EditionCta) {
  return cta.href.includes("#levels") ? "edition_pricing_viewed" : "consultation_cta_clicked";
}

function HeroActions({ ctas, from }: { ctas: readonly EditionCta[]; from: string }) {
  const [primary, secondary] = ctas;
  return (
    <div className="hero-actions mx-auto mt-9 grid max-w-[34rem] gap-3 sm:grid-cols-2">
      {primary ? (
        <TrackClick event="assessment_link_clicked" from={from} selector="a[href^='/assessment']">
          <ConsultationButton href={primary.href} className="w-full">
            {primary.label}
          </ConsultationButton>
        </TrackClick>
      ) : null}
      {secondary ? (
        <TrackClick event={secondaryEvent(secondary)} from={from}>
          <CtaLink href={secondary.href} className={secondaryCta}>
            <span>{secondary.label}</span>
          </CtaLink>
        </TrackClick>
      ) : null}
    </div>
  );
}

/**
 * Edition questions: only answers the pricing page and homepage already give,
 * with "What changes between the Levels?" answered from this edition's own
 * Level bullets.
 */
/* Enterprise has no Levels: its question is how it is scoped. */
const enterpriseScopeFaq = {
  question: "How is Enterprise scoped?",
  answer:
    "On a call. Genesis looks at your locations, how many people need a login, the systems you use and the workflows you want covered, then recommends a starting point before anything is proposed in writing. Enterprise has no list price.",
};

function editionFaqsFor(key?: EditionKey) {
  return [
    ...pricingFaqs.filter((faq) => key || faq.question !== "How do I know which Level fits?").map((faq) =>
      faq.question !== "What changes between the Levels?"
        ? faq
        : key
          ? { ...faq, answer: levelsFaqAnswer(key) }
          : enterpriseScopeFaq,
    ),
    ...faqs.filter((faq) =>
      ["Do we have to replace our current systems?", "Does Genesis replace human judgment?"].includes(faq.question),
    ),
  ];
}

/** Pages built for a trade or a market, linked from the edition they belong to. */
/* A trade list gets its own short row; one or two market pages read as a sentence under the team instead. */
const related: Partial<Record<string, { title: string; links: readonly { label: string; href: string }[] }>> = {
  "/business": {
    title: "Built for your trade",
    links: [
      { label: "HVAC", href: "/texas/hvac" },
      { label: "Plumbing", href: "/texas/plumbing" },
      { label: "Roofing", href: "/texas/roofing" },
      { label: "Electrical", href: "/texas/electrical" },
      { label: "Landscaping", href: "/texas/landscaping" },
      { label: "Cleaning", href: "/texas/cleaning" },
      { label: "Contractors", href: "/texas/contractors" },
    ],
  },
  "/lending": {
    title: "Working in Texas? See",
    links: [{ label: "Texas Lenders", href: "/texas/lenders" }],
  },
  "/real-estate": {
    title: "Working in Texas real estate? See",
    links: [
      { label: "Texas Investors", href: "/texas/investors" },
      { label: "Fix and Flip", href: "/texas/fix-and-flip" },
    ],
  },
};

/**
 * One edition landing page: the hero with its two actions on the first
 * screen, the edition's Levels, a day with the AI employees, the questions
 * the pricing page already answers, the pages built for its trades, and a
 * close. The copy comes from lib/editions so it stays in sync with the
 * homepage edition cards.
 */
export function EditionLanding({
  edition,
  pricingKey,
  lede,
  ctas,
  benefits,
  children,
}: {
  edition: Edition;
  /** The edition's Levels, for the structured data. Enterprise has none. */
  pricingKey?: EditionKey;
  /** Overrides the edition body under the headline. */
  lede?: string;
  /** Overrides the edition calls to action. */
  ctas?: readonly EditionCta[];
  /** Benefit lines that say more than the Level bullets do. */
  benefits?: readonly string[];
  /** The edition Levels, under the hero. */
  children?: React.ReactNode;
}) {
  const actions = ctas ?? edition.ctas;
  const trades = related[edition.href];
  const slug = edition.href.slice(1);
  const editionFaqs = editionFaqsFor(pricingKey);

  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbSchema(edition.href),
          pricingKey ? editionServiceSchema(pricingKey) : enterpriseServiceSchema(),
          faqPageSchema(editionFaqs, edition.href),
        )}
      />

      <section className="hero-top border-b border-line-dark bg-ink pb-24 text-center text-ivory md:pb-32">
        <div className="shell max-w-[920px]">
          <Image
            src="/brand/genesis-logo-gradient.svg"
            alt=""
            width={84}
            height={84}
            priority
            className="hero-mark mx-auto h-[84px] w-[84px]"
          />
          <div className="hero-rule mx-auto mt-6 h-px w-16 bg-gold" />
          {/* Two parts that wrap at the slash, never leaving one word alone on a line. */}
          <Eyebrow className="hero-eyebrow mt-8 text-balance">
            <span className="inline-block">
              {edition.eyebrow}
              <span aria-hidden="true" className="px-3 text-ivory/30">
                /
              </span>
            </span>
            <span className="inline-block">{edition.audience}</span>
          </Eyebrow>
          <h1 className="hero-title mx-auto mt-5 max-w-[20ch] font-light text-[clamp(2.6rem,6vw,5.4rem)] leading-[1.02] tracking-[-0.045em] text-balance">
            {edition.headline}
          </h1>
          <p className="hero-lede mx-auto mt-6 max-w-[48ch] text-[1.08rem] leading-relaxed text-ivory/74">
            {lede ?? edition.body}
          </p>
          <HeroActions ctas={actions} from={`edition_${slug}`} />
        </div>
      </section>

      {/* On a phone the next section's own top space is the gap, so the two never stack into one wide blank. */}
      <Sheet surface="paper" rise aria-labelledby="edition-title" className={cn("site-section", children && "max-md:pb-6")}>
        <h2 id="edition-title" className="sr-only">
          What {edition.name} does
        </h2>
        {/* Three small cards on the page grid, each with a numbered kicker, as the homepage problem
            cards are, so the first block after the hero reads as a section, not loose bullets. */}
        {benefits?.length ? (
          <ul className="mb-16 grid gap-4 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <Card as="li" key={benefit}>
                <p className="font-mono text-[0.72rem] font-semibold tracking-[0.14em] text-gold-dark uppercase">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-3 text-[1.02rem] leading-relaxed">{benefit}</p>
              </Card>
            ))}
          </ul>
        ) : null}

        {children ? (
          <div id={pricingKey ? "levels" : "scope"} className="scroll-mt-[calc(var(--header-height)+16px)]">
            {pricingKey ? (
              <SectionIntro
                layout="split"
                eyebrow="Plans and pricing"
                title="Choose your Level."
                aside={
                  <p className="max-w-[44ch] text-[0.95rem] leading-relaxed text-muted-dark">
                    Pick by how many people need a login. Monthly plans with a one time setup.
                  </p>
                }
              />
            ) : null}
            {children}
            {pricingKey ? (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-2 border-t border-line-light pt-5">
                <p className="max-w-[60ch] text-[0.95rem] text-muted-dark">
                  Want to talk first? A short call confirms the right Level for your team.
                </p>
                <TrackClick event="consultation_cta_clicked" from={`edition_${slug}_levels`}>
                  <Link
                    href={`/contact?topic=${slug}#consultation-form`}
                    className="inline-flex min-h-11 items-center font-bold underline decoration-ink/30 underline-offset-4 hover:text-gold-dark"
                  >
                    Book a Call
                  </Link>
                </TrackClick>
              </div>
            ) : null}
          </div>
        ) : null}
      </Sheet>

      <Sheet surface="paper" aria-labelledby="edition-team-title" className="site-section border-t border-line-light">
        <SectionIntro
          layout="split"
          eyebrow="Your AI employees"
          title="A day with your AI employees."
          titleId="edition-team-title"
          aside={
            <p className="max-w-[44ch] text-[0.95rem] leading-relaxed text-muted-dark">
              Operations, marketing, sales and the front desk, working inside {edition.name}. {pricingKey ? levelAiEmployeesSummary() : "The call confirms which of them your build puts to work."}
            </p>
          }
        />
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {aiEmployeePersonas.map((persona) => (
            <Card as="li" key={persona.id}>
              <p className="text-[1.5rem] font-light tracking-[-0.03em]">{persona.name}</p>
              <Eyebrow className="mt-2 text-gold-dark">{persona.role}</Eyebrow>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-dark">
                {pricingKey ? persona.editionDay[pricingKey] : persona.dailyWork}
              </p>
            </Card>
          ))}
        </ul>
        {trades && trades.links.length <= 2 ? (
          <p className="mt-8 text-[0.95rem] leading-relaxed text-muted-dark">
            {trades.title}{" "}
            {trades.links.map((link, index) => (
              <Fragment key={link.href}>
                {index > 0 ? " or " : null}
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center font-bold text-ink underline decoration-ink/30 underline-offset-4 hover:text-gold-dark"
                >
                  {link.label}
                </Link>
              </Fragment>
            ))}
            .
          </p>
        ) : trades ? (
          <div className="mt-14 border-t border-line-light pt-8">
            <p className="text-[1.05rem] font-medium tracking-[-0.01em]">{trades.title}</p>
            <ul className="mt-3 flex flex-wrap gap-x-6">
              {trades.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center font-bold underline decoration-ink/30 underline-offset-4 hover:text-gold-dark"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Sheet>

      <Sheet surface="paper" aria-labelledby="edition-faq-title" className="site-section border-t border-line-light">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionIntro eyebrow="Questions" title="What teams ask us first." titleId="edition-faq-title" className="mb-0" />
          <FaqList items={editionFaqs} />
        </div>
      </Sheet>

      {/* Enterprise has no Levels: its close offers the scoping call first. */}
      {pricingKey ? null : (
        <ClosingBand
          title="See where your business is carrying extra work."
          line="Book a call and we will scope your locations and systems."
          actions={
            <div className="grid w-full max-w-[34rem] gap-3 sm:grid-cols-2">
              <TrackClick event="consultation_cta_clicked" from={`edition_${slug}_close`}>
                <ConsultationButton href={actions[1]?.href ?? "/contact#consultation-form"} className="w-full">
                  Book a Call
                </ConsultationButton>
              </TrackClick>
              <TrackClick event="assessment_link_clicked" from={`edition_${slug}_close`} selector="a[href^='/assessment']">
                <CtaLink href={actions[0]?.href ?? "/assessment"} className={secondaryCta}>
                  <span>Assess My Business</span>
                </CtaLink>
              </TrackClick>
            </div>
          }
        />
      )}
      {pricingKey ? (
      <ClosingBand
        title="See where your business is carrying extra work."
        line="Answer a few questions and we will point you to the Level that fits."
        actions={
          <div className="grid w-full max-w-[34rem] gap-3 sm:grid-cols-2">
            <TrackClick event="assessment_link_clicked" from={`edition_${slug}_close`} selector="a[href^='/assessment']">
              <ConsultationButton href={actions[0]?.href ?? "/assessment"} className="w-full">
                Assess My Business
              </ConsultationButton>
            </TrackClick>
            {/* The close offers the call: the prices are already above it. */}
            <TrackClick event="consultation_cta_clicked" from={`edition_${slug}_close`}>
              <CtaLink
                href={pricingKey ? `/contact?topic=${slug}#consultation-form` : (actions[1]?.href ?? "/contact#consultation-form")}
                className={secondaryCta}
              >
                <span>Book a Call</span>
              </CtaLink>
            </TrackClick>
          </div>
        }
      />
      ) : null}
    </>
  );
}
