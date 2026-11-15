import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow, PageIntro, Section } from "@/components/ui/Section";
import { contact } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, graph } from "@/lib/schema";
import { ConsultationForm } from "./ConsultationForm";

export const metadata: Metadata = pageMetadata("/contact");

/** Where a first consultation may look. Not every area needs to change. */
const areas = [
  "Leads and qualification",
  "CRM and pipeline",
  "Follow-up",
  "Communication",
  "Documents",
  "Deal flow",
  "Business knowledge",
  "Team handoffs",
  "Automation",
  "Decision context",
  "Existing systems and integrations",
];

export default async function ContactPage({
  searchParams,
}: PageProps<"/contact">) {
  const params = await searchParams;
  const plan = typeof params.plan === "string" ? params.plan : "";

  return (
    <>
      <JsonLd data={graph(breadcrumbSchema("/contact"))} />

      <PageIntro
        eyebrow="Contact Genesis"
        title="Show us how the work moves today."
        description={[
          "Tell us what your operation is trying to handle, where work is getting stuck, and which systems or workflows are carrying the most manual coordination.",
          "The first conversation is about fit and scope, not forcing a predetermined stack into the business.",
        ]}
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <aside>
            <Eyebrow>The consultation</Eyebrow>
            <h2 className="mt-5 text-[clamp(1.9rem,3.2vw,2.8rem)] leading-[1.06] tracking-[-0.04em]">
              Start with the operation.
            </h2>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-muted-dark">
              A Genesis consultation is a focused, no-cost conversation about the current
              environment and where a managed implementation could create a more connected
              operating flow.
            </p>

            <p className="mt-7 text-[0.9rem] text-muted-dark">We may look at areas such as:</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {areas.map((area) => (
                <li
                  key={area}
                  className="rounded-[6px] border border-line-light bg-white/55 px-3 py-1 text-[0.82rem]"
                >
                  {area}
                </li>
              ))}
            </ul>

            <p className="mt-7 text-[0.95rem] leading-relaxed text-muted-dark">
              <span className="text-ink">Not every area needs to change.</span> The objective is to
              identify what should stay, what should connect, and where Genesis could carry more of
              the operational work.
            </p>

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
