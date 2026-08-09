import { pricingPlans } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function PricingCards({ condensed = false }: { condensed?: boolean }) {
  return (
    <div className="grid items-stretch border border-line-light lg:grid-cols-3">
      {pricingPlans.map((plan, index) => {
        const featured = Boolean(plan.featured);

        return (
          <Reveal
            key={plan.slug}
            delay={index * 0.07}
            className={`relative flex flex-col p-[clamp(34px,4vw,52px)] max-lg:border-t max-lg:border-line-light max-lg:first:border-t-0 lg:border-l lg:border-line-light lg:first:border-l-0 ${
              condensed ? "lg:min-h-[480px]" : "lg:min-h-[650px]"
            } ${featured ? "bg-navy text-ivory" : "bg-paper"}`}
          >
            {featured ? (
              <p className="absolute top-5 right-5 font-display text-[0.57rem] tracking-[0.12em] text-gold-light uppercase">
                Most popular
              </p>
            ) : null}

            <p
              className={`mb-14 font-display text-[0.76rem] tracking-[0.14em] uppercase ${
                featured ? "text-gold-light" : "text-gold-dark"
              }`}
            >
              {plan.name}
            </p>

            <div className="mb-7 grid grid-cols-[auto_1fr] items-baseline">
              <span
                className={`col-span-full mb-1.5 text-[0.77rem] tracking-[0.1em] uppercase ${
                  featured ? "text-muted-light" : "text-muted-dark"
                }`}
              >
                Starting at
              </span>
              <strong className="text-[clamp(2.5rem,4vw,4.2rem)] leading-none font-normal tracking-[-0.055em]">
                {plan.monthlyPrice}
              </strong>
              <span
                className={`text-[0.83rem] ${featured ? "text-muted-light" : "text-muted-dark"}`}
              >
                /month
              </span>
            </div>

            <p
              className={`mb-8 ${featured ? "text-muted-light" : "text-muted-dark"}`}
            >
              {plan.audience}
            </p>

            {!condensed ? (
              <ul
                className={`mb-9 border-t pt-6 ${featured ? "border-line-dark" : "border-line-light"}`}
              >
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`relative py-1.5 pl-[18px] text-[0.9rem] before:absolute before:top-[15px] before:left-0 before:size-1.5 before:bg-gold before:content-[''] ${
                      featured ? "text-muted-light" : "text-muted-dark"
                    }`}
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            ) : null}

            <Button
              href={`/contact?plan=${plan.slug}`}
              variant={featured ? "gold" : "outline"}
              className="mt-auto w-full"
            >
              Discuss {plan.name}
            </Button>
          </Reveal>
        );
      })}
    </div>
  );
}
