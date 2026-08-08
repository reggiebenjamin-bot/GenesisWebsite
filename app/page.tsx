import Link from "next/link";
import { CinematicHero } from "@/components/CinematicHero";
import { PricingCards } from "@/components/PricingCards";
import { Reveal } from "@/components/Reveal";
import { ConsultationCTA, Eyebrow, SectionHeading } from "@/components/Shared";
import { SystemLayers } from "@/components/SystemLayers";
import { audiences, faqs, processSteps } from "@/lib/content";

export default function Home() {
  return (
    <>
      <CinematicHero />

      <section className="capability-strip" aria-label="Genesis system capabilities">
        <div className="shell capability-strip__inner">
          <p>One accountable system</p>
          <span>Microsoft 365 foundation</span>
          <span>Practical AI workflows</span>
          <span>Optional Genesis CRM</span>
          <span>Ongoing management</span>
        </div>
      </section>

      <section className="section section-ivory problem-section">
        <div className="shell problem-grid">
          <Reveal>
            <Eyebrow>The operational problem</Eyebrow>
            <h2>Deals move quickly. Disconnected systems do not.</h2>
          </Reveal>
          <Reveal className="problem-copy" delay={0.08}>
            <p className="lead">
              Leads, follow-up, documents, calendars, and team communication often
              live in separate places—with people filling the gaps manually.
            </p>
            <p>
              Genesis brings the work into a managed operating system designed to
              make the business more responsive, consistent, and ready to scale.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section section-dark system-section">
        <div className="shell">
          <Reveal>
            <SectionHeading
              light
              eyebrow="One connected system"
              title="Four layers. One operation."
              description="Each layer supports the next, creating a professional environment that can be implemented, used, and improved over time."
            />
          </Reveal>
          <SystemLayers compact />
          <Link className="text-link text-link--light" href="/solutions">
            Explore the complete system <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="section section-ivory">
        <div className="shell">
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="From operational friction to a system your team can rely on."
              description="The work begins with the operation—not a prepackaged stack of tools."
            />
          </Reveal>
          <div className="process-grid">
            {processSteps.map((step, index) => (
              <Reveal key={step.number} className="process-step" delay={index * 0.06}>
                <span className="process-step__number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </Reveal>
            ))}
          </div>
          <Link className="text-link" href="/how-it-works">
            See the implementation process <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="section audience-section">
        <div className="shell">
          <Reveal>
            <SectionHeading
              eyebrow="Built around the operator"
              title="The same system, shaped to different operating realities."
            />
          </Reveal>
          <div className="audience-grid">
            {audiences.map((audience, index) => (
              <Reveal key={audience.title} className="audience-card" delay={index * 0.05}>
                <p className="audience-card__type">{audience.title}</p>
                <h3>{audience.outcome}</h3>
                <p>{audience.description}</p>
              </Reveal>
            ))}
          </div>
          <Link className="text-link" href="/solutions">
            Find your operating path <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="section proof-standard section-dark">
        <div className="shell proof-standard__grid">
          <Reveal>
            <Eyebrow>Accountability by design</Eyebrow>
            <h2>The system is not handed off and forgotten.</h2>
          </Reveal>
          <Reveal className="proof-standard__copy" delay={0.08}>
            <p>
              Genesis stays responsible for monitoring, support, maintenance,
              and practical improvement. Published results will follow the same
              standard: specific, attributable, and verified.
            </p>
            <Link className="text-link text-link--light" href="/results">
              See the proof standard <span aria-hidden="true">↗</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section section-ivory pricing-section">
        <div className="shell">
          <Reveal>
            <SectionHeading
              eyebrow="Starting pricing"
              title="A clear starting point. A scope built around your operation."
              description="Every engagement begins with a consultation so the recommendation matches the people, workflows, and complexity involved."
            />
          </Reveal>
          <PricingCards condensed />
        </div>
      </section>

      <section className="section faq-section">
        <div className="shell faq-grid">
          <Reveal>
            <SectionHeading eyebrow="FAQ" title="Questions serious operators ask first." />
          </Reveal>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <Reveal key={faq.question} delay={index * 0.035}>
                <details className="faq-item">
                  <summary>
                    {faq.question} <span aria-hidden="true">+</span>
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ConsultationCTA />
    </>
  );
}
