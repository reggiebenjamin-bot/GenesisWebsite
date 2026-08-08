import type { Metadata } from "next";
import { ConsultationForm } from "./ConsultationForm";
import { PageIntro } from "@/components/Shared";
import { contact } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "Contact",
  "Book a consultation with Genesis AI to discuss your real-estate operation, workflows, and managed system needs.",
);

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const params = await searchParams;
  const plan = typeof params.plan === "string" ? params.plan : "";

  return (
    <>
      <PageIntro
        eyebrow="Book a consultation"
        title="Start with the operation you have—and the one you are building toward."
        description="Tell us where work slows down, what your team uses today, and what a stronger system needs to make possible."
      />
      <section className="section section-ivory contact-section">
        <div className="shell contact-grid">
          <aside className="contact-aside">
            <p className="eyebrow">What to expect</p>
            <h2>A focused first conversation.</h2>
            <ol>
              <li><span>01</span> Review your current environment</li>
              <li><span>02</span> Identify the highest-value friction</li>
              <li><span>03</span> Define the right next step</li>
            </ol>
            <div className="contact-direct">
              <p>Prefer to reach out directly?</p>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
              <a href={`tel:${contact.phoneHref}`}>{contact.phoneDisplay}</a>
            </div>
          </aside>
          <ConsultationForm initialPlan={plan} />
        </div>
      </section>
    </>
  );
}
