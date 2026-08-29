import {
  infrastructureCatalog,
  type InfrastructurePlan,
} from "@/lib/products";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./PricingCards.module.css";

export function PricingCards({
  condensed = false,
  plans = infrastructureCatalog.plans,
  featuredLabel = "Common starting point",
}: {
  condensed?: boolean;
  plans?: readonly InfrastructurePlan[];
  featuredLabel?: string;
}) {
  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-3">
      {plans.map((plan, index) => {
        const featured = Boolean(plan.featured);
        const custom = plan.slug === "custom-infrastructure";
        const visibleFeatures = plan.features.slice(0, condensed ? 3 : 4);

        return (
          <Reveal
            key={plan.slug}
            delay={index * 0.07}
            className={`${styles.reveal} ${custom ? styles.customReveal : ""}`}
          >
            <span className={styles.outerStroke} aria-hidden="true" />
            <div className={`${styles.cardColumn} ${featured ? styles.featuredColumn : ""}`}>
              {featured ? (
                <div className={styles.featuredCap}>
                  {featuredLabel}
                </div>
              ) : null}

              <article
                className={`${styles.card} ${featured ? styles.featured : ""}`}
                data-plan={plan.slug}
                aria-labelledby={`infrastructure-plan-${plan.slug}`}
              >
                <div className={styles.surface}>
                  <header className={styles.header}>
                    <h3
                      id={`infrastructure-plan-${plan.slug}`}
                      className={styles.planName}
                    >
                      {plan.name}
                    </h3>
                    {custom ? (
                      <span className={styles.customCrest} aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                    ) : null}
                    {plan.price.kind === "starting_at" ? (
                      <div className={styles.priceBlock}>
                        <span className={styles.priceLabel}>Starting at</span>
                        <div className={styles.priceLine}>
                          <strong>{plan.price.display}</strong>
                          <span>{plan.price.cadence}</span>
                        </div>
                      </div>
                    ) : (
                      <p className={styles.enterpriseIntro}>
                        A consultation-led build for organizations whose systems,
                        integrations, and governance need to be scoped together.
                      </p>
                    )}
                    <p className={styles.audience}>{plan.audience}</p>
                  </header>

                  <div className={styles.divider} aria-hidden="true" />

                  <ul className={styles.featureList}>
                    {visibleFeatures.map((feature) => (
                      <li key={feature}>
                        <span className={styles.check} aria-hidden="true">
                          <svg viewBox="0 0 12 12">
                            <path d="m3 6.2 1.8 1.9L9.2 3.7" />
                          </svg>
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    href={`/contact?plan=${plan.slug}`}
                    variant="secondary"
                    className={styles.cta}
                  >
                    {plan.ctaLabel}
                  </Button>
                </div>
              </article>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
