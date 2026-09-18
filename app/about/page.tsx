import type { Metadata } from "next";
import Image from "next/image";
import { Card, ClosingBand, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { Eyebrow, PageIntro } from "@/components/ui/Section";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "About",
  "Why Genesis separates self-service Genesis Tools from consultation-led Genesis Managed AI.",
);

/* Both portraits are square and already framed, so the card shows them whole. */
const teamMembers = [
  { name: "Reggie", role: "Founder", image: "/images/team/reggie.webp" },
  { name: "Graham", role: "Head of Operations", image: "/images/team/graham.webp" },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="About Genesis AI"
        title="Build the right operating layer for the work."
        description="Standardized software for independent agents and small teams, and custom infrastructure for operations with more complex requirements."
      />

      <Sheet surface="paper" aria-labelledby="why-title" className="site-section">
        <SectionIntro
          layout="split"
          eyebrow="Why Genesis exists"
          title="A subscription and a custom implementation solve different problems."
          titleId="why-title"
          aside={
            <p className="max-w-[30ch] text-[0.95rem] text-muted-dark">
              So Genesis offers both, separately.
            </p>
          }
        />

        <ul className="grid gap-4 md:grid-cols-2">
          <Card as="li">
            <Eyebrow className="text-gold-dark">Genesis Tools</Eyebrow>
            <h2 className="mt-5 text-[clamp(1.5rem,2.1vw,1.9rem)] leading-[1.06] tracking-[-0.03em]">
              Solve a specific problem yourself.
            </h2>
            <p className="mt-4 text-[0.98rem] leading-relaxed text-muted-dark">
              Focused, self-service AI applications: analyze a deal, prepare a financing request.
            </p>
          </Card>

          <Card as="li" tone="inverse">
            <Eyebrow className="text-gold">Genesis Infrastructure</Eyebrow>
            <h2 className="mt-5 text-[clamp(1.5rem,2.1vw,1.9rem)] leading-[1.06] tracking-[-0.03em]">
              Start with the existing operation.
            </h2>
            <p className="mt-4 text-[0.98rem] leading-relaxed text-muted-light">
              Genesis assesses the environment, scopes the work, implements the agreed systems,
              and remains responsible for the ongoing management included in the engagement.
            </p>
          </Card>
        </ul>
      </Sheet>

      <Sheet surface="ink" rise className="site-section text-center">
        <blockquote className="mx-auto max-w-[24ch] text-[clamp(2.2rem,4.4vw,3.9rem)] leading-[1.04] tracking-[-0.045em] text-balance">
          Become trusted before needed.
        </blockquote>
        <p className="mx-auto mt-7 max-w-[52ch] text-muted-light">
          That principle shapes how Genesis scopes work, communicates what is included, and stays
          accountable when an operation depends on the system.
        </p>
      </Sheet>

      <Sheet surface="paper" rise aria-labelledby="team-title" className="site-section">
        <SectionIntro eyebrow="Leadership" title="Meet the team." titleId="team-title" />

        <ul className="grid gap-5 sm:grid-cols-2 lg:max-w-[820px]">
          {teamMembers.map((member) => (
            <li key={member.name}>
              <article className="h-full overflow-hidden rounded-[24px] border border-line-light bg-white/70 shadow-[0_18px_44px_rgb(8_9_14/0.06)]">
                <div className="relative aspect-square overflow-hidden bg-ink">
                  <Image
                    src={member.image}
                    alt={`${member.name}, ${member.role} at Genesis AI`}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="p-[clamp(22px,2.4vw,32px)]">
                  <h3 className="text-[clamp(1.6rem,2.2vw,2rem)] leading-[1.05] tracking-[-0.03em]">
                    {member.name}
                  </h3>
                  <p className="mt-2 text-[0.95rem] text-muted-dark">{member.role}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Sheet>

      <ClosingBand
        eyebrow="Genesis Infrastructure"
        title="Start with the systems already in place."
        line="The consultation reviews the current environment, the friction, and whether a custom build is the right next step."
        actions={
          <ConsultationButton href="/contact">Book an Infrastructure consultation</ConsultationButton>
        }
      />
    </>
  );
}
