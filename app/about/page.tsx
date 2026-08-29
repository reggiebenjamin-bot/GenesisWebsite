import type { Metadata } from "next";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";
import { Reveal } from "@/components/ui/Reveal";
import {
  Eyebrow,
  PageIntro,
  Section,
  SectionHeading,
} from "@/components/ui/Section";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "About",
  "Why Genesis separates standardized G-Core Mini software from consultation-led custom Infrastructure work.",
);

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="About Genesis AI"
        title="Build the right operating layer for the work."
        description="Genesis is preparing standardized software for independent agents and small teams, and separately designs and manages custom Infrastructure for organizations with more complex operating requirements."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <SectionHeading
              eyebrow="Why Genesis exists"
              title="A software subscription and a custom implementation solve different problems."
            />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-[1.15rem] leading-relaxed">
              G-Core Mini is being prepared as bounded software access: a
              repeatable product for knowing what needs attention, taking the
              next revenue-moving action, and recording what happened.
            </p>
            <p className="mt-6 text-muted-dark">
              Genesis Infrastructure starts with the existing operation. Genesis
              assesses the environment, scopes the work, implements the agreed
              systems and integrations, and remains responsible for the ongoing
              management included in the engagement.
            </p>
            <blockquote className="my-9 border-l-2 border-gold pl-6 text-[clamp(1.4rem,2.4vw,2rem)] leading-tight tracking-[-0.03em]">
              Become trusted before needed.
            </blockquote>
            <p className="text-muted-dark">
              That principle shapes how Genesis scopes work, communicates what is
              included, and stays accountable when an operation depends on the
              system.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section tone="dark">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <Eyebrow>Founder</Eyebrow>
            <h2 className="mt-5 text-[clamp(2.4rem,5vw,5rem)]">
              Reginald Benjamin
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-muted-light">
              Reginald Benjamin is the founder of Genesis AI. The company&rsquo;s
              operating approach is direct: understand the work, define the
              boundary, implement what was agreed, and remain involved after
              launch when the engagement includes ongoing management.
            </p>
            <p className="mt-6 text-muted-light">
              Additional biographical details, credentials, and client evidence
              will be published only when the supporting source and permission
              are available.
            </p>
          </Reveal>
        </div>
      </Section>

      <ConsultationCTA
        eyebrow="Genesis Infrastructure"
        title="Start with the systems and work already in place."
        description="The consultation reviews the current environment, the responsibilities creating friction, and whether a custom Infrastructure engagement is the right next step."
        buttonLabel="Book an Infrastructure consultation"
      />
    </>
  );
}
