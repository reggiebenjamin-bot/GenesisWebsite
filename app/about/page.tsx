import type { Metadata } from "next";
import Image from "next/image";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";
import { Reveal } from "@/components/ui/Reveal";
import {
  PageIntro,
  Section,
  SectionHeading,
} from "@/components/ui/Section";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "About",
  "Why Genesis separates standardized G-Core Mini software from consultation-led custom Infrastructure work.",
);

const teamMembers = [
  {
    name: "Reggie",
    role: "Founder",
    image: "/images/team/reggie.png",
    position: "center center",
  },
  {
    name: "Graham",
    role: "Head of Operations",
    image: "/images/team/graham.webp",
    position: "center 32%",
  },
  {
    name: "Aiden",
    role: "Director of Technology",
    image: "/images/team/aiden.webp",
    position: "center 32%",
  },
] as const;

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

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Leadership"
            title="Meet the team."
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member, index) => (
            <Reveal key={member.name} delay={index * 0.07}>
              <article className="h-full overflow-hidden rounded-lg border border-line-light bg-paper shadow-[0_18px_50px_rgb(8_9_14_/_0.07)]">
                <div className="relative aspect-square overflow-hidden bg-ink">
                  <Image
                    src={member.image}
                    alt={`${member.name}, ${member.role} at Genesis AI`}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                    unoptimized
                    className="object-cover"
                    style={{ objectPosition: member.position }}
                  />
                </div>
                <div className="p-7 sm:p-8">
                  <p className="font-display text-[0.68rem] font-semibold tracking-[0.15em] text-gold-dark uppercase">
                    Genesis AI
                  </p>
                  <h2 className="mt-4 text-[clamp(2rem,3vw,2.8rem)]">{member.name}</h2>
                  <p className="mt-3 text-muted-dark">{member.role}</p>
                </div>
              </article>
            </Reveal>
          ))}
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
