import type { Metadata } from "next";
import { Eyebrow, PageIntro, Section } from "@/components/ui/Section";
import { contact } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { ConsultationForm } from "./ConsultationForm";

export const metadata: Metadata = pageMetadata(
  "Contact",
  "Book a Genesis Infrastructure consultation to review the current environment, operating friction, and the right custom-build scope.",
);

const expectations = [
  ["01", "Review the current systems, documents, and workflows"],
  ["02", "Identify the manual work creating the most drag"],
  ["03", "Define a scope and a next step"],
];

export default async function ContactPage({
  searchParams,
}: PageProps<"/contact">) {
  const params = await searchParams;
  const plan = typeof params.plan === "string" ? params.plan : "";

  return (
    <>
      <PageIntro
        eyebrow="Genesis Infrastructure"
        title="Start with a practical review of the current operation."
        description="For operators considering a custom Infrastructure build. Separate from Genesis Tools interest, signup, or billing."
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <aside>
            <Eyebrow>What to expect</Eyebrow>
            <h2 className="mt-5 text-[clamp(1.9rem,3.2vw,2.8rem)] leading-[1.06] tracking-[-0.04em]">
              A focused first conversation.
            </h2>

            <ol className="mt-9 grid gap-4">
              {expectations.map(([number, copy]) => (
                <li
                  key={number}
                  className="flex gap-4 border-t border-line-light pt-4"
                >
                  <span className="font-display text-[0.68rem] text-gold-dark">
                    {number}
                  </span>
                  <span className="text-[0.95rem] text-muted-dark">{copy}</span>
                </li>
              ))}
            </ol>

            <div className="mt-10 grid gap-2 border-t border-line-light pt-7">
              <p className="text-[0.9rem] text-muted-dark">
                Prefer to contact Genesis directly?
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
