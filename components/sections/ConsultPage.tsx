import Image from "next/image";
import { ConsultationForm } from "@/app/(marketing)/contact/ConsultationForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { Sheet } from "@/components/ui/Blocks";
import { Eyebrow } from "@/components/ui/Section";
import { contact } from "@/lib/content";
import { FUNDING_LINE } from "@/lib/legal";
import { breadcrumbSchema, graph } from "@/lib/schema";

/**
 * A consult or demo request. Uses the existing consultation form. No checkout.
 */
export function ConsultPage({
  path,
  eyebrow,
  title,
  lede,
  interest,
}: {
  path: string;
  eyebrow: string;
  title: string;
  lede: string;
  interest: string;
}) {
  return (
    <>
      <JsonLd data={graph(breadcrumbSchema(path))} />

      <section className="border-b border-line-dark bg-ink pt-[calc(var(--header-height)+56px)] pb-16 text-center text-ivory md:pb-20">
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
          <h1 className="mx-auto mt-5 max-w-[18ch] font-light text-[clamp(2.4rem,8vw,4.4rem)] leading-[1.04] tracking-[-0.045em] text-balance">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-[46ch] text-[1.02rem] leading-relaxed text-ivory/74">{lede}</p>
          <p className="mx-auto mt-4 text-[0.9rem] text-ivory/60">
            <a href={`mailto:${contact.email}`} className="border-b border-ivory/30">
              {contact.email}
            </a>
          </p>
        </div>
      </section>

      <Sheet surface="paper" rise className="site-section">
        <div className="mx-auto max-w-[46rem]">
          <ConsultationForm interest={interest} />
          <p className="mx-auto mt-8 max-w-[56ch] text-center text-[0.8rem] text-muted-dark">{FUNDING_LINE}</p>
        </div>
      </Sheet>
    </>
  );
}
