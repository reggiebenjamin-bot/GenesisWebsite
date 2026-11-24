/*
 * The free Genesis Infrastructure Assessment.
 *
 * It asks how work actually moves through an operation, then names where that
 * operation appears to be carrying manual coordination. It is deliberately
 * not a Genesis architecture: the assessment says where the friction seems to
 * be, the Infrastructure Review says what should change, and the engagement
 * builds it. Every finding here is qualitative and hedged, because there is
 * no measurement behind a questionnaire that would justify a number.
 */

import { CRM_QUESTION, crmOptions } from "./crm.ts";
import { ministryEdition } from "./editions.ts";
import { ministryLevels } from "./ministryPage.ts";

/** The persona a church picks. It must match the case in pricingPathForPersona. */
export const CHURCH_PERSONA = "Church or ministry";

/** The Genesis OS edition the assessment recommends, with the links it offers. */
export type EditionRecommendation = {
  edition: "ministry";
  eyebrow: string;
  name: string;
  body: string;
  points: readonly string[];
  /** Each plan as "Care, $149 a month". */
  plans: readonly string[];
  /** Enterprise, for more than one campus, is scoped on a call. */
  enterprise: string;
  /** Shown on step one as soon as a church picks its persona. */
  stepNote: string;
  page: { label: string; href: string };
  plansLink: { label: string; href: string };
  call: { label: string; href: string };
};

/**
 * The edition built for this persona, or null when the business Levels fit.
 * Today only churches get one: Genesis Ministry, its three plans, the page
 * and a call. Everyone else keeps the business results and pricing.
 */
export function assessmentEdition(persona: string | undefined): EditionRecommendation | null {
  if (persona !== CHURCH_PERSONA) return null;
  return {
    edition: "ministry",
    eyebrow: `Recommended for you. Edition ${ministryEdition.no}`,
    name: ministryEdition.name,
    body: ministryEdition.body,
    points: ministryEdition.points,
    plans: ministryLevels.levels.map((plan) => `${plan.name}, ${plan.priceDisplay} a month`),
    enterprise: ministryLevels.enterprise.line,
    stepNote:
      "Genesis Ministry is built for churches of about 100 to 1,000 people. You can see it now, or keep going: the next questions are about guests and care at your church.",
    page: { label: "See Genesis Ministry", href: ministryEdition.href },
    plansLink: { label: "See the Plans", href: `${ministryEdition.href}#levels` },
    call: { label: "Book a Call", href: "/contact?topic=ministry" },
  };
}

export type Choice = { value: string; label: string };

export type Question =
  | { id: string; kind: "single"; label: string; help?: string; options: readonly Choice[] }
  | { id: string; kind: "multi"; label: string; help?: string; options: readonly Choice[] }
  | { id: string; kind: "text"; label: string; help?: string; placeholder?: string };

export type Step = {
  id: string;
  heading: string;
  questions: readonly Question[];
};

const choices = (...labels: string[]): readonly Choice[] =>
  labels.map((label) => ({ value: label, label }));

