import Image from "next/image";
import { JsonLd } from "@/components/seo/JsonLd";
import { Sheet } from "@/components/ui/Blocks";
import { Eyebrow } from "@/components/ui/Section";
import { FUNDING_LINE } from "@/lib/legal";
import { breadcrumbSchema, graph } from "@/lib/schema";

export const DRAFT_BANNER =
  "DRAFT for legal review. This page is not legal advice and is not a final policy.";

export type LegalSection = { heading: string; body: readonly string[] };

/**
 * A draft legal page in the lending page visual family: logo, eyebrow, a clear
 * draft banner, and a paper sheet of plain sections. Every draft page carries
 * the funding disclaimer and makes clear it will be replaced after legal review.
 */
export function LegalDraft({
  path,
  eyebrow,
  title,
  sections,
}: {
  path: string;
  eyebrow: string;
  title: string;
  sections: readonly LegalSection[];
}) {
  return (
    <>
      <JsonLd data={graph(breadcrumbSchema(path))} />

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
          <Eyebrow className="mt-8">{eyebrow}</Eyebrow>
          <h1 className="mx-auto mt-5 max-w-[20ch] font-light text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.04] tracking-[-0.045em] text-balance">
            {title}
          </h1>
          <p className="mx-auto mt-8 max-w-[52ch] rounded-[6px] border border-gold/60 bg-ink-soft px-5 py-4 text-[0.95rem] leading-relaxed text-ivory/80">
            {DRAFT_BANNER}
          </p>
        </div>
      </section>

      <Sheet surface="paper" rise className="site-section">
        <div className="mx-auto grid max-w-[46rem] gap-10">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="font-display text-[0.72rem] tracking-[0.16em] text-gold-dark uppercase">
                {section.heading}
              </h2>
              <div className="mt-3 grid gap-3 text-[1.02rem] leading-relaxed text-ink/85">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-[56ch] text-center text-[0.8rem] text-muted-dark">
          {FUNDING_LINE}
        </p>
      </Sheet>
    </>
  );
}
