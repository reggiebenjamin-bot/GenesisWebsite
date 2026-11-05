import type { Metadata } from "next";
import Image from "next/image";
import { Sheet } from "@/components/ui/Blocks";
import { Eyebrow } from "@/components/ui/Section";
import { lendingPage } from "@/lib/lendingPage";
import { absoluteUrl } from "@/lib/seo";
import { indexable } from "@/lib/site";

const PATH = "/lending";

const description =
  "Genesis is software for lending teams. Brokers and lender desks capture, qualify and follow up with borrower inquiries faster, so no inquiry sits waiting.";

export const metadata: Metadata = {
  title: "Software for Lending Teams",
  description,
  alternates: indexable ? { canonical: absoluteUrl(PATH) } : undefined,
  openGraph: {
    title: "Software for Lending Teams | Genesis AI",
    description,
    type: "website",
    siteName: "Genesis AI",
    locale: "en_US",
    url: absoluteUrl(PATH),
  },
  twitter: {
    card: "summary_large_image",
    title: "Software for Lending Teams | Genesis AI",
    description,
  },
};

/* Dark button with a gold outline, for the primary call to action. */
const primaryCta =
  "inline-flex min-h-[52px] items-center justify-center rounded-[6px] border border-gold bg-ink px-6 text-[0.84rem] leading-[1.1] font-bold tracking-[0.025em] text-ivory transition-colors duration-200 hover:bg-ink-soft";

/* Quiet outline on paper, for the secondary call to action. */
const secondaryCta =
  "inline-flex min-h-[52px] items-center justify-center rounded-[6px] border border-ink/25 bg-transparent px-6 text-[0.84rem] leading-[1.1] font-bold tracking-[0.025em] text-ink transition-colors duration-200 hover:border-ink";

export default function LendingPage() {
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
          <Eyebrow className="mt-8">{lendingPage.eyebrow}</Eyebrow>
          <h1 className="mx-auto mt-5 max-w-[20ch] font-light text-[clamp(2.8rem,6vw,5.4rem)] leading-[1.02] tracking-[-0.045em] text-balance">
            {lendingPage.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-[48ch] text-[1.08rem] leading-relaxed text-ivory/74">
            {lendingPage.lede}
          </p>
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

        <div className="mx-auto mt-12 flex max-w-[34rem] flex-col gap-3 sm:flex-row sm:justify-center">
          <a className={primaryCta} href={lendingPage.ctas.primary.href}>
            {lendingPage.ctas.primary.label}
          </a>
          <a className={secondaryCta} href={lendingPage.ctas.secondary.href}>
            {lendingPage.ctas.secondary.label}
          </a>
        </div>

        <p className="mx-auto mt-12 max-w-[56ch] text-center text-[0.8rem] text-muted-dark">
          {lendingPage.disclaimer}
        </p>
      </Sheet>
    </>
  );
}
