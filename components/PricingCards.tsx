import Link from "next/link";
import { pricingPlans } from "@/lib/content";
import { Reveal } from "./Reveal";

export function PricingCards({ condensed = false }: { condensed?: boolean }) {
  return (
    <div className={`pricing-grid ${condensed ? "pricing-grid--condensed" : ""}`}>
      {pricingPlans.map((plan, index) => (
        <Reveal
          key={plan.slug}
          className={`pricing-card ${plan.featured ? "pricing-card--featured" : ""}`}
          delay={index * 0.07}
        >
          {plan.featured ? <p className="pricing-card__flag">Most popular</p> : null}
          <p className="pricing-card__name">{plan.name}</p>
          <div className="pricing-card__price-row">
            <span>Starting at</span>
            <strong>{plan.monthlyPrice}</strong>
            <span>/month</span>
          </div>
          <p className="pricing-card__summary">{plan.audience}</p>
          {!condensed ? (
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          ) : null}
          <Link
            className={`button ${plan.featured ? "button--gold" : "button--outline"}`}
            href={`/contact?plan=${plan.slug}`}
          >
            Discuss {plan.name}
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
