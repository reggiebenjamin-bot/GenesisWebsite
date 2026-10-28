"use client";

import { useState } from "react";
import { packs } from "@/packs";
import type { VerticalId } from "@/packs/types";
import { Card, ClosingBand, Disclosure, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { Button, TextLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { offers, priceNote } from "@/packs/pricing";
import { platformCopy } from "@/lib/platform/copy";
import { cn } from "@/lib/utils";
import { FundingDisclaimer } from "./Chrome";
import { ProductPreview } from "./Preview";

const copy = platformCopy.landing;

export function Landing() {
  const [active, setActive] = useState<VerticalId>("general");
  const pack = packs.find((item) => item.id === active) ?? packs[0];

  function onTabsKey(event: React.KeyboardEvent<HTMLDivElement>) {
    const ids = packs.map((item) => item.id);
    const index = ids.indexOf(active);
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = event.key === "ArrowRight" ? (index + 1) % ids.length : (index - 1 + ids.length) % ids.length;
    const id = ids[next];
    if (id) setActive(id);
  }

  return (
    <div data-testid="platform-landing">
      <section className="bg-ink py-[clamp(88px,11vw,136px)] text-ivory">
        <div className="shell grid items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] lg:gap-16">
          <div>
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h1 className="mt-6 max-w-[14ch] text-[clamp(2.8rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.04em] text-balance">
              {copy.title}
            </h1>
            <p className="mt-7 max-w-xl text-[1.125rem] leading-relaxed text-ivory/75">{copy.lede}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button href="/business-check" className="w-full sm:w-auto" data-testid="primary-cta">
                {copy.primary}
              </Button>
              <TextLink href="/signup" light>
                {copy.secondary}
              </TextLink>
            </div>

            <div
              role="tablist"
              aria-label={copy.stepsEyebrow}
              className="mt-10 grid gap-2 sm:grid-cols-3"
              onKeyDown={onTabsKey}
            >
              {packs.map((item) => {
                const selected = item.id === pack.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    id={`tab-${item.id}`}
                    aria-selected={selected}
                    aria-controls="pack-panel"
                    tabIndex={selected ? 0 : -1}
                    data-testid={`vertical-tab-${item.id}`}
                    onClick={() => setActive(item.id)}
                    className={cn(
                      "min-h-14 rounded-[6px] border px-4 text-left text-[1.05rem] font-medium transition-colors duration-200 ease-editorial motion-reduce:transition-none",
                      selected
                        ? "border-ivory bg-ivory text-ink"
                        : "border-ivory/25 text-ivory hover:border-ivory/70",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div id="pack-panel" role="tabpanel" aria-labelledby={`tab-${pack.id}`} className="mt-8">
              <p className="max-w-xl text-[1.125rem] leading-relaxed text-ivory/80">{pack.promise}</p>
              <ul className="mt-6 grid gap-4">
                {pack.benefits.map((benefit) => (
                  <li key={benefit} className="grid grid-cols-[8px_minmax(0,1fr)] gap-4 text-[1.125rem] leading-snug">
                    <span aria-hidden="true" className="mt-2 size-2 rounded-full bg-gold" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              {pack.fundingDisclaimer ? (
                <div className="mt-6">
                  <FundingDisclaimer text={pack.fundingDisclaimer} light />
                </div>
              ) : null}
              <p className="mt-6 max-w-xl text-[1rem] leading-relaxed text-ivory/60">{copy.voice}</p>
            </div>
          </div>
          <ProductPreview pack={pack} />
        </div>
      </section>

      <Sheet surface="paper" rise>
        <SectionIntro eyebrow={copy.proofEyebrow} title={copy.proofTitle} />
        <p className="mb-8 max-w-2xl text-[1.125rem] leading-relaxed text-ink/75">{copy.proofBody}</p>
        <ul className="grid gap-4 md:grid-cols-3">
          {packs.map((item) => (
            <Card key={item.id} as="li">
              <Eyebrow>[CONFIRM]</Eyebrow>
              <h3 className="mt-4 text-[1.6rem] leading-none tracking-[-0.04em]">{item.label}</h3>
              <p className="mt-4 text-[1.125rem] leading-relaxed text-ink/70">Outcome not verified.</p>
            </Card>
          ))}
        </ul>
      </Sheet>

      <section className="site-section bg-ivory py-[clamp(88px,11vw,136px)] text-ink">
        <div className="shell">
          <SectionIntro eyebrow={copy.stepsEyebrow} title={copy.stepsTitle} />
          <ol className="grid gap-4 lg:grid-cols-3">
            {copy.steps.map((step) => (
              <li key={step.n}>
                <Card className="h-full">
                  <p className="font-display text-[0.8rem] tracking-[0.18em] text-gold-dark">{step.n}</p>
                  <h3 className="mt-4 text-[1.75rem] leading-none tracking-[-0.04em]">{step.title}</h3>
                  <p className="mt-4 text-[1.125rem] leading-relaxed text-ink/75">{step.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Sheet surface="paper">
        <SectionIntro
          layout="split"
          eyebrow={copy.priceEyebrow}
          title={copy.priceTitle}
          aside={<p className="max-w-sm text-[1.125rem] leading-relaxed text-ink/75">{copy.priceAside}</p>}
        />
        <ul className="grid gap-4 lg:grid-cols-3">
          {offers.map((offer) => (
            <Card key={offer.id} as="li" className="flex h-full flex-col">
              <h3 className="text-[1.75rem] leading-none tracking-[-0.04em]">{offer.name}</h3>
              <p className="mt-4 text-[1.125rem] leading-relaxed text-ink/75">{offer.summary}</p>
              <ol className="mt-6 grid gap-4">
                {offer.levels.map((level) => (
                  <li key={level.id} className="border-t border-line-light pt-4">
                    <p className="font-display text-[0.69rem] tracking-[0.18em] text-gold-dark uppercase">
                      {level.label}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <p>
                        <span className="block text-[0.95rem] text-ink/60">{copy.setup}</span>
                        <span className="mt-1 block text-[1.6rem] leading-none tracking-[-0.04em] tabular-nums">
                          {level.price.setup}
                        </span>
                      </p>
                      <p>
                        <span className="block text-[0.95rem] text-ink/60">{copy.monthly}</span>
                        <span className="mt-1 block text-[1.6rem] leading-none tracking-[-0.04em] tabular-nums">
                          {level.price.monthly}
                        </span>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-[1.05rem] leading-relaxed text-ink/70">{priceNote}</p>
      </Sheet>

      <section className="site-section bg-ivory py-[clamp(88px,11vw,136px)] text-ink">
        <div className="shell max-w-3xl">
          <SectionIntro eyebrow={copy.faqEyebrow} title={copy.faqTitle} />
          <div className="grid">
            {copy.faqs.map((faq) => (
              <Disclosure key={faq.q} summary={faq.q}>
                {faq.a}
              </Disclosure>
            ))}
          </div>
        </div>
      </section>

      <ClosingBand
        eyebrow={copy.closeEyebrow}
        title={copy.closeTitle}
        line={copy.closeLine}
        actions={
          <>
            <Button href="/business-check">{copy.primary}</Button>
            <TextLink href="/signup" light>
              {copy.secondary}
            </TextLink>
          </>
        }
        footnote={<p>{copy.closeNote}</p>}
      />
    </div>
  );
}
