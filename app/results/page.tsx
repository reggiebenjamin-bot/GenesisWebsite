import type { Metadata } from "next";
import { ActiveEngagements } from "@/components/sections/ActiveEngagements";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";
import { EvidenceFlow } from "@/components/sections/EvidenceFlow";
import { Reveal } from "@/components/ui/Reveal";
import {
  Eyebrow,
  PageIntro,
  Section,
  SectionHeading,
} from "@/components/ui/Section";
import { pageMetadata } from "@/lib/metadata";
import styles from "./results.module.css";

export const metadata: Metadata = pageMetadata(
  "Results",
  "See where the Genesis System is at work today and the evidence standard required before any client-level result is published.",
);

const restraintItems = [
  "No result without written client sign-off.",
  "No stock testimonials or composite quotes.",
  "No promised revenue outcome.",
  "No calling a pilot a case study before it is measured.",
  "No naming a client without permission—ever.",
] as const;

export default function ResultsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Evidence Standard"
        title="Credibility is built with evidence—not decorated with claims."
        description="Here is what that standard means in practice—how Genesis verifies, what it withholds until a client clears it, and where the system is already at work today."
      />

      <Section tone="dark">
        <Reveal>
          <SectionHeading
            eyebrow="How Genesis verifies"
            title="Every result stays connected to its source."
            description="Genesis documents the baseline before the build, measures inside the client’s own system of record, uses consistent measurement windows, and publishes only with written approval of the number, context, and wording."
          />
        </Reveal>
        <Reveal delay={0.08}>
          <EvidenceFlow />
        </Reveal>
      </Section>

      <Section>
        <div className={styles.restraintLayout}>
          <Reveal>
            <Eyebrow>What you won&rsquo;t see here</Eyebrow>
            <h2 className={styles.restraintTitle}>
              Restraint is part of the evidence standard.
            </h2>
            <p className={styles.restraintCopy}>
              Genesis distinguishes work underway from outcomes already proven.
              Until the evidence and permission exist, the claim does not.
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <ul className={styles.restraintList}>
              {restraintItems.map((item, index) => (
                <li className={styles.restraintItem} key={item}>
                  <span aria-hidden="true">0{index + 1}</span>
                  <p>{item}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section className="bg-paper">
        <Reveal>
          <SectionHeading
            eyebrow="Active engagements"
            title="The system is already at work. The outcomes are still being earned."
            description="Genesis is live in production for two independent operations today, with a third large-scale engagement underway. Each engagement is shown at its present evidence level; specific results publish only after measurement and client clearance."
          />
        </Reveal>
        <Reveal delay={0.08}>
          <ActiveEngagements />
        </Reveal>
      </Section>

      <Section tone="navy">
        <div className={styles.founderLayout}>
          <Reveal>
            <Eyebrow>Founder track record</Eyebrow>
            <h2>Built from inside the operations Genesis serves.</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p>
              Genesis is built and operated by a licensed Texas real estate
              professional with an enterprise technology sales background,
              personally active today in real estate and lending
              operations—the same kinds of businesses Genesis is built for.
              This isn&rsquo;t advisory distance. It&rsquo;s operated daily, inside
              real operating businesses, before it&rsquo;s ever offered to a client.
            </p>
          </Reveal>
        </div>
      </Section>

      <ConsultationCTA
        eyebrow="Verification framework"
        title="See how the evidence would work inside your operation."
        description="Ask about the verification framework in your consultation—see exactly how we’d baseline and measure your operation before any number goes public."
      />
    </>
  );
}
