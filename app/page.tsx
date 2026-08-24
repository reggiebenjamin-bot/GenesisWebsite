import { CinematicHero } from "@/components/hero/CinematicHero";
import { CapabilityStrip } from "@/components/sections/CapabilityStrip";
import { AppliedIntelligence } from "@/components/sections/AppliedIntelligence";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";
import { SystemLayers } from "@/components/sections/SystemLayers";
import { TextLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow, Section, SectionHeading } from "@/components/ui/Section";
import { audiences, faqs, processSteps } from "@/lib/content";

export default function Home() {
  return (
    <>
      <CinematicHero />
      <CapabilityStrip />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <Eyebrow>The real operating constraint</Eyebrow>
            <h2 className="mt-5 text-[clamp(2.4rem,5vw,5rem)]">
              More leads cannot fix an operation that still depends on you.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-[1.15rem] leading-relaxed">
              Every file, follow-up, and handoff only moves when someone
              personally pushes it across a CRM, spreadsheet, text thread, or
              inbox.
            </p>
            <p className="mt-6 text-muted-dark">
              Genesis turns that scattered work into a connected Applied AI
              system—powered by reusable platform technology and kept useful,
              current, and running as a managed service.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section tone="dark">
        <Reveal>
          <SectionHeading
            eyebrow="One connected system"
            title="A product underneath it. A managed service around it. One Genesis System."
            description="Genesis is the managed Applied AI deal operations system for real estate, lending, and property-driven teams—powered by a reusable platform and continuously operated as one accountable environment."
          />
        </Reveal>
        <SystemLayers compact />
        <TextLink href="/solutions" light className="mt-12">
          Explore the complete system
        </TextLink>
      </Section>

      <AppliedIntelligence />

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="From founder-dependent work to a managed operating advantage."
            description="The work begins with the operation—not a prepackaged stack of tools."
          />
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-5">
          {processSteps.map((step, index) => (
            <Reveal
              key={step.number}
              delay={index * 0.06}
              className="relative border-t border-line-light py-8 pr-8 max-md:border-b max-md:last:border-b-0 lg:min-h-[300px]"
            >
              <span className="mb-9 block font-display text-[0.68rem] text-gold-dark lg:mb-16">
                {step.number}
              </span>
              <h3 className="mb-4">{step.title}</h3>
              <p className="text-[0.94rem] text-muted-dark">
                {step.description}
              </p>
            </Reveal>
          ))}
        </div>
        <TextLink href="/how-it-works" className="mt-12">
          See the implementation process
        </TextLink>
      </Section>

      <Section className="bg-paper">
        <Reveal>
          <SectionHeading
            eyebrow="Built around the operator"
            title="Built for owner-led, property-driven operations."
          />
        </Reveal>
        <div className="grid md:grid-cols-2">
          {audiences.map((audience, index) => (
            <Reveal
              key={audience.title}
              delay={index * 0.05}
              className="border-line-light p-[clamp(32px,4vw,56px)] transition-colors duration-200 hover:bg-ivory max-md:border-b max-md:last:border-b-0 md:border-r md:border-b md:nth-[2n]:border-r-0 md:nth-last-[-n+2]:border-b-0 lg:min-h-[310px]"
            >
              <p className="mb-9 font-display text-[0.68rem] tracking-[0.12em] text-gold-dark uppercase lg:mb-[70px]">
                {audience.title}
              </p>
              <h3 className="mb-4 max-w-[430px] text-[clamp(1.8rem,3vw,2.75rem)]">
                {audience.outcome}
              </h3>
              <p className="max-w-[520px] text-muted-dark">
                {audience.description}
              </p>
            </Reveal>
          ))}
        </div>
        <TextLink href="/solutions" className="mt-12">
          Find your operating path
        </TextLink>
      </Section>

      <Section tone="dark">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <Eyebrow>Accountability by design</Eyebrow>
            <h2 className="mt-5 text-[clamp(2.4rem,5vw,5rem)]">
              Live in the operation—not waiting in a demo.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-muted-light">
              Genesis is live in production for two independent operations
              today, with a third large-scale engagement underway. Client-level
              outcomes are published only when the evidence, context, and
              permission are verified.
            </p>
            <TextLink href="/results" light className="mt-8">
              See the proof standard
            </TextLink>
          </Reveal>
        </div>
      </Section>

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Transparent starting ranges"
            title="Know the commercial path before the first call."
            description="Every engagement begins with a consultation. Pricing reflects the operational complexity, implementation depth, and ongoing management involved."
          />
        </Reveal>
        <TextLink href="/pricing">
          See implementation and managed-platform pricing
        </TextLink>
      </Section>

      <Section className="bg-paper">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <SectionHeading
              eyebrow="FAQ"
              title="Questions serious operators ask first."
            />
          </Reveal>
          <div>
            {faqs.map((faq, index) => (
              <Reveal key={faq.question} delay={index * 0.035}>
                <details className="group border-t border-line-light last:border-b">
                  <summary className="flex cursor-pointer list-none justify-between gap-6 py-7 text-[clamp(1.05rem,1.5vw,1.25rem)] font-medium [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span
                      aria-hidden="true"
                      className="text-[1.4rem] font-light text-gold-dark transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-[680px] pr-13 pb-7 text-muted-dark">
                    {faq.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <ConsultationCTA />
    </>
  );
}
