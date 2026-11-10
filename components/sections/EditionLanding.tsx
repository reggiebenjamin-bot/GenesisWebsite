import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { Sheet } from "@/components/ui/Blocks";
import { Eyebrow } from "@/components/ui/Section";
import type { Edition } from "@/lib/editions";
import { breadcrumbSchema, graph } from "@/lib/schema";

/* Dark button with a gold outline, for the primary call to action. */
const primaryCta =
  "inline-flex min-h-[52px] items-center justify-center rounded-[6px] border border-gold bg-ink px-6 text-[0.84rem] leading-[1.1] font-bold tracking-[0.025em] text-ivory transition-colors duration-200 hover:bg-ink-soft";

/* Quiet outline on paper, for the secondary call to action. */
const secondaryCta =
  "inline-flex min-h-[52px] items-center justify-center rounded-[6px] border border-ink/25 bg-transparent px-6 text-[0.84rem] leading-[1.1] font-bold tracking-[0.025em] text-ink transition-colors duration-200 hover:border-ink";

/** A single link that renders as a Next Link for internal routes, an anchor for external. */
function CtaLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

/**
 * One edition landing page, modeled on the Lending page: logo, eyebrow,
 * headline, lede, three benefit points, calls to action, and the funding
 * disclaimer. The copy comes from lib/editions so it stays in sync with the
 * homepage edition cards.
 */
export function EditionLanding({
  edition,
  children,
}: {
  edition: Edition;
  /** Extra content under the calls to action, such as the edition Levels. */
  children?: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={graph(breadcrumbSchema(edition.href))} />

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
            {edition.body}
          </p>
        </div>
      </section>

      <Sheet surface="paper" rise aria-labelledby="edition-title" className="site-section">
        <h2 id="edition-title" className="sr-only">
          What the {edition.name} edition does
        </h2>
        <ul className="mx-auto grid max-w-[58rem] gap-6 sm:grid-cols-3">
          {edition.points.map((point) => (
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

        {edition.ctas.length ? (
          <div className="mx-auto mt-12 flex max-w-[46rem] flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            {edition.ctas.map((cta, index) => (
              <CtaLink key={cta.href} href={cta.href} className={index === 0 ? primaryCta : secondaryCta}>
                {cta.label}
              </CtaLink>
            ))}
          </div>
        ) : null}

        {children ? <div className="mt-16">{children}</div> : null}

        <p className="mx-auto mt-12 max-w-[56ch] text-center text-[0.8rem] text-muted-dark">
          {edition.disclaimer}
        </p>
      </Sheet>
    </>
  );
}