/** Steps 1–7. The eighth step asks who to send it to, and is its own form. */
export const assessmentSteps: readonly Step[] = [
  {
    id: "business",
    heading: "First, tell us what you're operating.",
    questions: [
      {
        id: "persona",
        kind: "single",
        label: "Which best describes your business or organization?",
        options: choices(
          "Agent / Solo Operator",
          "Real Estate Team",
          "Brokerage",
          "Lender",
          "Investor / Acquisitions",
          "Developer",
          "Service business / trades (HVAC and more)",
          CHURCH_PERSONA,
          "Other",
        ),
      },
      {
        id: "team_size",
        kind: "single",
        label: "How many people actively work inside the operation?",
        options: choices("Just me", "2–5", "6–15", "16–50", "50+"),
      },
    ],
  },
  {
    id: "leads",
    heading: "How does new business enter the operation?",
    questions: [
      {
        id: "lead_sources",
        kind: "multi",
        label: "Where do new leads or opportunities come from?",
        options: choices(
          "Website",
          "Paid advertising",
          "Referrals",
          "Portal / marketplace leads",
          "Email",
          "Phone",
          "Social media",
          "Networking",
          "Internal sourcing",
          "Other",
        ),
      },
      {
        id: "lead_response",
        kind: "single",
        label:
          "When a new lead or opportunity arrives, how consistently does the next action happen automatically or through a defined process?",
        options: choices(
          "Almost always",
          "Usually",
          "Sometimes",
          "Rarely",
          "It depends on someone noticing it",
        ),
      },
    ],
  },
  {
    id: "systems",
    heading: "Where does the work live?",
    questions: [
      {
        id: "systems_used",
        kind: "multi",
        label: "Which systems are part of your current operation?",
        options: choices(
          "CRM",
          "Email",
          "Calendar",
          "Text / SMS",
          "Phone / telephony",
          "Cloud storage",
          "Microsoft 365",
          "Google Workspace",
          "Transaction management software",
          "Loan / lending software",
          "Spreadsheets",
          "Project management",
          "Other",
        ),
      },
      {
        id: "crm",
        kind: "single",
        label: CRM_QUESTION,
        options: choices(...crmOptions.map((option) => option.label)),
      },
      {
        id: "manual_transfer_frequency",
        kind: "single",
        label: "How often does someone manually move information between these systems?",
        options: choices("Rarely", "Occasionally", "Every day", "Constantly"),
      },
    ],
  },
  {
    id: "follow-up",
    heading: "What still depends on someone remembering?",
    questions: [
      {
        id: "follow_up_process",
        kind: "single",
        label: "How is follow-up handled today?",
        options: choices(
          "Mostly automated",
          "Defined process with manual steps",
          "CRM reminders",
          "Individual team members manage it",
          "Mostly from memory / inbox",
          "It varies depending on the deal or lead",
        ),
      },
      {
        id: "communication_channels",
        kind: "multi",
        label: "Where does important communication happen?",
        options: choices(
          "Email",
          "Text",
          "Phone",
          "CRM",
          "Teams / Slack",
          "Personal inboxes",
          "Multiple places depending on the person",
        ),
      },
    ],
  },
  {
    id: "deals",
    heading: "How does information move once work becomes active?",
    questions: [
      {
        id: "document_storage",
        kind: "single",
        label: "Where are deal or client documents primarily stored?",
        options: choices(
          "One organized system",
          "CRM",
          "Cloud drive",
          "Email",
          "Shared folders",
          "Multiple locations",
          "Depends on the employee",
        ),
      },
      {
        id: "handoff_quality",
        kind: "single",
        label: "When a deal changes hands, does the next person usually have the context they need?",
        options: choices(
          "Yes, consistently",
          "Usually",
          "Sometimes",
          "Rarely",
          "They normally have to ask someone",
        ),
      },
    ],
  },
  {
    id: "pressure",
    heading: "What gets harder as the business grows?",
    questions: [
      {
        id: "operational_pain_points",
        kind: "multi",
        label: "Which problems are you experiencing?",
        options: choices(
          "Leads slipping through",
          "Inconsistent follow-up",
          "Too many systems",
          "Re-entering information",
          "Documents difficult to find",
          "Poor pipeline visibility",
          "Team handoffs",
          "Too much owner involvement",
          "Repetitive administrative work",
          "Communication scattered across systems",
          "Processes living in people's heads",
          "Difficulty knowing what needs attention next",
          "Other",
        ),
      },
      {
        id: "growth_breakpoint",
        kind: "text",
        label: "If volume increased significantly next month, what would break first?",
        placeholder: "The part of the operation you would worry about…",
      },
    ],
  },
  {
    id: "outcomes",
    heading: "What would you most like the operation to do better?",
    questions: [
      {
        id: "desired_outcomes",
        kind: "multi",
        label: "Choose as many as apply.",
        options: choices(
          "Respond to leads consistently",
          "Automate follow-up",
          "Connect existing systems",
          "Improve CRM workflows",
          "Organize deal information",
          "Improve team handoffs",
          "Automate document workflows",
          "Make operational information easier to find",
          "Reduce repetitive admin",
          "Improve pipeline visibility",
          "Use AI across the business",
          "Not sure yet",
        ),
      },
    ],
  },
];

/*
 * The church path. Once a church picks its persona, the steps after the first
 * ask about guests, follow up, care and the tools a church already uses, in a
 * church's own words. The persona question stays the same, so a church can
 * still change its mind on step one. Every option here is also an answer the
 * API accepts, because the API reads its allowed answers from these lists.
 */
