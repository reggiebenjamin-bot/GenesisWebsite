import Image from "next/image";
import { Suspense } from "react";
import { Card, Sheet } from "@/components/ui/Blocks";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Section";
import {
  aiEmployeePersonas,
  aiEmployeesCta,
  aiEmployeesExpert,
  aiEmployeesHero,
  aiEmployeesPricing,
  aiEmployeesTeam,
  checkoutMessages,
  expertPhone,
  inquiryMessages,
  softwareDisclaimer,
} from "@/lib/aiEmployees";
import { managedPlans } from "@/lib/offers";
import { StatusNotice } from "./StatusNotice";

const goldButton =
  "secondary-action inline-flex min-h-[52px] items-center justify-center px-6";

function TitleWithAccent({ title, accent }: { title: string; accent: string }) {
  const at = title.lastIndexOf(accent);
  if (at < 0) return title;
  return (
    <>
      {title.slice(0, at)}
      <span className="text-gold-light">{title.slice(at)}</span>
    </>
  );
}

function CenteredHeading({
  eyebrow,
  title,
  titleId,
  summary,
  onDark = false,
}: {
  eyebrow: string;
  title: string;
  titleId: string;
  summary?: string;
  onDark?: boolean;
}) {
  return (
    <div className="mx-auto mb-[clamp(36px,5vw,56px)] max-w-[44rem] text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        id={titleId}
        className="mt-4 font-light text-[clamp(2.2rem,4.4vw,3.9rem)] leading-[1.02] tracking-[-0.045em] text-balance"
      >
        {title}
      </h2>
      {summary ? (
        <p
          className={`mx-auto mt-5 max-w-[48ch] text-[1.02rem] leading-relaxed ${
            onDark ? "text-muted-light" : "text-muted-dark"
          }`}
        >
          {summary}
        </p>
      ) : null}
    </div>
  );
}

