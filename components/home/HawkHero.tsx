import Link from "next/link";
import type { ReactNode } from "react";
import { preconnect } from "react-dom";
import { PathToggle } from "@/components/offers/PathToggle";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { contact } from "@/lib/content";
import { genesisPositioning, type OfferPathId, pathHeroes, TOOLS_INTEREST_SUBJECT } from "@/lib/offers";
import { cn } from "@/lib/utils";
import { HawkAscii } from "./HawkAscii";
import { HAWK_IMAGE_ORIGIN, HAWK_IMAGE_SRC } from "./hawkAsset";
import styles from "./HawkHero.module.css";
import { hawkFrameStyle } from "./hawkSettings";

const secondaryAction =
  "secondary-action inline-flex min-h-[53px] items-center justify-center px-6 max-sm:w-full";

/**
 * The opening: one title per path, over the same hawk. Both are
 * server-rendered and CSS shows the chosen path's, so the right title is
 * there from first paint and switching never reloads the hawk.
 *
 * The hawk fills the frame behind the centred copy, with a scrim under the
 * copy so the text stays readable. Each path has its own eyebrow, title and
 * line: Custom Infrastructure leads with the belief and the consultation;
 * Agent's lead to the tools page and the tools enquiry, as that page's do.
 *
 * The hero is the page's [data-offer-region]: choosing a path once it has
 * scrolled away brings the reader back up to the new title.
 */
export function HawkHero() {
  preconnect(HAWK_IMAGE_ORIGIN, { crossOrigin: "anonymous" });

  const toolsInterestHref = `mailto:${contact.email}?subject=${encodeURIComponent(
    TOOLS_INTEREST_SUBJECT,
  )}`;

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

        {/* A phone's bar has no room for the toggle, so it opens the hero there. */}
        <PathToggle variant="hero" className={styles.toggle} />

        <HeroCopy path="agent">
          <ConsultationButton href="/tools" className="max-sm:w-full">
            Explore Genesis Tools
          </ConsultationButton>
          <a href={toolsInterestHref} className={secondaryAction}>
            <span>Ask About Tools</span>
          </a>
        </HeroCopy>

        <HeroCopy path="custom-infrastructure">
          <ConsultationButton href="/contact" className="max-sm:w-full" />
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
    <div data-offer-panel={path} className={styles.copy}>
      <p className="font-display text-[0.69rem] leading-[1.4] font-semibold tracking-[0.18em] text-gold uppercase">
        {hero.eyebrow}
      </p>
      <h2 className="mt-5 text-[clamp(2.75rem,6.1vw,5.6rem)] leading-[0.98] tracking-[-0.05em] text-balance">
        {hero.title} <span className="text-gold-light">{hero.accent}</span>
      </h2>

      <p className="mx-auto mt-6 max-w-[44ch] text-[clamp(1rem,1.3vw,1.18rem)] leading-relaxed text-balance text-ivory/74">
        {hero.summary}
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">{children}</div>
    </div>
  );
}
