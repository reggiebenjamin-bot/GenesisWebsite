import type { Metadata } from "next";
import Link from "next/link";
import { EditionLanding } from "@/components/sections/EditionLanding";
import { Sheet } from "@/components/ui/Blocks";
import { Eyebrow } from "@/components/ui/Section";
import { aiEmployeesEnterprise } from "@/lib/aiEmployees";
import { editionByPath } from "@/lib/editions";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/enterprise");

const edition = editionByPath("/enterprise")!;

const primaryCta =
  "inline-flex min-h-[52px] items-center justify-center rounded-[6px] border border-gold bg-ink px-6 text-[0.84rem] leading-[1.1] font-bold tracking-[0.025em] text-ivory transition-colors duration-200 hover:bg-ink-soft";

export default function EnterprisePage() {
  return (
    <>
      <EditionLanding edition={edition} />

      <Sheet surface="paper" rise aria-labelledby="done-for-you-title" className="site-section">
        <div className="mx-auto max-w-[40rem] text-center">
          <Eyebrow>{aiEmployeesEnterprise.eyebrow}</Eyebrow>
          <h2
            id="done-for-you-title"
            className="mt-4 font-light text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-[-0.04em] text-balance"
          >
            {aiEmployeesEnterprise.publicTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-[46ch] text-[1.02rem] leading-relaxed text-muted-dark">
            {aiEmployeesEnterprise.summary}
          </p>
          <div className="mt-9 flex justify-center">
            <Link href="/contact" className={primaryCta}>
              Talk to us
            </Link>
          </div>
        </div>
      </Sheet>
    </>
  );
}
