import type { Metadata } from "next";
import Image from "next/image";
import { EditionLevels } from "@/components/offers/EditionLevels";
import { Sheet } from "@/components/ui/Blocks";
import { Eyebrow } from "@/components/ui/Section";
import { editionPricing } from "@/lib/editionPlans";
import { FUNDING_LINE } from "@/lib/legal";
import { absoluteUrl } from "@/lib/seo";
import { indexable } from "@/lib/site";

const edition = editionPricing.lending;
const PATH = edition.pricingPath;

const description =
  "Genesis is software for lending teams. See the Lending Edition of Level 01, Level 02 and Level 03, from 1 user to unlimited users.";

export const metadata: Metadata = {
  title: "Lending Edition Pricing",
  description,
  alternates: indexable ? { canonical: absoluteUrl(PATH) } : undefined,
  openGraph: {
    title: "Lending Edition Pricing | Genesis AI",
    description,
    type: "website",
    siteName: "Genesis AI",
    locale: "en_US",
    url: absoluteUrl(PATH),
  },
  twitter: {
    card: "summary_large_image",
    title: "Lending Edition Pricing | Genesis AI",
    description,
  },
};

export default function LendingPricingPage() {
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
          <Eyebrow className="mt-8">{edition.eyebrow}</Eyebrow>
          <h1 className="mx-auto mt-5 max-w-[20ch] font-light text-[clamp(2.8rem,6vw,5.4rem)] leading-[1.02] tracking-[-0.045em] text-balance">
            {edition.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-[48ch] text-[1.08rem] leading-relaxed text-ivory/74">
            {edition.lede}
          </p>
        </div>
      </section>

      <Sheet surface="paper" rise aria-labelledby="plans-title" className="site-section">
        <h2 id="plans-title" className="sr-only">
          Levels
        </h2>
        <EditionLevels edition="lending" />

        <p className="mx-auto mt-12 max-w-[56ch] text-center text-[0.84rem] text-muted-dark">
          {edition.footer}
        </p>
        <p className="mx-auto mt-6 max-w-[56ch] text-center text-[0.8rem] text-muted-dark">
          {FUNDING_LINE}
        </p>
      </Sheet>
    </>
  );
}
