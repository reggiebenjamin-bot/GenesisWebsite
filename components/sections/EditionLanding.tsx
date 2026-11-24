import Image from "next/image";
import Link from "next/link";
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
import { breadcrumbSchema, editionServiceSchema, enterpriseServiceSchema, faqPageSchema, graph } from "@/lib/schema";

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
        <CtaLink href={secondary.href} className={secondaryCta}>
          <span>{secondary.label}</span>
        </CtaLink>
      ) : null}
    </div>
  );
}

/**
 * Edition questions: only answers the pricing page and homepage already give,
 * with "What changes between the Levels?" answered from this edition's own
 * Level bullets.
 */
function editionFaqsFor(key?: EditionKey) {
  return [
    ...pricingFaqs.map((faq) =>
      key && faq.question === "What changes between the Levels?" ? { ...faq, answer: levelsFaqAnswer(key) } : faq,
    ),
    ...faqs.filter((faq) =>
      ["Do we have to replace our current systems?", "Does Genesis replace human judgment?"].includes(faq.question),
    ),
  ];
}

/** Pages built for a trade or a market, linked from the edition they belong to. */
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
    title: "Built for Texas lenders",
    links: [{ label: "Texas Lenders", href: "/texas/lenders" }],
  },
  "/real-estate": {
    title: "Built for Texas real estate",
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
          <Eyebrow className="hero-eyebrow mt-8">
            {edition.eyebrow}
            <span aria-hidden="true" className="px-3 text-ivory/30">
              /
            </span>
            {edition.audience}
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

      <Sheet surface="paper" rise aria-labelledby="edition-title" className="site-section">
        <h2 id="edition-title" className="sr-only">
          What {edition.name} does
        </h2>
        {benefits?.length ? (
          <ul className="mx-auto mb-16 grid max-w-[58rem] gap-6 sm:grid-cols-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="grid grid-cols-[8px_minmax(0,1fr)] gap-3 text-[0.95rem] leading-snug">
                <span aria-hidden="true" className="mt-[0.45rem] size-1.5 rounded-full bg-gold-dark" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {children ? (
          <div id="levels" className="scroll-mt-[calc(var(--header-height)+16px)]">
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
              Operations, marketing, sales and the front desk, working inside {edition.name}. The call confirms which of them your Level puts to work.
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
        {trades ? (
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
            {actions[1] ? (
              <CtaLink href={actions[1].href} className={secondaryCta}>
                <span>{actions[1].label}</span>
              </CtaLink>
            ) : null}
          </div>
        }
      />
    </>
  );
}
