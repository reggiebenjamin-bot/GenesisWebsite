import Link from "next/link";
import type { ReactNode } from "react";
import { preconnect } from "react-dom";
import { GenesisMark } from "@/components/layout/GenesisMark";
import { TrackClick } from "@/components/ui/TrackClick";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { ministryCue } from "@/lib/ministryPage";
import { genesisPositioning, type OfferPathId, pathHeroes } from "@/lib/offers";
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
        {/* The page's one H1 names what Genesis is, as the page title does. Each
            path's title below is the visible heading for that path; there are
            two of them in the HTML, so they cannot both be the H1. */}
        <h1 className="sr-only">Genesis AI: {genesisPositioning.category}</h1>

        <HeroCopy path="custom-infrastructure">
          <ConsultationButton href="/assessment" className="w-full">
            Assess My Business
          </ConsultationButton>
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
      <p className="font-display text-[0.69rem] leading-[1.4] font-semibold tracking-[0.12em] text-gold uppercase sm:tracking-[0.18em]">
        {hero.eyebrow}
      </p>
      <h2 className={cn("mt-5 text-[clamp(2.75rem,6.1vw,5.6rem)] leading-[0.98] tracking-[-0.05em] text-balance", styles.title)}>
        {hero.title} <span className="text-gold-light">{hero.accent}</span>
      </h2>

      <p className={cn("mx-auto mt-6 max-w-[44ch] text-[clamp(1rem,1.3vw,1.18rem)] leading-relaxed text-balance text-ivory/74", styles.summary)}>
        {hero.summary}
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
