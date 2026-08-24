import type { Metadata } from "next";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";
import { PricingCards } from "@/components/sections/PricingCards";
import { TextLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow, PageIntro, Section, SectionHeading } from "@/components/ui/Section";
import { faqs, implementationPlans, managedPlatformPlans } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "Pricing",
  "Real starting ranges for Genesis Discovery, optional Pilots, implementation, and ongoing managed platform service.",
);

export default function PricingPage() {
  return (
    <>
      <PageIntro
        eyebrow="The Genesis System"
        title="Starting pricing."
        description="Choose a starting point. Define the right scope together. Pricing reflects the level of operational complexity and ongoing support involved. Every engagement begins with a consultation before work is proposed."
      />

      <Section className="bg-paper">
        <Reveal className="grid gap-8 border-y border-line-light py-9 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <div>
            <Eyebrow>Start here · Free</Eyebrow>
            <h2 className="mt-4 text-[clamp(2rem,4vw,3.5rem)]">Intro consultation</h2>
          </div>
          <p className="max-w-2xl text-[1.05rem] text-muted-dark">
            A no-cost conversation about your operation and where it fits below.
            Nothing is scoped or proposed before this call.
          </p>
        </Reveal>
      </Section>

      <Section tone="dark">
        <Reveal>
          <SectionHeading eyebrow="Understand before building" title="Discovery, with an optional Pilot when proof should come first." />
        </Reveal>
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal className="border border-gold/35 bg-navy p-[clamp(32px,4vw,56px)]">
            <Eyebrow>Discovery</Eyebrow>
            <p className="mt-9 text-[clamp(2.5rem,5vw,4.5rem)] tracking-[-0.05em]">$1,500–$6,000</p>
            <p className="mt-2 text-[0.82rem] text-muted-light">Up to $12,000 for multi-entity or complex operations</p>
            <p className="mt-7 max-w-2xl text-muted-light">
              A deliverable-bearing operational assessment—not a sales call.
              Genesis maps the current tools, data flow, and workflow gaps, then
              returns a written scope and roadmap you keep either way.
            </p>
            <p className="mt-7 border-l-2 border-gold pl-5 text-ivory">100% credited toward Implementation when you proceed within 60 days.</p>
          </Reveal>
          <Reveal delay={0.06} className="border border-line-dark bg-ink p-[clamp(32px,4vw,56px)]">
            <Eyebrow>Optional Pilot</Eyebrow>
            <p className="mt-9 text-[clamp(2.2rem,4vw,3.7rem)] tracking-[-0.05em]">$4,500–$15,000</p>
            <p className="mt-7 text-muted-light">
              A scoped proof of concept on one workflow inside your operation,
              built and run on real data. Most Growth engagements can proceed
              directly to Implementation.
            </p>
            <p className="mt-7 border-l-2 border-gold/60 pl-5 text-ivory/82">50% credited toward Implementation when you proceed within 90 days.</p>
          </Reveal>
        </div>
      </Section>

      <Section>
        <Reveal>
          <SectionHeading eyebrow="One-time build" title="Implementation" description="Every tier can include foundation provisioning, business email, identity and document management, Applied AI workflows, integrations, and Genesis CRM when needed. Scope and depth scale with the operation." />
        </Reveal>
        <PricingCards plans={implementationPlans} />
      </Section>

      <Section tone="navy">
        <Reveal>
          <SectionHeading eyebrow="Ongoing responsibility" title="Managed Platform" description="The reusable Genesis platform is delivered as an ongoing managed service: monitored, supported, maintained, and improved after launch." />
        </Reveal>
        <PricingCards plans={managedPlatformPlans} />
      </Section>

      <Section className="bg-paper">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <Eyebrow>Enterprise / Managed Partnership</Eyebrow>
            <h2 className="mt-5 text-[clamp(2.4rem,5vw,5rem)]">Complex operations are scoped around the partnership.</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-[1.05rem] text-muted-dark">
              For multi-brand, multi-location, or high-transaction-volume operations,
              pricing is scoped individually. This is built around what the larger
              managed system actually requires—not a fixed package.
            </p>
            <div className="mt-9 border-t border-line-light pt-7">
              <h3>Why ranges, not hidden quotes?</h3>
              <p className="mt-3 text-muted-dark">
                These are real ranges, not placeholders. The consultation finds the
                right number inside the published band; it is not where a withheld
                price is finally revealed.
              </p>
            </div>
            <TextLink href="/how-it-works" className="mt-8">See how the stages work</TextLink>
          </Reveal>
        </div>
      </Section>

      <Section>
        <Reveal><SectionHeading eyebrow="FAQ" title="Commercial questions, answered directly." /></Reveal>
        <div className="mx-auto max-w-4xl">
          {faqs.map((faq, index) => (
            <Reveal key={faq.question} delay={index * 0.035}>
              <details className="group border-t border-line-light last:border-b">
                <summary className="flex cursor-pointer list-none justify-between gap-6 py-7 text-[clamp(1.05rem,1.5vw,1.25rem)] font-medium [&::-webkit-details-marker]:hidden">
                  {faq.question}<span aria-hidden="true" className="text-[1.4rem] font-light text-gold-dark transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pr-12 pb-7 text-muted-dark">{faq.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </Section>

      <ConsultationCTA
        eyebrow="Find your number inside the range"
        title="Choose the right starting point for your operation."
        description="You have seen what Discovery, Implementation, and ongoing management cost. The consultation determines the right tier and scope."
      />
    </>
  );
}
