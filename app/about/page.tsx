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
  "Why Genesis AI takes an operator-first, managed approach to infrastructure, automation, and ongoing improvement.",
);

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="About Genesis AI"
        title="The best system is the one that keeps working after launch."
        description="Genesis helps real-estate operators turn scattered tools and manual work into a professional, practical, and fully managed operating environment."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <SectionHeading
              eyebrow="Why Genesis exists"
              title="Useful technology needs operational ownership."
            />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-[1.15rem] leading-relaxed">
              Real-estate operators do not need more disconnected software. They
              need a foundation, workflows, and support that work together.
            </p>
            <p className="mt-6 text-muted-dark">
              Genesis starts with the work, builds around practical priorities,
              introduces change clearly, and stays involved as the system
              evolves.
            </p>
            <blockquote className="my-9 border-l-2 border-gold pl-6 text-[clamp(1.4rem,2.4vw,2rem)] leading-tight tracking-[-0.03em]">
              Become trusted before needed.
            </blockquote>
            <p className="text-muted-dark">
              That principle shapes both the consultation and the system itself:
              prepare carefully, communicate plainly, and remain accountable
              when the operation depends on it.
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
              Reginald Benjamin leads Genesis AI&rsquo;s operator-first approach
              to practical implementation and ongoing system management.
            </p>
            <p className="mt-6 text-muted-light">
              Further experience, credentials, and biographical details will be
              added only when supporting source material is available.
            </p>
          </Reveal>
        </div>
      </Section>

      <ConsultationCTA />
    </>
  );
}
