import Link from "next/link";
import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-intro section-dark">
      <div className="shell page-intro__inner">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <div className={`section-heading ${light ? "section-heading--light" : ""}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export function ConsultationCTA() {
  return (
    <section className="consultation-cta section-dark">
      <div className="shell consultation-cta__inner">
        <div>
          <Eyebrow>Build the operating advantage</Eyebrow>
          <h2>Make the system behind the work as strong as the work itself.</h2>
        </div>
        <div className="consultation-cta__action">
          <p>
            Start with a focused consultation about your operation, priorities,
            and existing tools.
          </p>
          <Link className="button button--gold" href="/contact">
            Book a Consultation <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
