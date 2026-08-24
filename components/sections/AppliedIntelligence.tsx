import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow, Section } from "@/components/ui/Section";

const stages = [
  {
    number: "01",
    label: "Operational signals",
    title: "Bring the scattered context together.",
    body: "Email, calendars, documents, CRM activity, and team inputs become a governed source of operational context.",
    items: ["Conversations", "Documents", "Deal activity"],
  },
  {
    number: "02",
    label: "Data synthesis",
    title: "Turn information into usable context.",
    body: "Genesis structures the signals, connects related records, and surfaces what changed, what matters, and what needs attention.",
    items: ["Normalize", "Connect", "Prioritize"],
  },
  {
    number: "03",
    label: "Applied AI",
    title: "Put the context to work.",
    body: "AI helps draft follow-up, route documents, prepare decision briefs, and keep pipelines current—with people in control.",
    items: ["Draft", "Route", "Recommend"],
  },
] as const;

export function AppliedIntelligence() {
  return (
    <Section tone="navy">
      <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
        <Reveal>
          <div className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
            <Eyebrow>Applied intelligence</Eyebrow>
            <h2 className="mt-5 text-[clamp(2.4rem,5vw,4.8rem)]">
              Better context before the next action.
            </h2>
            <p className="mt-6 max-w-xl text-[1.05rem] text-muted-light">
              Applied AI is the product core—not a novelty layer. Genesis
              synthesizes the information already moving through the business,
              applies intelligence inside reusable workflow mechanisms, and
              manages those workflows in the client&rsquo;s real operation.
            </p>
          </div>
        </Reveal>

        <div className="border-t border-line-dark">
          {stages.map((stage, index) => (
            <Reveal
              key={stage.number}
              delay={index * 0.05}
              className="border-b border-line-dark py-9 sm:py-11"
            >
              <div className="grid gap-6 sm:grid-cols-[4rem_1fr]">
                <span className="font-display text-[0.68rem] text-gold">
                  {stage.number}
                </span>
                <div>
                  <p className="font-display text-[0.65rem] font-semibold tracking-[0.15em] text-gold-light uppercase">
                    {stage.label}
                  </p>
                  <h3 className="mt-3 max-w-xl text-[clamp(1.5rem,2.7vw,2.3rem)] text-ivory">
                    {stage.title}
                  </h3>
                  <p className="mt-4 max-w-2xl text-muted-light">
                    {stage.body}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {stage.items.map((item) => (
                      <span
                        key={item}
                        className="border border-ivory/12 bg-ink/25 px-3 py-1.5 font-display text-[0.62rem] tracking-[0.08em] text-ivory/72 uppercase"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal className="mt-10 grid gap-4 border border-gold/20 bg-ink/25 p-6 text-[0.78rem] text-ivory/66 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
        {[
          "Permission-aware access",
          "Source-linked outputs",
          "Human approval points",
          "Ongoing workflow tuning",
        ].map((principle) => (
          <span key={principle} className="flex items-center gap-3">
            <i className="size-1.5 shrink-0 rounded-full bg-signal" />
            {principle}
          </span>
        ))}
      </Reveal>
    </Section>
  );
}
