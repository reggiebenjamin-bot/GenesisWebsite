import { Button } from "@/components/ui/Button";
import { contact } from "@/lib/content";
import {
  miniPaidPlans,
  type MiniCatalogDisplayMode,
  type MiniPlan,
} from "@/lib/products";
import styles from "./MiniPricingCards.module.css";

function miniInterestHref(plan?: MiniPlan) {
  const subject = plan
    ? `G-Core Mini ${plan.name} plan review`
    : "G-Core Mini beta interest";
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function MiniPricingCards({ mode }: { mode: MiniCatalogDisplayMode }) {
  if (mode === "hold") {
    return (
      <div className={styles.holdPanel}>
        <div>
          <p className={styles.stateLabel}>Commercial review in progress</p>
          <h3>Mini plans are not published yet.</h3>
          <p>
            Paid plans remain under product, commercial, and legal review.
            Account access and billing are not connected to this website yet.
          </p>
        </div>
        <Button href={miniInterestHref()} variant="secondary">
          Ask about the Mini beta
        </Button>
      </div>
    );
  }

  const review = mode === "review";
  const showLimits = review || mode === "public";

  return (
    <div>
      {review ? (
        <div className={styles.reviewNotice} role="note">
          <span>Draft commercial preview</span>
          <p>Proposed pricing for review. Signup and checkout are not live.</p>
        </div>
      ) : null}

      <div className={styles.grid}>
        {miniPaidPlans.map((plan) => (
          <article
            key={plan.key}
            className={styles.card}
            data-featured={plan.featured || undefined}
            aria-labelledby={`mini-plan-${plan.slug}`}
          >
            <div className={styles.cardTopline} aria-hidden="true" />
            <header>
              <div className={styles.planHeading}>
                <h3 id={`mini-plan-${plan.slug}`}>{plan.name}</h3>
                {review ? <span>Provisional</span> : null}
              </div>
              <p className={styles.priceLabel}>
                {review && plan.priceCentsMonthly !== null
                  ? "Proposed"
                  : mode === "public" && plan.priceCentsMonthly !== null
                    ? "Monthly subscription"
                    : "Access model"}
              </p>
              <p className={styles.price}>{plan.priceDisplay}</p>
              <p className={styles.audience}>{plan.audience}</p>
            </header>

            <div className={styles.rule} aria-hidden="true" />

            <ul className={styles.features}>
              {plan.features.slice(0, 3).map((feature) => (
                <li key={feature}>
                  <span aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              href={miniInterestHref(plan)}
              variant="secondary"
              className={styles.cta}
              aria-label={`Ask about ${review ? "the proposed " : ""}G-Core Mini ${plan.name} plan`}
            >
              {review ? "Ask about the beta" : "Ask about availability"}
            </Button>
          </article>
        ))}
      </div>

      {showLimits ? (
        <details className={styles.comparison}>
          <summary>
            {review ? "Compare proposed plan limits" : "Compare plan limits"}
          </summary>
          <div className={styles.comparisonGrid}>
            {miniPaidPlans.map((plan) => (
              <section key={plan.key} aria-labelledby={`mini-limits-${plan.slug}`}>
                <h4 id={`mini-limits-${plan.slug}`}>{plan.name}</h4>
                <dl>
                  <div><dt>Users</dt><dd>{plan.limits.seats}</dd></div>
                  <div><dt>Active records</dt><dd>{formatNumber(plan.limits.active_records)}</dd></div>
                  <div><dt>Pipelines</dt><dd>{plan.limits.pipelines}</dd></div>
                  <div><dt>Genesis units / month</dt><dd>{formatNumber(plan.limits.genesis_standard_units_monthly)}</dd></div>
                  <div><dt>Reports</dt><dd>{plan.limits.reports}</dd></div>
                  <div><dt>Integrations</dt><dd>{plan.limits.integrations}</dd></div>
                </dl>
              </section>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
