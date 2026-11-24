import Link from "next/link";
import { Card, ClosingBand, Points, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { Button } from "@/components/ui/Button";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { Eyebrow } from "@/components/ui/Section";
import { TrackClick } from "@/components/ui/TrackClick";
import { ProductChooser } from "@/components/home/ProductChooser";
import { ProcessTimeline } from "@/components/home/ProcessTimeline";
import { aiEmployeePersonas, aiEmployeesHome } from "@/lib/aiEmployees";
import { editions, ministryEdition } from "@/lib/editions";
import { FUNDING_LINE } from "@/lib/legal";
import { ministryLevels } from "@/lib/ministryPage";
import { managedPlans } from "@/lib/offers";

/* The three business editions share the Levels, so each card can say where they start. */
const PRICED_EDITIONS = new Set(["/lending", "/real-estate", "/business"]);
const levelsFrom = `From ${managedPlans[0].priceDisplay} a month`;
const ministryFrom = `Plans from ${ministryLevels.levels[0].priceDisplay} a month`;

/** The line that closes every edition card: where it starts, and where the card goes. */
function EditionFooter({ price, action }: { price?: string; action: string }) {
  return (
    <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-1 border-t border-line-light pt-4">
      {price ? <span className="text-[0.88rem] text-muted-dark">{price}</span> : <span />}
      <span className="inline-flex items-center gap-1.5 text-[0.92rem] font-bold text-gold-dark underline decoration-gold-dark/30 underline-offset-4 group-hover:decoration-gold-dark">
        {action}
        <span aria-hidden="true">→</span>
      </span>
    </div>
  );
}

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
        <ul className="grid gap-4 md:grid-cols-3">
          {problems.map((p) => (
            <Card as="li" key={p.title}>
              <p className="text-[1.45rem] font-light tracking-[-0.03em]">{p.title}</p>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-dark">{p.body}</p>
            </Card>
          ))}
        </ul>
      </Sheet>

      <Sheet surface="ink" rise aria-labelledby="story-origin-title" className="site-section">
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

      <Sheet surface="paper" rise aria-labelledby="story-os-title" className="site-section">
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
        <ul className="grid gap-4 md:grid-cols-2">
          {editions.map((e) => (
            <Card as="li" key={e.name} className="flex">
              <Link href={e.href} className="group flex w-full flex-col">
                <Eyebrow className="text-gold">Edition {e.no}</Eyebrow>
                <p className="mt-3 text-[1.7rem] font-light tracking-[-0.035em] group-hover:text-gold-dark">{e.name}</p>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-dark">{e.body}</p>
                <Points items={e.points} className="mt-5 mb-6" />
                <EditionFooter price={PRICED_EDITIONS.has(e.href) ? levelsFrom : undefined} action={`See ${e.name}`} />
              </Link>
            </Card>
          ))}
          {/* Edition 05 spans the row with the same structure as the other four: software for
              churches, with its own plans and its own disclaimer in place of the funding line. */}
          <Card as="li" className="flex md:col-span-2">
            <Link href={ministryEdition.href} className="group flex w-full flex-col">
              <Eyebrow className="text-gold">Edition {ministryEdition.no}</Eyebrow>
              <p className="mt-3 text-[1.7rem] font-light tracking-[-0.035em] group-hover:text-gold-dark">{ministryEdition.name}</p>
              <p className="mt-3 max-w-[72ch] text-[0.95rem] leading-relaxed text-muted-dark">{ministryEdition.body}</p>
              <Points items={ministryEdition.points} className="mt-5" />
              <p className="mt-4 mb-6 text-[0.84rem] leading-relaxed text-muted-dark">{ministryEdition.disclaimer}</p>
              <EditionFooter price={ministryFrom} action={`See ${ministryEdition.name}`} />
            </Link>
          </Card>
        </ul>
        {/* The four business editions share one line: said once, under the grid. */}
        <p className="mt-5 text-center text-[0.8rem] text-muted-dark">{FUNDING_LINE}</p>
      </Sheet>
    </>
  );
}

/** Chapter four: a day with the team, from the existing persona copy. */
export function StoryTeamDay() {
  return (
    <Sheet surface="paper" rise aria-labelledby="story-team-title" className="site-section">
      <SectionIntro
        layout="center"
        eyebrow="Chapter four. Your AI employees"
        title="A day with your AI employees."
        titleId="story-team-title"
      />
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {team.map((p) => (
          <Card as="li" key={p.id}>
            <p className="text-[1.7rem] font-light tracking-[-0.035em]">{p.name}</p>
            <Eyebrow className="mt-2 min-h-[2.8em] text-gold-dark">{p.role}</Eyebrow>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-dark">{p.dailyWork}</p>
          </Card>
        ))}
      </ul>
      <div className="mt-10 flex justify-center">
        <Button href="/ai-employees" variant="outline" className="min-h-[53px] max-sm:w-full">
          {aiEmployeesHome.action}
        </Button>
      </div>
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

/** Chapter six: Lending, Real Estate Pros and Business, each with its Levels and checkout: the one place the homepage prices them. */
export function StoryOffers() {
  return (
    <Sheet id="choose-business" surface="paper" rise aria-labelledby="story-offers-title" className="site-section">
      <SectionIntro
        layout="split"
        eyebrow="Chapter six. Plans and pricing"
        title="Choose your edition and Level."
        titleId="story-offers-title"
        aside={<p className="max-w-[42ch] text-[0.95rem] leading-relaxed text-muted-dark">Open the edition page, or start Level 01, Level 02 or Level 03. Monthly plans with a one time setup. Level 01 is one user, Level 02 up to 5 and Level 03 up to 25.</p>}
      />
      <ProductChooser />
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
          <Button href="/ai-employees" variant="secondary" className="min-h-[53px] w-full">Meet the Team</Button>
        </div>
      }
    />
  );
}
