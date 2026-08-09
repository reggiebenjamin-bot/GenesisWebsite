import { pricingPlans } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./PricingCards.module.css";

export function PricingCards({ condensed = false }: { condensed?: boolean }) {
  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-3">
      {pricingPlans.map((plan, index) => {
        const featured = Boolean(plan.featured);
        const enterprise = plan.slug === "enterprise";
        const visibleFeatures = condensed
          ? plan.features.slice(0, 4)
          : plan.features;

        return (
          <Reveal
            key={plan.slug}
            delay={index * 0.07}
            className={`${styles.reveal} ${enterprise ? styles.enterpriseReveal : ""}`}
          >
            <span className={styles.outerStroke} aria-hidden="true" />

            <article
              className={`${styles.card} ${
                condensed ? styles.condensed : styles.full
              } ${featured ? styles.featured : ""}`}
              data-plan={plan.slug}
            >
              <div className={styles.surface}>
                {featured ? (
                  <div className={styles.ribbon} aria-label="Most popular plan">
                    <span>Most popular</span>
                  </div>
                ) : null}

                {enterprise ? (
                  <span className={styles.enterpriseCrest} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : null}

                <header
                  className={`${styles.header} ${featured ? styles.featuredHeader : ""}`}
                >
                  <p className={styles.planName}>{plan.name}</p>
                  <div className={styles.priceBlock}>
                    <span className={styles.priceLabel}>Starting at</span>
                    <div className={styles.priceLine}>
                      <strong>{plan.monthlyPrice}</strong>
                      <span>/month</span>
                    </div>
                  </div>
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
                  variant={featured || enterprise ? "gold" : "ghost"}
                  className={styles.cta}
                >
                  Discuss {plan.name}
                  <span aria-hidden="true">↗</span>
                </Button>
              </div>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}
