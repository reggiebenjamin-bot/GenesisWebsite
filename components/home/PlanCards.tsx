import { UserLimitNote } from "@/components/offers/UserLimitNote";
import { SectionIntro } from "@/components/ui/Blocks";
import { TextLink } from "@/components/ui/Button";
import { SetupFeeNote } from "@/components/offers/SetupFeeNote";
import { chooserProducts } from "@/lib/productChooser";
import { managedOverview, managedPlans } from "@/lib/offers";
import { SETUP_WAIVER_LINE, setupWaiverActive } from "@/lib/setupWaiver";
import styles from "./PlanCards.module.css";

/* Same card, three strengths of the same finish: the higher the level, the
   more gold and depth it carries. Sizes stay equal — the ladder is in the
   material. Level 01 is the card's own styling, so it needs no class. */
const TIERS = ["", styles.tierTwo, styles.tierThree];

/**
 * The three Genesis Managed AI plans as three equal cards in the site's
 * earlier pricing look — dark surface, faint grid, a gold edge travelling
 * round — carrying the level, the price, what Genesis does there, two points,
 * and checkout for Business, Real Estate, and Lending on the existing
 * /start routes.
 */
export function PlanCards() {
  const waived = setupWaiverActive();
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
                <SetupFeeNote
                  setupLine={plan.setupLine}
                  initialActive={waived}
                  className={styles.setup}
                  noteClassName={styles.waiver}
                />
              </p>

              <span aria-hidden="true" className={styles.divider} />

              <p className={styles.ladder}>{plan.ladder}</p>
              <p className={styles.users}>{plan.userLimit}</p>
              <UserLimitNote plan={plan} className="text-ivory/70" />
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

              <p className={styles.checkoutLabel}>Checkout</p>
              <nav className={styles.choices} aria-label={`Level ${plan.step} checkout`}>
                {chooserProducts().map((product) => {
                  const level = product.levels.find((item) => item.id === plan.id);
                  if (!level) return null;
                  // Plain <a>, not <Link>: /start/* opens a live Stripe
                  // Checkout Session, so it must never be prefetched.
                  return (
                    <a
                      key={product.key}
                      href={level.href}
                      rel="nofollow"
                      aria-label={
                        waived
                          ? `${product.label} Level ${plan.step} checkout, ${plan.priceDisplay} a month, ${SETUP_WAIVER_LINE}`
                          : `${product.label} Level ${plan.step} checkout, ${plan.priceDisplay} a month, ${plan.setupLine}`
                      }
                      className={styles.cta}
                    >
                      {product.label}
                    </a>
                  );
                })}
              </nav>
            </article>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-10 gap-y-3">
        <p className="max-w-[58ch] text-[0.875rem] text-muted-dark">
          {managedOverview.thirdPartyShort}
        </p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <TextLink href="/business">Business</TextLink>
          <TextLink href="/real-estate">Real Estate</TextLink>
          <TextLink href="/lending">Lending</TextLink>
          <TextLink href="/pricing#custom-infrastructure">See Pricing Details</TextLink>
        </div>
      </div>
    </div>
  );
}
