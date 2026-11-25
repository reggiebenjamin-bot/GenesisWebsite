import Link from "next/link";
import type { CSSProperties } from "react";
import { PriceTag } from "@/components/offers/PriceTag";
import { UserLimitNote } from "@/components/offers/UserLimitNote";
import { Card, ClosingBand, Points, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { Button } from "@/components/ui/Button";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { Eyebrow } from "@/components/ui/Section";
import { TrackClick } from "@/components/ui/TrackClick";
import { ProcessTimeline } from "@/components/home/ProcessTimeline";
import { aiEmployeePersonas, aiEmployeesHome } from "@/lib/aiEmployees";
import { editionPricing } from "@/lib/editionPlans";
import { allEditions, ministryEdition } from "@/lib/editions";
import { ministryLevels } from "@/lib/ministryPage";
import { managedPlans } from "@/lib/offers";
import { cn } from "@/lib/utils";

/* The three business editions share the Levels, so each card can say where they start. */
const PRICED_EDITIONS = new Set(["/lending", "/real-estate", "/business"]);
const levelsFrom = `From ${managedPlans[0].priceDisplay} a month`;
const ministryFrom = `Plans from ${ministryLevels.levels[0].priceDisplay} a month`;

/* Where each edition card says it starts. Enterprise has no list price: it is scoped on a call. */
function startsAt(href: string) {
  if (PRICED_EDITIONS.has(href)) return levelsFrom;
  if (href === ministryEdition.href) return ministryFrom;
  return "Scoped on a call";
}

/* Three across, then two: every card the same width as its row. */
const CARD_SPANS = ["lg:col-span-2", "lg:col-span-2", "lg:col-span-2", "lg:col-span-3", "lg:col-span-3"] as const;

/** The line that closes every edition card: where it starts, then where the card goes, stacked the same on every card. */
function EditionFooter({ price, action }: { price: string; action: string }) {
  return (
    <div className="mt-auto grid gap-1 border-t border-line-light pt-4">
      <span className="text-[0.88rem] text-muted-dark">{price}</span>
      <span className="inline-flex items-center gap-1.5 text-[0.92rem] font-bold text-gold-dark underline decoration-gold-dark/30 underline-offset-4 group-hover:decoration-gold-dark">
        {action}
        <span aria-hidden="true">→</span>
      </span>
    </div>
  );
}

/* The gold hairline gets stronger with the Level, as on /pricing. */
const TIER_EDGES = ["rgb(201 165 94 / 0.3)", "rgb(201 165 94 / 0.6)", "rgb(201 165 94 / 0.95)"] as const;

/* What each business edition's Levels include, on its own page. */
const levelLinks = [
  { label: "Lending", href: editionPricing.lending.pricingPath },
  { label: "Real Estate Pros", href: editionPricing.real_estate.pricingPath },
  { label: "Business", href: editionPricing.business.pricingPath },
] as const;

const textLink =
  "inline-flex min-h-11 items-center font-bold underline decoration-ink/30 underline-offset-4 transition-colors duration-200 hover:text-gold-dark";

const problems = [
  { title: "Missed calls", body: "The phone rings during a job or after hours, and that caller rarely calls back." },
  { title: "Slow follow up", body: "The first business to answer usually wins. Tomorrow morning is often too late." },
  { title: "Scattered tools", body: "CRM, inbox, texts, spreadsheets and calendar never talk, so the next step falls through." },
];

/* All four, the same team the AI Employees band names. */
const team = aiEmployeePersonas;

/** Chapters one to three: the problem, why Genesis exists, and Genesis OS with its editions. */
export function StoryOpening() {
  return (
    <>
      <Sheet surface="paper" rise aria-labelledby="story-problem-title">
        <SectionIntro
          layout="split"
          eyebrow="Chapter one. The problem"
          title="Every missed call is money walking out the door."
          titleId="story-problem-title"
          aside={
            <p className="max-w-[42ch] text-[0.95rem] leading-relaxed text-muted-dark">
              Texas business owners lose money every day. By the time someone calls back, a competitor already said yes.
            </p>
          }
        />
        {/* A phone reads the three as one compact list. */}
        <ul className="grid gap-4 max-sm:gap-0 max-sm:divide-y max-sm:divide-line-light max-sm:rounded-[6px] max-sm:border max-sm:border-line-light max-sm:bg-white/70 md:grid-cols-3">
          {problems.map((p) => (
            <Card as="li" key={p.title} className="max-sm:rounded-none max-sm:border-0 max-sm:bg-transparent max-sm:p-5 max-sm:shadow-none">
              <p className="text-[1.45rem] font-light tracking-[-0.03em] max-sm:text-[1.2rem]">{p.title}</p>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-dark max-sm:mt-1.5">{p.body}</p>
            </Card>
          ))}
        </ul>
      </Sheet>

      <Sheet surface="ink" rise aria-labelledby="story-origin-title" className="site-section" style={{ "--section-size": "560px" } as CSSProperties}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <SectionIntro
            eyebrow="Chapter two. Why Genesis exists"
            title={<>I lived this problem before I <span className="text-gold-light">built the fix.</span></>}
            titleId="story-origin-title"
            className="mb-0"
          />
          <div className="grid gap-5 text-[1.05rem] leading-relaxed text-muted-light">
            <p>I spent years in lending and Texas real estate and watched good opportunities die in the gap between the first call and the follow up. More people cost too much. More apps made it worse.</p>
            <p>So I built AI employees that work like a team. They answer, follow up, prepare the work and hand a person the conversations that are ready. That team became Genesis.</p>
            <div className="mt-2 flex items-center gap-4">
              <div className="h-px w-10 bg-gold" />
              <p className="text-ivory">Reginald Benjamin <span className="text-muted-light">Founder of Genesis</span></p>
            </div>
          </div>
        </div>
      </Sheet>

      <Sheet surface="paper" rise aria-labelledby="story-os-title" className="site-section" style={{ "--section-size": "1500px" } as CSSProperties}>
        <SectionIntro
          layout="split"
          eyebrow="Chapter three. Genesis OS"
          title="One platform. A chapter for every kind of business."
          titleId="story-os-title"
          aside={
            <p className="max-w-[44ch] text-[0.95rem] leading-relaxed text-muted-dark">
              Genesis OS connects your calls, inbox, CRM, calendar and pipeline, with AI employees working inside it. Choose the edition built for you.
            </p>
          }
        />
        {/* All five editions, Ministry included, with one card structure: three across, then two.
            Each card is one link, named by its title and described by its summary. The
            disclaimers live in the footer and on each edition's own page. */}
        <TrackClick event="edition_link_clicked" from="home_editions">
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {allEditions.map((e, index) => {
              const slug = e.href.slice(1);
              return (
                <Card as="li" key={e.name} className={cn("flex", CARD_SPANS[index], index === 4 && "md:max-lg:col-span-2")}>
                  <Link
                    href={e.href}
                    aria-labelledby={`edition-${slug}-name`}
                    aria-describedby={`edition-${slug}-body`}
                    data-track-edition={slug}
                    className="group flex w-full flex-col"
                  >
                    <Eyebrow className="text-gold-dark">Edition {e.no}</Eyebrow>
                    <p id={`edition-${slug}-name`} className="mt-3 text-[1.7rem] font-light tracking-[-0.035em] group-hover:text-gold-dark">
                      {e.name}
                    </p>
                    <p className="mt-1 text-[0.92rem] font-medium">{e.audience}</p>
                    <p id={`edition-${slug}-body`} className="mt-3 text-[0.95rem] leading-relaxed text-muted-dark">
                      {e.body}
                    </p>
                    {/* The points repeat the summary in short; a phone keeps the summary alone. */}
                    <Points items={e.points} className="mt-5 mb-6 max-sm:hidden" />
                    <span aria-hidden="true" className="block h-5 sm:hidden" />
                    <EditionFooter price={startsAt(e.href)} action={`See ${e.name.replace(/^Genesis /, "")}`} />
                  </Link>
                </Card>
              );
            })}
          </ul>
        </TrackClick>
      </Sheet>
    </>
  );
}

/** Chapter four: a day with the team, from the existing persona copy. */
export function StoryTeamDay() {
  return (
    <Sheet surface="paper" rise aria-labelledby="story-team-title" className="site-section" style={{ "--section-size": "760px" } as CSSProperties}>
      <SectionIntro
        layout="split"
        eyebrow="Chapter four. Your AI employees"
        title="A day with your AI employees."
        titleId="story-team-title"
        aside={
          <Button href="/ai-employees" variant="outline" className="max-sm:w-full">
            {aiEmployeesHome.action}
          </Button>
        }
      />
      {/* On a phone, two of the four, with the rest one tap away on Meet the Team. */}
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {team.map((p, index) => (
          <Card as="li" key={p.id} className={index > 1 ? "max-sm:hidden" : undefined}>
            <p className="text-[1.7rem] font-light tracking-[-0.035em]">{p.name}</p>
            <Eyebrow className="mt-2 text-gold-dark">{p.role}</Eyebrow>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-dark">{p.dailyWork}</p>
          </Card>
        ))}
      </ul>
    </Sheet>
  );
}

/** Chapter five: how it works (the one timeline on the page) and the proof standard. */
export function StoryHowItWorks() {
  return (
    <Sheet surface="ink" rise aria-labelledby="story-process-title" className="site-section">
      <ProcessTimeline titleId="story-process-title" eyebrow="Chapter five. How it runs" />
      <p className="mx-auto mt-14 max-w-[60ch] text-center text-[0.95rem] leading-relaxed text-muted-light">
        Our proof standard: a result goes on this site only when the starting point, the change Genesis made, the source records and the client&apos;s permission are all confirmed. No invented numbers.
      </p>
    </Sheet>
  );
}

/**
 * Chapter six: the three Levels, shown once. Lending, Real Estate Pros and
 * Business share them at the same prices; each edition page lists what its
 * Levels include and is where a Level is bought. Churches have their own plans.
 */
export function StoryOffers() {
  return (
    <Sheet id="choose-business" surface="paper" rise aria-labelledby="story-offers-title" className="site-section" style={{ "--section-size": "720px" } as CSSProperties}>
      <SectionIntro
        layout="split"
        eyebrow="Chapter six. Plans and pricing"
        title="Three Levels. Pick by how many people need a login."
        titleId="story-offers-title"
        aside={
          <p className="max-w-[42ch] text-[0.95rem] leading-relaxed text-muted-dark">
            Monthly plans with a one time setup, the same for Lending, Real Estate Pros and Business.
          </p>
        }
      />
      <ol className="grid gap-4 md:grid-cols-3">
        {managedPlans.map((plan, index) => (
          <Card
            as="li"
            key={plan.id}
            className="relative flex flex-col overflow-hidden"
            style={{ "--tier-edge": TIER_EDGES[index] } as CSSProperties}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--tier-edge),transparent)]"
            />
            <Eyebrow className="text-gold-dark">Level {plan.step}</Eyebrow>
            <PriceTag amount={plan.priceDisplay} setup={plan.setupLine} className="mt-4" />
            <p className="mt-5 border-t border-line-light pt-4 text-[0.95rem] leading-relaxed">{plan.day}</p>
            <UserLimitNote plan={plan} className="mt-1 text-muted-dark" />
          </Card>
        ))}
      </ol>
      <div className="mt-6 grid gap-x-10 gap-y-2 text-[0.95rem] text-muted-dark lg:flex lg:flex-wrap lg:items-center lg:justify-between">
        <TrackClick event="edition_link_clicked" from="home_levels">
          <p className="flex flex-wrap items-center gap-x-5">
            <span className="w-full sm:w-auto">What each Level includes:</span>
            {levelLinks.map((link) => (
              <Link key={link.href} href={link.href} data-track-edition={link.href.split("#")[0].slice(1)} className={textLink}>
                {link.label}
              </Link>
            ))}
          </p>
        </TrackClick>
        <TrackClick event="ministry_cue_clicked" from="home_levels">
          <p>
            Churches:{" "}
            <Link href={`${ministryEdition.href}#levels`} className={textLink}>
              {ministryFrom}
            </Link>
          </p>
        </TrackClick>
      </div>
      {/* The prices lead to a next step: the assessment first, then the full price list. */}
      <div className="mt-8 grid w-full gap-3 sm:max-w-[34rem] sm:grid-cols-2">
        <TrackClick event="assessment_link_clicked" from="home_levels" selector="a[href^='/assessment']">
          <ConsultationButton href="/assessment" className="w-full">Assess My Business</ConsultationButton>
        </TrackClick>
        <TrackClick event="edition_pricing_viewed" from="home_levels">
          <Button href="/pricing" variant="outline" className="min-h-[52px] w-full">See Pricing</Button>
        </TrackClick>
      </div>
    </Sheet>
  );
}

/** The close. The footer under it carries the disclaimer, so it is said once. */
export function StoryClose() {
  return (
    <ClosingBand
      eyebrow="The close"
      title="The next call is coming. Who will answer it?"
      line="Give your business a team that never misses a lead, never forgets a follow up and never sleeps."
      actions={
        <div className="grid w-full max-w-[30rem] gap-3 sm:grid-cols-2">
          <TrackClick event="assessment_link_clicked" from="home_close" selector="a[href^='/assessment']">
            <ConsultationButton href="/assessment" className="w-full">Assess My Business</ConsultationButton>
          </TrackClick>
          <Button href="/ai-employees" variant="secondary" className="min-h-[52px] w-full">Meet the Team</Button>
        </div>
      }
    />
  );
}