const personaQuestion = assessmentSteps[0].questions[0];

export const churchSteps: readonly Step[] = [
  {
    id: "business",
    heading: "First, tell us about your church.",
    questions: [
      personaQuestion,
      {
        id: "weekly_attendance",
        kind: "single",
        label: "About how many people attend on a typical weekend?",
        options: choices("Under 100", "100 to 250", "251 to 500", "501 to 1,000", "More than 1,000"),
      },
    ],
  },
  {
    id: "church-guests",
    heading: "How do first time guests find you?",
    questions: [
      {
        id: "guest_sources",
        kind: "multi",
        label: "Where do most first time guests hear about your church?",
        options: choices(
          "Our website",
          "Google search or Maps",
          "A friend invited them",
          "Social media",
          "Online services or livestream",
          "Community events",
          "Driving by",
          "Other",
        ),
      },
      {
        id: "guest_details",
        kind: "single",
        label: "When a first time guest visits, how do you get their details?",
        options: choices(
          "A form on our website",
          "A paper connect card",
          "A text or QR code",
          "A greeter writes it down",
          "Several of these",
          "We often do not get them",
        ),
      },
    ],
  },
  {
    id: "church-follow-up",
    heading: "What happens after someone visits?",
    questions: [
      {
        id: "guest_follow_up",
        kind: "single",
        label: "How does follow up with a first time guest happen today?",
        options: choices(
          "A set process, with someone responsible",
          "A pastor handles it personally",
          "A volunteer team, when they can",
          "It depends on who met them",
          "It often does not happen",
        ),
      },
      {
        id: "follow_up_speed",
        kind: "single",
        label: "How soon does a first time guest usually hear from someone?",
        options: choices(
          "Within a day",
          "Within the week",
          "After more than a week",
          "Often not at all",
          "We are not sure",
        ),
      },
    ],
  },
  {
    id: "church-care",
    heading: "Where do care and church information live?",
    questions: [
      {
        id: "care_requests",
        kind: "single",
        label: "How do prayer and care requests reach your pastors?",
        options: choices(
          "Through one shared place",
          "Email or text to a pastor",
          "Paper cards",
          "Word of mouth",
          "Several places, depending on the person",
        ),
      },
      {
        id: "church_tools",
        kind: "multi",
        label: "Which church tools do you use today?",
        options: choices(
          "Planning Center",
          "Breeze",
          "Church Community Builder",
          "Subsplash",
          "Pushpay",
          "Tithe.ly",
          "Realm",
          "Rock RMS",
          "Spreadsheets",
          "Email and paper",
          "Other",
          "None yet",
        ),
      },
    ],
  },
  {
    id: "church-team",
    heading: "Who carries the work in a week?",
    questions: [
      {
        id: "church_staff",
        kind: "single",
        label: "How many people are on staff, full or part time?",
        options: choices("Just the pastor", "2 to 5", "6 to 15", "More than 15"),
      },
      {
        id: "church_volunteers",
        kind: "single",
        label: "How many volunteers serve in a typical month?",
        options: choices("Fewer than 10", "10 to 25", "26 to 75", "More than 75"),
      },
    ],
  },
  {
    id: "church-pressure",
    heading: "What would you most like to get better?",
    questions: [
      {
        id: "church_pain_points",
        kind: "multi",
        label: "Which of these sound like your church?",
        options: choices(
          "Guests slip away after one visit",
          "Follow up depends on one person",
          "Prayer requests land in too many places",
          "Our website is hard to use on a phone",
          "The office answers the same questions all week",
          "Our tools do not talk to each other",
          "Knowing who needs care next",
          "Getting the word out each week",
          "Other",
        ),
      },
      {
        id: "church_breakpoint",
        kind: "text",
        label: "If twice as many guests came this season, what would be hardest to keep up with?",
        placeholder: "The part of welcome or care you would worry about…",
      },
    ],
  },
];

/** The steps a visitor sees: the church path once a church picks its persona, the business path otherwise. */
export function stepsFor(persona: string | undefined): readonly Step[] {
  return persona === CHURCH_PERSONA ? churchSteps : assessmentSteps;
}

