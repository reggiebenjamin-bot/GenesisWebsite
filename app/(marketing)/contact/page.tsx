import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { TextLink } from "@/components/ui/Button";
import { Eyebrow, PageIntro, Section } from "@/components/ui/Section";
import { ASSESSMENT_REVIEW_TOPIC, assessmentReviewNote } from "@/lib/assessment";
import { contact } from "@/lib/content";
import { isWebsiteCheckTopic, ministryConsultationNote, ministryContact } from "@/lib/ministryPage";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, graph } from "@/lib/schema";
import { ConsultationForm } from "./ConsultationForm";

/* A church topic names Genesis Ministry in the tab; the canonical stays /contact. */
export async function generateMetadata({ searchParams }: PageProps<"/contact">): Promise<Metadata> {
  const base = pageMetadata("/contact");
  const { topic } = await searchParams;
  return ministryConsultationNote(topic) ? { ...base, title: { absolute: "Book a Call About Genesis Ministry" } } : base;
}

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
  /* A business visitor booking the review from the assessment results starts with a note that says so. */
  const reviewNote = !church && params.topic === ASSESSMENT_REVIEW_TOPIC ? assessmentReviewNote : "";
  const formFirst = church || reviewNote !== "";

  const form = (
    <ConsultationForm
      initialPlan={plan}
      initialNote={note || reviewNote}
      audience={church ? "church" : "business"}
      websiteCheck={websiteCheck}
      topic={typeof params.topic === "string" ? params.topic : ""}
    />
  );

  const aside = (
    <aside>
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

      {/* A church consultation names the plans and prices, as /ministry and /pricing do.
          The free Website Check does not: it is not a sale. */}
      {church && !websiteCheck ? (
        <div className="mt-7 grid gap-1">
          <p className="text-[0.95rem] leading-relaxed text-muted-dark">{ministryContact.aside.plans.line}</p>
          <TextLink href={ministryContact.aside.plans.link.href} className="w-fit">
            {ministryContact.aside.plans.link.label}
          </TextLink>
        </div>
      ) : null}

      <div className="mt-10 grid gap-2 border-t border-line-light pt-7">
        <p className="text-[0.9rem] text-muted-dark">
          Prefer to contact Genesis directly?
        </p>
        <a
          href={`mailto:${contact.email}`}
          className="inline-flex min-h-11 w-fit items-center font-medium underline decoration-ink/30 underline-offset-4"
        >
          {contact.email}
        </a>
        <a
          href={`tel:${contact.phoneHref}`}
          className="inline-flex min-h-11 w-fit items-center font-medium underline decoration-ink/30 underline-offset-4"
        >
          {contact.phoneDisplay}
        </a>
      </div>
    </aside>
  );

  return (
    <>
      <JsonLd data={graph(breadcrumbSchema("/contact"))} />

      <PageIntro eyebrow={copy.intro.eyebrow} title={copy.intro.title} description={copy.intro.description} />

      <Section>
        {/* For a church, and for the review booked from the assessment, the form comes first, in
            the reading order as well as on screen, so keyboard and screen reader order match
            what is shown at every width. They already know why they are here. */}
        <div
          className={
            formFirst
              ? "grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-24"
              : "grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24"
          }
        >
          {formFirst ? form : aside}
          {formFirst ? aside : form}
        </div>
      </Section>
    </>
  );
}
