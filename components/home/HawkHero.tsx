import Link from "next/link";
import type { ReactNode } from "react";
import { preconnect } from "react-dom";
import { GenesisMark } from "@/components/layout/GenesisMark";
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
  "secondary-action inline-flex min-h-[53px] w-full items-center justify-center px-6";

/**
 * The opening, over the hawk. The hawk fills the frame behind the centred
 * copy, with a scrim under the copy so the text stays readable.
 */
export function HawkHero() {
  preconnect(HAWK_IMAGE_ORIGIN, { crossOrigin: "anonymous" });

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
          <Link href="/how-it-works" className={secondaryAction}>
            <span>See How It Works</span>
          </Link>
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
        {hero.eyebrow}
      </p>
      {/* The page's one H1 is the headline a visitor sees, with the plain line under it saying
          who Genesis is for and what it does. */}
      <h1 className={cn("mt-5 text-[clamp(2.75rem,6.1vw,5.6rem)] leading-[0.98] tracking-[-0.05em] text-balance", styles.title)}>
        {hero.title} <span className="text-gold-light">{hero.accent}</span>
      </h1>
      {hero.subline ? (
        <p className={cn("mx-auto mt-5 max-w-[40ch] text-[clamp(1.08rem,1.5vw,1.3rem)] leading-snug text-balance text-ivory", styles.subline)}>
          {hero.subline}
        </p>
      ) : null}

      <p className={cn("mx-auto mt-4 max-w-[44ch] text-[clamp(1rem,1.3vw,1.18rem)] leading-relaxed text-balance text-ivory/74", styles.summary)}>
        <span className={styles.summaryLong}>{hero.summary}</span>
        {hero.summaryShort ? <span className={styles.summaryShort}>{hero.summaryShort}</span> : null}
      </p>

      <div className={cn("mx-auto mt-9 grid max-w-[30rem] gap-3 sm:grid-cols-2", styles.actions)}>{children}</div>

      {/* A quiet cue for a pastor who lands here: a text link, not a third button,
          set in ivory so it never pulls the eye from the business call to action. */}
      <p className="mt-5 text-[0.9rem] leading-snug text-ivory/65">
        <TrackClick event="ministry_cue_clicked" from="hero">
          <Link
            href={ministryCue.href}
            aria-label={ministryCue.ariaLabel}
            className="group inline-flex min-h-11 items-center gap-2.5 rounded-[6px] px-2 transition-colors duration-200 hover:text-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light"
          >
            <GenesisMark className="h-[14px] w-auto shrink-0 opacity-80" />
            <span>
              {ministryCue.lead}{" "}
              <span className="text-ivory/85 underline decoration-ivory/30 underline-offset-4 transition-colors duration-200 group-hover:text-gold-light group-hover:decoration-gold-light">
                {ministryCue.label}
              </span>
            </span>
          </Link>
        </TrackClick>
      </p>
    </div>
  );
}