/**
 * Every question either path can ask, once each, in order. The API accepts
 * answers from these, so a church's answers are allowed as well as a business's.
 */
export const assessmentQuestions: readonly Question[] = [
  ...new Map(
    [...assessmentSteps, ...churchSteps]
      .flatMap((step) => step.questions)
      .map((question) => [question.id, question] as const),
  ).values(),
];

/** A single answer is one choice; a multi answer is a list of them. */
export type Answers = Record<string, string | string[] | undefined>;

const one = (answers: Answers, id: string) =>
  typeof answers[id] === "string" ? (answers[id] as string) : "";
const many = (answers: Answers, id: string) =>
  Array.isArray(answers[id]) ? (answers[id] as string[]) : [];

/** How many of these signals the answers carry. */
const signals = (...tests: boolean[]) => tests.filter(Boolean).length;

export type ResultCategory = {
  id: string;
  title: string;
  body: string;
  /** The areas this points at, for the summary's review list. */
  review: string;
};

type Finding = ResultCategory & { weight: number };

/*
 * Each category and the answers that point at it. A category only appears
 * when the answers actually carry a signal for it — nothing is shown to fill
 * a quota, and nothing is scored into a percentage it could not support.
 */
const categories: readonly (ResultCategory & { weight: (answers: Answers) => number })[] = [
  {
    id: "follow-up-dependency",
    title: "Follow-Up Dependency",
    body: "Important next actions still appear to depend on people noticing, remembering, or manually initiating them.",
    review: "Lead intake → follow-up",
    weight: (a) =>
      signals(
        ["Mostly from memory / inbox", "Individual team members manage it"].includes(
          one(a, "follow_up_process"),
        ),
        one(a, "follow_up_process") === "It varies depending on the deal or lead",
        ["Sometimes", "Rarely", "It depends on someone noticing it"].includes(
          one(a, "lead_response"),
        ),
        many(a, "operational_pain_points").includes("Inconsistent follow-up"),
        many(a, "operational_pain_points").includes("Leads slipping through"),
      ),
  },
  {
    id: "system-fragmentation",
    title: "System Fragmentation",
    body: "Important business information is spread across systems that require people to move or reconcile context manually.",
    review: "CRM → communication",
    weight: (a) =>
      signals(
        many(a, "systems_used").length >= 5,
        many(a, "systems_used").length >= 8,
        ["Every day", "Constantly"].includes(one(a, "manual_transfer_frequency")),
        many(a, "operational_pain_points").includes("Too many systems"),
        many(a, "operational_pain_points").includes("Communication scattered across systems"),
      ),
  },
  {
    id: "handoff-friction",
    title: "Handoff Friction",
    body: "Deals or clients can change hands without all of the relevant information moving with them.",
    review: "Team handoffs",
    weight: (a) =>
      signals(
        ["Sometimes", "Rarely"].includes(one(a, "handoff_quality")),
        one(a, "handoff_quality") === "They normally have to ask someone",
        many(a, "operational_pain_points").includes("Team handoffs"),
      ),
  },
  {
    id: "document-friction",
    title: "Document Friction",
    body: "Documents and transaction information may require unnecessary searching, requesting, or manual organization.",
    review: "Deal context → documents",
    weight: (a) =>
      signals(
        ["Multiple locations", "Depends on the employee"].includes(one(a, "document_storage")),
        ["Email", "Shared folders"].includes(one(a, "document_storage")),
        many(a, "operational_pain_points").includes("Documents difficult to find"),
      ),
  },
  {
    id: "owner-dependency",
    title: "Owner Dependency",
    body: "The operation appears to depend heavily on the owner, or on a small number of people, to remember how work moves.",
    review: "Operational visibility",
    weight: (a) =>
      signals(
        many(a, "operational_pain_points").includes("Too much owner involvement"),
        many(a, "operational_pain_points").includes("Processes living in people's heads"),
        one(a, "follow_up_process") === "Mostly from memory / inbox",
      ),
  },
  {
    id: "visibility-gaps",
    title: "Visibility Gaps",
    body: "Important pipeline or workflow information may not be easy to see without checking several systems.",
    review: "Operational visibility",
    weight: (a) =>
      signals(
        many(a, "operational_pain_points").includes("Poor pipeline visibility"),
        many(a, "operational_pain_points").includes("Difficulty knowing what needs attention next"),
        many(a, "communication_channels").includes("Multiple places depending on the person"),
        many(a, "communication_channels").length >= 4,
      ),
  },
  {
    id: "repetitive-manual-work",
    title: "Repetitive Manual Work",
    body: "Repeatable operating tasks still require significant manual coordination.",
    review: "Repeatable operating work",
    weight: (a) =>
      signals(
        many(a, "operational_pain_points").includes("Repetitive administrative work"),
        many(a, "operational_pain_points").includes("Re-entering information"),
        one(a, "manual_transfer_frequency") === "Constantly",
      ),
  },
];

