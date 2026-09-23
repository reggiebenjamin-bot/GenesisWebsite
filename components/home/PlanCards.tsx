import Link from "next/link";
import { SectionIntro } from "@/components/ui/Blocks";
import { TextLink } from "@/components/ui/Button";
import { managedOverview, managedPlans } from "@/lib/offers";
import styles from "./PlanCards.module.css";

/* Same card, three strengths of the same finish: the higher the level, the
   more gold and depth it carries. Sizes stay equal — the ladder is in the
   material. Level 01 is the card's own styling, so it needs no class. */
const TIERS = ["", styles.tierTwo, styles.tierThree];

/**
 * The three Genesis Managed AI plans as three equal cards in the site's
 * earlier pricing look — dark surface, faint grid, a gold edge travelling
 * round — carrying the level, the price, what Genesis does there, two points,
 * and the one action that applies: every level enters the infrastructure
 * assessment rather than a checkout.
 */
export function PlanCards() {
  return (
    <div>
      <SectionIntro
        layout="split"
        eyebrow={managedOverview.plans.eyebrow}
        title={managedOverview.plans.headline}
        titleId="plans-title"
        aside={
          <p className="max-w-[46ch] text-[0.95rem] leading-relaxed text-muted-dark">
            {managedOverview.plans.body}
          </p>
        }
      />

      <ol className={styles.plans}>
        {managedPlans.map((plan, index) => (
          <li key={plan.id} className={`${styles.plan} ${TIERS[index] ?? ""}`}>
            <span aria-hidden="true" className={styles.orbit} />

            <article className={styles.card}>
              <span aria-hidden="true" className={styles.ghostNumber}>
                {plan.step}
              </span>

              <p className={styles.level}>Level {plan.step}</p>

              <p className={styles.price}>
                <span className={styles.currency}>{plan.priceDisplay.slice(0, 1)}</span>
                {plan.priceDisplay.slice(1)}
                <span className={styles.cadence}>per month</span>
              </p>

              <span aria-hidden="true" className={styles.divider} />

              <p className={styles.ladder}>{plan.ladder}</p>
              <p className={styles.summary}>{plan.summary}</p>

              <ul className={styles.points}>
                {plan.points.map((point) => (
                  <li key={point}>
                    <span aria-hidden="true" className={styles.check}>
                      <svg viewBox="0 0 12 12">
                        <path d="m3 6.2 1.8 1.9L9.2 3.7" />
                      </svg>
                    </span>
                    {point}
                  </li>
                ))}
              </ul>

              <Link
                href="/assessment"
                aria-label={`Assess my business for the ${plan.priceDisplay} level`}
                className={styles.cta}
              >
                Assess My Business
                <span aria-hidden="true">↗</span>
              </Link>
            </article>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-10 gap-y-3">
        <p className="max-w-[58ch] text-[0.8rem] text-muted-dark">
          {managedOverview.thirdPartyShort}
        </p>
        <TextLink href="/pricing#custom-infrastructure">See Pricing Details</TextLink>
      </div>
    </div>
  );
}
