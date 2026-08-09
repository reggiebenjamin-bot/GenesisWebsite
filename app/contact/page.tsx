import type { Metadata } from "next";
import { Eyebrow, PageIntro, Section } from "@/components/ui/Section";
import { contact } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { ConsultationForm } from "./ConsultationForm";

export const metadata: Metadata = pageMetadata(
  "Contact",
  "Book a consultation with Genesis AI to discuss your real-estate operation, workflows, and managed system needs.",
);

const expectations = [
  ["01", "Review your current environment"],
  ["02", "Identify the highest-value friction"],
  ["03", "Define the right next step"],
];

export default async function ContactPage({
  searchParams,
}: PageProps<"/contact">) {
  const params = await searchParams;
  const plan = typeof params.plan === "string" ? params.plan : "";

  return (
    <>
      <PageIntro
        eyebrow="Book a consultation"
        title="Start with the operation you have—and the one you are building toward."
        description="Tell us where work slows down, what your team uses today, and what a stronger system needs to make possible."
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <aside>
            <Eyebrow>What to expect</Eyebrow>
            <h2 className="mt-5 text-[clamp(2rem,3.6vw,3.2rem)]">
              A focused first conversation.
            </h2>

            <ol className="mt-10 grid gap-5">
              {expectations.map(([number, copy]) => (
                <li
                  key={number}
                  className="flex gap-4 border-t border-line-light pt-5"
                >
                  <span className="font-display text-[0.68rem] text-gold-dark">
                    {number}
                  </span>
                  <span className="text-muted-dark">{copy}</span>
                </li>
              ))}
            </ol>

            <div className="mt-12 grid gap-2 border-t border-line-light pt-8">
              <p className="text-[0.9rem] text-muted-dark">
                Prefer to reach out directly?
              </p>
              <a
                href={`mailto:${contact.email}`}
                className="w-fit border-b border-ink/30 font-medium"
              >
                {contact.email}
              </a>
              <a
                href={`tel:${contact.phoneHref}`}
                className="w-fit border-b border-ink/30 font-medium"
              >
                {contact.phoneDisplay}
              </a>
            </div>
          </aside>

          <ConsultationForm initialPlan={plan} />
        </div>
      </Section>
    </>
  );
}
