import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EditionLevels } from "@/components/offers/EditionLevels";
import { JsonLd } from "@/components/seo/JsonLd";
import { Sheet } from "@/components/ui/Blocks";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { Eyebrow } from "@/components/ui/Section";
import { lendingPage } from "@/lib/lendingPage";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, graph } from "@/lib/schema";

export const metadata: Metadata = pageMetadata("/lending");

/* The site's secondary action on ink: dark with a gold hairline, the same height as the gold primary. */
const secondaryCta = "secondary-action inline-flex min-h-[53px] w-full items-center justify-center px-6";

export default function LendingPage() {
  return (
    <>
      <JsonLd data={graph(breadcrumbSchema("/lending"))} />

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
          <Eyebrow className="mt-8">{lendingPage.eyebrow}</Eyebrow>
          <h1 className="mx-auto mt-5 max-w-[20ch] font-light text-[clamp(2.8rem,6vw,5.4rem)] leading-[1.02] tracking-[-0.045em] text-balance">
            {lendingPage.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-[48ch] text-[1.08rem] leading-relaxed text-ivory/74">
            {lendingPage.lede}
          </p>
          {/* The calls to action sit in the hero, on the first screen. */}
          <div className="mx-auto mt-9 grid max-w-[34rem] gap-3 sm:grid-cols-2">
            <ConsultationButton href={lendingPage.ctas.primary.href} className="w-full">
              {lendingPage.ctas.primary.label}
            </ConsultationButton>
            <Link className={secondaryCta} href={lendingPage.ctas.secondary.href}>
              <span>{lendingPage.ctas.secondary.label}</span>
            </Link>
          </div>
        </div>
      </section>

      <Sheet surface="paper" rise aria-labelledby="lending-title" className="site-section">
        <h2 id="lending-title" className="sr-only">
          What the Lending pack does
        </h2>
        <ul className="mx-auto grid max-w-[58rem] gap-6 sm:grid-cols-3">
          {lendingPage.benefits.map((benefit) => (
            <li
              key={benefit}
              className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2.5 text-[0.95rem] leading-snug"
            >
              <span aria-hidden="true" className="text-gold-dark">
                +
              </span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <div className="mt-16">
          <EditionLevels edition="lending" />
        </div>

        <p className="mx-auto mt-12 max-w-[56ch] text-center text-[0.8rem] text-muted-dark">
          {lendingPage.disclaimer}
        </p>
      </Sheet>
    </>
  );
}
