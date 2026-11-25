import Link from "next/link";
import type { ReactNode } from "react";
import { preconnect, preload } from "react-dom";
import { TrackClick } from "@/components/ui/TrackClick";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { ministryCue } from "@/lib/ministryPage";
import { type OfferPathId, pathHeroes } from "@/lib/offers";
import { cn } from "@/lib/utils";
import { HawkAscii } from "./HawkAscii";
import { HAWK_IMAGE_ORIGIN, HAWK_IMAGE_SRC } from "./hawkAsset";
import styles from "./HawkHero.module.css";
import { hawkFrameStyle } from "./hawkSettings";

const secondaryAction =
  "secondary-action inline-flex min-h-[52px] w-full items-center justify-center px-6";

/* The editions in the nav order, each by its own short name; churches last, as "Churches". */
const heroEditions = [
  { label: "Lending", href: "/lending" },
  { label: "Real Estate Pros", href: "/real-estate" },
  { label: "Business", href: "/business" },
  { label: "Churches", href: ministryCue.href },
] as const;

/* True of the assessment today: free, seven short steps, and no account is made. */
const heroReassurance = "Free. Seven short steps. We ask for your email at the end.";

/**
 * The opening, over the hawk. The hawk fills the frame behind the centred
 * copy, with a scrim under the copy so the text stays readable.
 */
export function HawkHero() {
  preconnect(HAWK_IMAGE_ORIGIN, { crossOrigin: "anonymous" });
  /* The hawk, asked for early and once, with the same CORS mode the effect uses. */
  preload(HAWK_IMAGE_SRC, { as: "image", crossOrigin: "anonymous", fetchPriority: "high" });

  return (
    <section
      data-offer-region
      className={cn("relative isolate overflow-hidden bg-ink text-ivory", styles.hero)}
      style={hawkFrameStyle}
    >
      <div className={styles.art}>
        <HawkAscii src={HAWK_IMAGE_SRC} className="size-full" />
      </div>

      <div className={cn("shell relative z-10", styles.inner)}>
        <HeroCopy path="custom-infrastructure">
          <TrackClick event="assessment_link_clicked" from="hero" selector="a[href^='/assessment']">
            <ConsultationButton href="/assessment" className="w-full">
              Assess My Business
            </ConsultationButton>
          </TrackClick>
          <TrackClick event="how_it_works_clicked" from="hero">
            <Link href="/how-it-works" className={secondaryAction}>
              <span>See How It Works</span>
            </Link>
          </TrackClick>
        </HeroCopy>
      </div>
    </section>
  );
}

function HeroCopy({ path, children }: { path: OfferPathId; children: ReactNode }) {
  const hero = pathHeroes[path];

  return (
    <div className={styles.copy}>
      <p
        className={cn(
          "font-display text-[0.75rem] leading-[1.4] font-semibold tracking-[0.1em] text-gold uppercase sm:tracking-[0.14em]",
          styles.eyebrow,
        )}
      >
        <span className={styles.eyebrowLong}>{hero.eyebrow}</span>
        {/* A narrow phone fits the short form on one line. */}
        <span className={styles.eyebrowShort}>
          {hero.eyebrow.replace(/ for .*$/i, "")}
        </span>
      </p>
      {/* The page's one H1 is the headline a visitor sees, with the plain line under it saying
          who Genesis is for and what it does. */}
      <h1 className={cn("mt-5 font-light text-[clamp(2.75rem,6.1vw,5.6rem)] leading-[0.98] tracking-[-0.05em] text-balance", styles.title)}>
        {hero.title} <span className="text-gold-light">{hero.accent}</span>
      </h1>
      {/* One plain line under the headline, then the buttons: who Genesis is for and what it does. */}
      {hero.subline ? (
        <p className={cn("mx-auto mt-5 max-w-[40ch] text-[clamp(1.08rem,1.5vw,1.3rem)] leading-snug text-balance text-ivory", styles.subline)}>
          {hero.subline}
        </p>
      ) : null}

      <div className={cn("mx-auto mt-8 grid max-w-[32rem] gap-3 sm:grid-cols-2", styles.actions)}>{children}</div>

      <p className={cn("mt-4 text-[0.88rem] text-ivory/66", styles.reassure)}>{heroReassurance}</p>

      {/* One tap to the page built for you: every edition, churches included, in one quiet row, all four styled alike. */}
      <nav aria-label="Built for" className={cn("mt-3", styles.builtFor)}>
        <span className={styles.builtForLabel}>Built for</span>
        <TrackClick event="edition_link_clicked" from="hero" selector="a[data-edition]">
          <TrackClick event="ministry_cue_clicked" from="hero" selector={`a[href='${ministryCue.href}']`}>
            <ul className={styles.builtForList}>
              {heroEditions.map((edition) => (
                <li key={edition.href}>
                  <Link
                    href={edition.href}
                    data-edition={edition.href === ministryCue.href ? undefined : edition.href.slice(1)}
                    data-track-edition={edition.href.slice(1)}
                    className={styles.builtForLink}
                  >
                    {edition.label}
                  </Link>
                </li>
              ))}
            </ul>
          </TrackClick>
        </TrackClick>
      </nav>
    </div>
  );
}
