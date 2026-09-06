import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { PageIntro, Section, SectionHeading } from "@/components/ui/Section";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "Team",
  "Meet the Genesis AI leadership team across founder, operations, and technology.",
);

const teamMembers = [
  { name: "Reggie", role: "Founder" },
  { name: "Graham", role: "Head of Operations" },
  { name: "Aiden", role: "Director of Technology" },
] as const;

export default function TeamPage() {
  return (
    <>
      <PageIntro
        eyebrow="The Genesis team"
        title="The people responsible for what Genesis builds."
        description="Genesis is led across direction, operations, and technology so the work stays grounded in the systems it is responsible for."
      />

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Leadership"
            title="Meet the team."
            description="Portraits will be added here. Each image slot is reserved at a 1080 × 1080 square format."
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member, index) => (
            <Reveal key={member.name} delay={index * 0.07}>
              <article className="h-full overflow-hidden rounded-lg border border-line-light bg-paper shadow-[0_18px_50px_rgb(8_9_14_/_0.07)]">
                <div
                  aria-label={`1080 by 1080 portrait placeholder for ${member.name}`}
                  role="img"
                  className="relative aspect-square overflow-hidden bg-[radial-gradient(circle_at_28%_20%,rgb(242_216_149_/_0.22),transparent_28%),linear-gradient(145deg,#101929_0%,#08090e_100%)]"
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgb(244_239_232_/_0.1)_1px,transparent_1px),linear-gradient(90deg,rgb(244_239_232_/_0.1)_1px,transparent_1px)] [background-size:32px_32px]"
                  />
                  <div className="absolute inset-[10%] border border-gold/40" />
                  <div className="absolute inset-0 grid place-items-center p-8 text-center">
                    <div>
                      <span className="font-display text-[0.7rem] font-semibold tracking-[0.17em] text-gold-light uppercase">
                        Portrait placeholder
                      </span>
                      <p className="mt-3 text-[1.05rem] text-ivory/85">1080 × 1080</p>
                    </div>
                  </div>
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
    </>
  );
}
