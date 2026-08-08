import type { Metadata } from "next";
import { ConsultationCTA, PageIntro, SectionHeading } from "@/components/Shared";
import { Reveal } from "@/components/Reveal";
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
      <section className="section section-ivory">
        <div className="shell about-grid">
          <Reveal>
            <SectionHeading
              eyebrow="Why Genesis exists"
              title="Useful technology needs operational ownership."
            />
          </Reveal>
          <Reveal className="about-copy" delay={0.08}>
            <p className="lead">
              Real-estate operators do not need more disconnected software. They
              need a foundation, workflows, and support that work together.
            </p>
            <p>
              Genesis starts with the work, builds around practical priorities,
              introduces change clearly, and stays involved as the system evolves.
            </p>
            <blockquote>Become trusted before needed.</blockquote>
            <p>
              That principle shapes both the consultation and the system itself:
              prepare carefully, communicate plainly, and remain accountable when
              the operation depends on it.
            </p>
          </Reveal>
        </div>
      </section>
      <section className="section section-dark founder-section">
        <div className="shell founder-grid">
          <Reveal>
            <p className="eyebrow">Founder</p>
            <h2>Reginald Benjamin</h2>
          </Reveal>
          <Reveal className="founder-copy" delay={0.08}>
            <p>
              Reginald Benjamin leads Genesis AI’s operator-first approach to
              practical implementation and ongoing system management.
            </p>
            <p>
              Further experience, credentials, and biographical details will be
              added only when supporting source material is available.
            </p>
          </Reveal>
        </div>
      </section>
      <ConsultationCTA />
    </>
  );
}
