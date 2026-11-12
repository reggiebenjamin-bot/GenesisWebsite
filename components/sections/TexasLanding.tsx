import Image from "next/image";
import Link from "next/link";
import { EditionLevels } from "@/components/offers/EditionLevels";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqList } from "@/components/ui/FaqList";
import { Card, Sheet } from "@/components/ui/Blocks";
import { Eyebrow } from "@/components/ui/Section";
import { managedPlans } from "@/lib/offers";
import { breadcrumbSchema, faqPageSchema, graph } from "@/lib/schema";
import type { TexasLanding } from "@/lib/texasPages";

const primaryCta =
  "inline-flex min-h-[52px] items-center justify-center rounded-[6px] border border-gold bg-ink px-6 text-[0.84rem] leading-[1.1] font-bold tracking-[0.025em] text-ivory transition-colors duration-200 hover:bg-ink-soft";

const secondaryCta =
  "inline-flex min-h-[52px] items-center justify-center rounded-[6px] border border-ink/25 bg-transparent px-6 text-[0.84rem] leading-[1.1] font-bold tracking-[0.025em] text-ink transition-colors duration-200 hover:border-ink";

const relatedLink =
  "inline-flex min-h-[44px] items-center text-[0.95rem] text-ink/80 underline decoration-gold/70 underline-offset-4 transition-colors duration-200 hover:text-ink";

/**
 * A Texas use case or city landing page, visually aligned with the edition
 * pages: logo, eyebrow, headline, lede, three points, calls to action,
 * optional Levels, related links, questions, and the funding disclaimer.
 */
export function TexasLanding({ page }: { page: TexasLanding }) {
  return (
    <>
      <JsonLd data={graph(breadcrumbSchema(page.path), faqPageSchema(page.faqs, page.path))} />

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
          <Eyebrow className="mt-8">{page.eyebrow}</Eyebrow>
          <h1 className="mx-auto mt-5 max-w-[20ch] font-light text-[clamp(2.8rem,6vw,5.4rem)] leading-[1.02] tracking-[-0.045em] text-balance">
            {page.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-[48ch] text-[1.08rem] leading-relaxed text-ivory/74">
            {page.lede}
          </p>
        </div>
      </section>

      <Sheet surface="paper" rise aria-labelledby="texas-title" className="site-section">
        <h2 id="texas-title" className="sr-only">
          What Genesis does
        </h2>
        <ul className="mx-auto grid max-w-[58rem] gap-6 sm:grid-cols-3">
          {page.points.map((point) => (
            <li
              key={point}
              className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2.5 text-[0.95rem] leading-snug"
            >
              <span aria-hidden="true" className="text-gold-dark">
                +
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-12 flex max-w-[46rem] flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          {page.ctas.map((cta, index) => (
            <Link key={cta.href} href={cta.href} className={index === 0 ? primaryCta : secondaryCta}>
              {cta.label}
            </Link>
          ))}
        </div>

        {page.capabilities ? (
          <div className="mt-16">
            <h2 className="text-center text-[1.35rem] font-light tracking-[-0.02em]">
              What Genesis handles
            </h2>
            <ul className="mx-auto mt-6 grid max-w-[72rem] gap-4 md:grid-cols-3">
              {page.capabilities.map((item) => (
                <Card key={item.title} as="li" className="flex h-full flex-col">
                  <h3 className="text-[clamp(1.15rem,1.7vw,1.35rem)] leading-snug tracking-[-0.02em]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-snug text-muted-dark">{item.body}</p>
                </Card>
              ))}
            </ul>
            {page.custom ? (
              <p className="mx-auto mt-6 max-w-[56ch] text-center text-[0.98rem] leading-snug">
                {page.custom}
              </p>
            ) : null}
          </div>
        ) : null}

        {page.edition ? (
          <div className="mt-16">
            <EditionLevels edition={page.edition} />
          </div>
        ) : null}

        {page.pricing ? (
          <div className="mt-16">
            <h2 className="text-center text-[1.35rem] font-light tracking-[-0.02em]">
              Plans
            </h2>
            <ol className="mx-auto mt-6 grid max-w-[72rem] gap-4 md:grid-cols-3">
              {managedPlans.map((plan) => (
                <Card key={plan.id} as="li" className="flex h-full flex-col">
                  <p className="font-display text-[0.62rem] tracking-[0.16em] text-gold-dark uppercase">
                    Level {plan.step}
                  </p>
                  <h3 className="mt-3 text-[clamp(1.15rem,1.7vw,1.35rem)] leading-snug tracking-[-0.02em]">
                    {plan.name}
                  </h3>
                  <p className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-[clamp(2.1rem,3vw,2.7rem)] leading-none tracking-[-0.05em] tabular-nums">
                      {plan.priceDisplay}
                    </span>
                    <span className="text-[0.9rem] text-muted-dark">per month</span>
                  </p>
                  <p className="mt-2 text-[0.85rem] text-muted-dark">{plan.setupLine}</p>
                  <p className="mt-5 text-[0.92rem] leading-snug">{plan.userLimit}</p>
                </Card>
              ))}
            </ol>
            <p className="mt-6 text-center">
              <Link href="/pricing" className={relatedLink}>
                See what each Level covers
              </Link>
            </p>
          </div>
        ) : null}

        <nav aria-label="Related pages" className="mx-auto mt-16 max-w-[46rem]">
          <p className="text-center font-display text-[0.69rem] leading-[1.4] font-semibold tracking-[0.18em] uppercase text-muted-dark">
            Also in Texas
          </p>
          <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-3">
            {page.related.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={relatedLink}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mx-auto mt-16 max-w-[40rem]">
          <h2 className="text-center text-[1.35rem] font-light tracking-[-0.02em]">Questions</h2>
          <FaqList items={page.faqs} className="mt-6" />
        </div>

        <p className="mx-auto mt-12 max-w-[56ch] text-center text-[0.8rem] text-muted-dark">
          {page.disclaimer}
        </p>
      </Sheet>
    </>
  );
}