/**
 * The areas the answers actually point at, strongest first, capped at three.
 * An operation that reports little friction gets a short list, not a padded
 * one: naming a problem the answers do not describe would be a worse result
 * than naming none.
 */
export function assessmentFindings(answers: Answers): readonly ResultCategory[] {
  const found: Finding[] = categories
    .map(({ weight, ...category }) => ({ ...category, weight: weight(answers) }))
    .filter((category) => category.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  return found.slice(0, 3).map((finding) => ({
    id: finding.id,
    title: finding.title,
    body: finding.body,
    review: finding.review,
  }));
}

/** A church finding, with the part of Genesis Ministry that speaks to it. */
export type ChurchFinding = ResultCategory & { fit: string };

/*
 * What a church's answers point at. Each "fit" line names only what Genesis
 * Ministry actually includes (see lib/ministryPage.ts), and which plan it
 * comes with where that matters. Nothing here promises an outcome.
 */
const churchCategories: readonly (ChurchFinding & { weight: (answers: Answers) => number })[] = [
  {
    id: "guest-follow-up",
    title: "Guest Follow Up",
    body: "First time guests may not hear from anyone in time, because follow up depends on someone noticing and remembering.",
    fit: "From the Shepherd plan, every guest lands in one guest pipeline, and the Today view shows your team who to welcome next.",
    review: "Guests and follow up",
    weight: (a) =>
      signals(
        ["A volunteer team, when they can", "It depends on who met them", "It often does not happen"].includes(
          one(a, "guest_follow_up"),
        ),
        ["After more than a week", "Often not at all", "We are not sure"].includes(one(a, "follow_up_speed")),
        one(a, "guest_details") === "We often do not get them",
        many(a, "church_pain_points").includes("Guests slip away after one visit"),
      ),
  },
  {
    id: "care-scattered",
    title: "Care Requests Scattered",
    body: "Prayer and care requests reach your pastors in more than one way, so it can be hard to see who is waiting and who has been cared for.",
    fit: "From the Shepherd plan, requests arrive in one care inbox, and prayer is seen only by your pastors and the prayer team you name.",
    review: "Prayer and care requests",
    weight: (a) =>
      signals(
        ["Email or text to a pastor", "Paper cards", "Word of mouth"].includes(one(a, "care_requests")),
        one(a, "care_requests") === "Several places, depending on the person",
        many(a, "church_pain_points").includes("Prayer requests land in too many places"),
        many(a, "church_pain_points").includes("Knowing who needs care next"),
      ),
  },
  {
    id: "first-impression",
    title: "The First Visit Starts Online",
    body: "Guests look you up before they come. A site that is hard to use on a phone, or questions that wait for the office, can cost a first visit.",
    fit: "Every plan includes a website built for the phone first, and Hope, which answers visitors from the facts your church approves.",
    review: "Website and first questions",
    weight: (a) =>
      signals(
        many(a, "church_pain_points").includes("Our website is hard to use on a phone"),
        many(a, "church_pain_points").includes("The office answers the same questions all week"),
      ),
  },
  {
    id: "few-hands",
    title: "A Few People Carry It",
    body: "Welcome and follow up appear to rest on one or two people, so a busy week or a sick day means people wait.",
    fit: "From the Shepherd plan, Genesis AI drafts welcome and follow up notes for your team, and none goes out until a person approves it.",
    review: "Who carries follow up",
    weight: (a) =>
      signals(
        many(a, "church_pain_points").includes("Follow up depends on one person"),
        one(a, "guest_follow_up") === "A pastor handles it personally",
        one(a, "church_staff") === "Just the pastor",
      ),
  },
  {
    id: "tools-apart",
    title: "Tools That Do Not Talk",
    body: "Church information sits in several tools, so people retype details or chase them between systems.",
    fit: "Genesis Ministry does not replace tools like Planning Center or Subsplash. Your website and Hope send people to them, and the welcome and care sit beside them.",
    review: "Church tools",
    weight: (a) =>
      signals(
        many(a, "church_pain_points").includes("Our tools do not talk to each other"),
        many(a, "church_tools").filter((tool) => !["None yet", "Other"].includes(tool)).length >= 3,
      ),
  },
  {
    id: "word-out",
    title: "Getting the Word Out",
    body: "Sharing what is happening each week takes more time than it should.",
    fit: "Every plan includes a social marketing plan: a weekly rhythm, a 30 day calendar and sample captions.",
    review: "Weekly communication",
    weight: (a) => signals(many(a, "church_pain_points").includes("Getting the word out each week")),
  },
];

/** A church's findings, strongest first, capped at three, never padded. */
export function churchFindings(answers: Answers): readonly ChurchFinding[] {
  return churchCategories
    .map(({ weight, ...category }) => ({ ...category, weight: weight(answers) }))
    .filter((category) => category.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map(({ id, title, body, fit, review }) => ({ id, title, body, fit, review }));
}

/** The findings for the path this visitor took. */
export function findingsFor(answers: Answers): readonly (ResultCategory & { fit?: string })[] {
  return answers.persona === CHURCH_PERSONA ? churchFindings(answers) : assessmentFindings(answers);
}

/** The distinct areas a review would look at, in the order they were found. */
export function reviewAreas(findings: readonly ResultCategory[]): readonly string[] {
  return [...new Set(findings.map((finding) => finding.review))];
}

/* ── the words on the page ───────────────────────────────────────────── */

export const assessmentCopy = {
  eyebrow: "Free Genesis Infrastructure Assessment",
  headline: "See where your operation is carrying unnecessary work.",
  summary: [
    "Answer a few questions about how leads, deals, communication, documents, and handoffs move through your business.",
    "Genesis will identify where your operation may be relying too heavily on manual coordination, disconnected systems, or people remembering what happens next.",
  ],
  cta: "Assess My Business",
  note: "No purchase required.",
  /** The eighth step. */
  contact: {
    heading: "Where should we send your assessment?",
    submit: "Show My Assessment",
    consent: "I'd like Genesis to review my results with me.",
  },
  results: {
    eyebrow: "Genesis Infrastructure Snapshot",
    intro:
      "Based on your answers, these are the areas where your operation appears to be carrying the most manual coordination.",
    /** Shown when the answers describe an operation that is already connected. */
    clear:
      "Your answers do not point strongly at any one area. That usually means the operation is holding together well today, and the useful conversation is about what happens as volume grows.",
    caveat:
      "This is a directional snapshot, not a finalized Genesis architecture.",
    ctaHeadline: "Want us to map what should change?",
    ctaBody:
      "A Genesis Infrastructure Review looks at your assessment with you, understands how the work actually moves today, and identifies where Genesis could create the most useful operating leverage.",
    ctaPrimary: "Book My Infrastructure Review",
    /* A church's results, in a church's words. */
    churchEyebrow: "Your Church Snapshot",
    churchHeadline: "Here is what we heard about your church.",
    churchIntro:
      "Based on your answers, these are the places where guests and care may be depending on someone remembering.",
    churchClear:
      "Your answers do not point strongly at any one gap. That usually means guests and care are in good hands today, and the useful conversation is about what happens as your church grows.",
    churchFindingsTitle: "What your answers point to",
    churchCaveat:
      "This is a first look from your answers, not a plan for your church. A call is where we listen properly.",
    /** Shown when weekend attendance is outside the size Genesis Ministry is built for. */
    churchSizeNote:
      "Genesis Ministry is built for churches of about 100 to 1,000 people. On a call we can talk honestly about whether it fits yours today.",
    /* For a church, the band books the Ministry call instead of the business review. */
    churchCtaHeadline: "Talk with us about your church.",
    churchCtaBody:
      "A short call to hear how guests and care requests reach your church today, and which Genesis Ministry plan fits. No commitment.",
  },
} as const;
