const capabilities = [
  "The Genesis System",
  "Reusable Product Core",
  "Managed Service Delivery",
  "Built for Deal Operations",
  "Operational Foundation",
  "Applied AI",
  "Data Synthesis",
  "Genesis CRM",
  "Integrations",
];

/** The thin band directly beneath the hero, summarising the system. */
export function CapabilityStrip() {
  return (
    <section
      aria-label="Genesis system capabilities"
      className="relative z-20 border-y border-line-dark bg-navy text-ivory"
    >
      <div className="capability-marquee flex min-h-28 items-center overflow-hidden">
        <div className="capability-marquee-track flex w-max shrink-0 items-center">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
              className="capability-marquee-group flex shrink-0 items-center"
            >
              {capabilities.map((capability) => (
                <span
                  key={capability}
                  className="capability-marquee-item flex shrink-0 items-center whitespace-nowrap text-[clamp(0.88rem,1.1vw,1.02rem)] tracking-[0.025em] text-ivory/58"
                >
                  {capability}
                  <span
                    aria-hidden="true"
                    className="capability-marquee-divider mx-[clamp(22px,3vw,48px)] h-1 w-1 shrink-0 rounded-full bg-gold/70"
                  />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
