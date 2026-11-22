import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow, PageIntro, Section } from "@/components/ui/Section";
import { contact } from "@/lib/content";
import { isWebsiteCheckTopic, ministryConsultationNote, ministryContact } from "@/lib/ministryPage";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, graph } from "@/lib/schema";
import { ConsultationForm } from "./ConsultationForm";

export const metadata: Metadata = pageMetadata("/contact");

/** The business version of the page: what a first consultation may look at. */
const business = {
  intro: {
    eyebrow: "Contact Genesis",
    title: "Show us how the work moves today.",
    description: [
      "Tell us what your operation is trying to handle, where work is getting stuck, and which systems or workflows are carrying the most manual coordination.",
      "The first conversation is about fit and scope, not forcing a predetermined stack into the business.",
    ],
  },
  aside: {
    eyebrow: "The consultation",
    title: "Start with the operation.",
    body: "A Genesis consultation is a focused, no-cost conversation about the current environment and where a managed implementation could create a more connected operating flow.",
    areasLead: "We may look at areas such as:",
    /** Where a first consultation may look. Not every area needs to change. */
    areas: [
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
    ],
    closingLead: "Not every area needs to change.",
    closing:
      "The objective is to identify what should stay, what should connect, and where Genesis could carry more of the operational work.",
  },
};

export default async function ContactPage({
  searchParams,
}: PageProps<"/contact">) {
  const params = await searchParams;
  const plan = typeof params.plan === "string" ? params.plan : "";
  /* A known Ministry topic (a plan, the demo walkthrough or the free Church
     Website Check) starts the notes field with what the visitor came for, a
     plan with its name and price, and shows the church version of the page:
     church words, church roles and never the business plans or their prices.
     Unknown topics are ignored. */
  const note = ministryConsultationNote(params.topic);
  const church = note !== "";
  /* The free Church Website Check has its own words and asks for the website first. */
  const websiteCheck = church && isWebsiteCheckTopic(params.topic);
  const copy = websiteCheck ? ministryContact.websiteCheck : church ? ministryContact : business;

  return (
    <>
      <JsonLd data={graph(breadcrumbSchema("/contact"))} />

      <PageIntro eyebrow={copy.intro.eyebrow} title={copy.intro.title} description={copy.intro.description} />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          {/* A Website Check is a short form: on phones it comes first, and what we look at follows it. */}
          <aside className={websiteCheck ? "max-lg:order-last" : undefined}>
            <Eyebrow>{copy.aside.eyebrow}</Eyebrow>
            <h2 className="mt-5 text-[clamp(1.9rem,3.2vw,2.8rem)] leading-[1.06] tracking-[-0.04em]">
              {copy.aside.title}
            </h2>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-muted-dark">{copy.aside.body}</p>

            <p className="mt-7 text-[0.9rem] text-muted-dark">{copy.aside.areasLead}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {copy.aside.areas.map((area) => (
                <li
                  key={area}
                  className="rounded-[6px] border border-line-light bg-white/55 px-3 py-1 text-[0.82rem]"
                >
                  {area}
                </li>
              ))}
            </ul>

            <p className="mt-7 text-[0.95rem] leading-relaxed text-muted-dark">
              <span className="text-ink">{copy.aside.closingLead}</span> {copy.aside.closing}
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

          <ConsultationForm
            initialPlan={plan}
            initialNote={note}
            audience={church ? "church" : "business"}
            websiteCheck={websiteCheck}
          />
        </div>

      </Section>
    </>
  );
}
