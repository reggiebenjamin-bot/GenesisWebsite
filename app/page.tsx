import { CinematicHero } from "@/components/hero/CinematicHero";
import { CapabilityStrip } from "@/components/sections/CapabilityStrip";
import { AppliedIntelligence } from "@/components/sections/AppliedIntelligence";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";
import { PricingCards } from "@/components/sections/PricingCards";
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
            <Eyebrow>The operational problem</Eyebrow>
            <h2 className="mt-5 text-[clamp(2.4rem,5vw,5rem)]">
              Deals move quickly. Disconnected systems do not.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-[1.15rem] leading-relaxed">
              Leads, follow-up, documents, calendars, and team communication
              often live in separate places—with people filling the gaps
              manually.
            </p>
            <p className="mt-6 text-muted-dark">
              Genesis brings the work into a managed operating system designed
              to make the business more responsive, consistent, and ready to
              scale.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section tone="dark">
        <Reveal>
          <SectionHeading
            eyebrow="One connected system"
            title="Four layers. One operation."
            description="Each layer supports the next, creating a professional environment that can be implemented, used, and improved over time."
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
            title="From operational friction to a system your team can rely on."
            description="The work begins with the operation—not a prepackaged stack of tools."
          />
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-4">
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
            title="The same system, shaped to different operating realities."
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
              The system is not handed off and forgotten.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-muted-light">
              Genesis stays responsible for monitoring, support, maintenance,
              and practical improvement. Published results will follow the same
              standard: specific, attributable, and verified.
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
            eyebrow="Starting pricing"
            title="A clear starting point. A scope built around your operation."
            description="Every engagement begins with a consultation so the recommendation matches the people, workflows, and complexity involved."
          />
        </Reveal>
        <PricingCards condensed />
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
