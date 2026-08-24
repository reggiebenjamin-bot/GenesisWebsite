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
  "Why Genesis combines reusable Applied AI technology with operator-led implementation and ongoing managed service.",
);

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="About Genesis AI"
        title="Built from inside the operating problem."
        description="Genesis helps real estate, lending, and property-driven teams turn scattered tools and founder-dependent work into a practical, fully managed Applied AI system."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <SectionHeading
              eyebrow="Why Genesis exists"
              title="Product discipline. Service accountability. One working system."
            />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-[1.15rem] leading-relaxed">
              Genesis is not a generic consultancy and it is not self-serve SaaS.
              Its reusable platform mechanisms are configured around the client,
              then delivered and improved through a managed service.
            </p>
            <p className="mt-6 text-muted-dark">
              That model makes the technology repeatable without pretending every
              operation is identical—and keeps responsibility with Genesis after
              the initial implementation.
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
              Reginald Benjamin is a licensed Texas real estate professional with
              an enterprise technology sales background. He remains active in
              real estate and lending operations while building Genesis.
            </p>
            <p className="mt-6 text-muted-light">
              Genesis grew from that operating vantage point: build reusable
              technology around real workflows, apply AI where context and
              repetition justify it, and stay accountable for the system in use.
            </p>
          </Reveal>
        </div>
      </Section>

      <ConsultationCTA
        eyebrow="Operator to operator"
        title="Talk about the work your current system leaves with you."
        description="Start with a practical conversation about the operation, the friction, and whether Genesis is the right fit."
      />
    </>
  );
}