export function AiEmployeesPage() {
  return (
    <>
      <section className="border-b border-line-dark bg-ink pt-[calc(var(--header-height)+72px)] pb-24 text-center text-ivory md:pb-32">
        <div className="shell max-w-[920px]">
          <Image
            src="/brand/genesis-logo-gradient.svg"
            alt=""
            width={84}
            height={84}
            priority
            className="mx-auto h-[84px] w-[84px]"
          />
          <div className="mx-auto mt-6 h-px w-16 bg-gold" />
          <Eyebrow className="mt-8">{aiEmployeesHero.eyebrow}</Eyebrow>
          <h1 className="mx-auto mt-5 max-w-[20ch] font-light text-[clamp(2.8rem,6vw,5.4rem)] leading-[1.02] tracking-[-0.045em] text-balance">
            <TitleWithAccent title={aiEmployeesHero.title} accent={aiEmployeesHero.accent} />
          </h1>
          <p className="mx-auto mt-6 max-w-[46ch] text-[1.08rem] leading-relaxed text-ivory/74">
            {aiEmployeesHero.summary}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a className={goldButton} href="#team">
              <span>{aiEmployeesHero.teamAction}</span>
            </a>
            <a className={goldButton} href="#plans">
              <span>{aiEmployeesHero.pricingAction}</span>
            </a>
          </div>
          <Suspense fallback={null}>
            <StatusNotice checkout={checkoutMessages} inquiry={inquiryMessages} />
          </Suspense>
        </div>
      </section>

      <Sheet surface="paper" rise id="team" aria-labelledby="team-title" className="site-section">
        <CenteredHeading
          eyebrow={aiEmployeesTeam.eyebrow}
          title={aiEmployeesTeam.title}
          titleId="team-title"
          summary={aiEmployeesTeam.summary}
        />
        <ul className="grid gap-4 lg:grid-cols-2">
          {aiEmployeePersonas.map((persona) => (
            <Card as="li" key={persona.id} id={persona.id} className="grid content-start gap-6">
              <div>
                <p className="font-display text-[0.66rem] tracking-[0.16em] text-gold-dark uppercase">
                  {persona.role}
                </p>
                <h3 className="mt-3 font-light text-[clamp(2rem,3vw,2.7rem)] leading-none tracking-[-0.04em]">
                  {persona.name}
                </h3>
              </div>
              <div className="border-t border-line-light pt-5">
                <h4 className="font-display text-[0.64rem] tracking-[0.16em] text-gold-dark uppercase">
                  {aiEmployeesTeam.dailyWorkLabel}
                </h4>
                <p className="mt-3 text-[0.98rem] leading-relaxed">{persona.dailyWork}</p>
              </div>
              <div>
                <h4 className="font-display text-[0.64rem] tracking-[0.16em] text-gold-dark uppercase">
                  {aiEmployeesTeam.outcomesLabel}
                </h4>
                <p className="mt-3 text-[0.98rem] leading-relaxed text-muted-dark">{persona.outcomes}</p>
              </div>
            </Card>
          ))}
        </ul>
      </Sheet>

      <Sheet surface="ink" rise id="plans" aria-labelledby="plans-title" className="site-section">
        <CenteredHeading
          eyebrow={aiEmployeesPricing.eyebrow}
          title={aiEmployeesPricing.title}
          titleId="plans-title"
          summary={aiEmployeesPricing.summary}
          onDark
        />
        <ol className="grid gap-4 lg:grid-cols-3">
          {managedPlans.map((plan) => (
            <Card as="li" key={plan.id} tone="dark" className="flex h-full flex-col text-center">
              <p className="font-display text-[0.66rem] tracking-[0.16em] text-gold-light uppercase">Level {plan.step}</p>
              <h3 className="mt-3 font-light text-[clamp(1.6rem,2vw,2rem)] tracking-[-0.03em]">{plan.name}</h3>
              <p className="mt-6 font-light text-[clamp(2.6rem,4vw,3.4rem)] leading-none tracking-[-0.05em] text-gold-light tabular-nums">
                {plan.priceDisplay}
              </p>
              <p className="mt-2 text-[0.85rem] text-ivory/60">a month</p>
              <p className="mt-1 text-[0.85rem] text-ivory/60">{plan.setupLine}</p>
              <p className="mt-3 text-[0.85rem] text-gold-light">{plan.userLimit}</p>
              <p className="mt-6 text-[0.98rem] leading-relaxed text-ivory/80">{plan.summary}</p>
              <div className="mt-auto pt-8">
                <Link href="/pricing#custom-infrastructure" className={`${goldButton} w-full`}>
                  <span>{aiEmployeesPricing.planAction}</span>
                </Link>
              </div>
            </Card>
          ))}
        </ol>

      </Sheet>

      <Sheet surface="paper" id="expert" aria-labelledby="expert-title" className="site-section">
        <div className="mx-auto max-w-[40rem] text-center">
          <Eyebrow>{aiEmployeesExpert.eyebrow}</Eyebrow>
          <h2
            id="expert-title"
            className="mt-4 font-light text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.02] tracking-[-0.045em] text-balance"
          >
            {aiEmployeesExpert.name}
          </h2>
          <p className="mt-3 font-display text-[0.72rem] tracking-[0.16em] text-gold-dark uppercase">
            {aiEmployeesExpert.role}
          </p>
          <p className="mx-auto mt-6 max-w-[48ch] text-[1.05rem] leading-relaxed text-muted-dark">
            {aiEmployeesExpert.body}
          </p>
          <p className="mt-8">
            <a
              href={`tel:${expertPhone.href}`}
              className="inline-flex min-h-12 items-center justify-center rounded-[6px] border border-gold bg-ink px-6 font-bold text-ivory"
            >
              {aiEmployeesExpert.phoneLabel} {expertPhone.display}
            </a>
          </p>
        </div>
      </Sheet>

      <Sheet surface="ink" rise className="site-section text-center">
        <div className="mx-auto max-w-[46rem]">
          <Eyebrow>{aiEmployeesCta.eyebrow}</Eyebrow>
          <h2 className="mt-4 font-light text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.02] tracking-[-0.045em] text-balance">
            {aiEmployeesCta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-[42ch] text-muted-light">{aiEmployeesCta.line}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a className={goldButton} href="#plans">
              <span>{aiEmployeesCta.plansAction}</span>
            </a>
            <Link className={goldButton} href="/enterprise">
              <span>{aiEmployeesCta.enterpriseAction}</span>
            </Link>
          </div>
          <p className="mx-auto mt-9 max-w-[56ch] text-[0.84rem] text-muted-light">{softwareDisclaimer}</p>
        </div>
      </Sheet>
    </>
  );
}
