/*
 * The free Genesis Assessment.
 *
 * It asks how work actually moves through an operation, then names where that
 * operation appears to be carrying manual coordination. It is deliberately
 * not a Genesis architecture: the assessment says where the friction seems to
 * be, the review says what should change, and the engagement builds it.
 * Every finding here is qualitative and hedged, because there is no
 * measurement behind a questionnaire that would justify a number.
 */

import { CRM_QUESTION, crmOptions } from "./crm.ts";
import { editions, ministryEdition } from "./editions.ts";
import { editionLevels, pricingPathForPersona } from "./editionPlans.ts";
import { managedPlans } from "./offers.ts";
import { ministryContact, ministryHero, ministryLevels } from "./ministryPage.ts";
import {
  CHURCH_PERSONA,
  LENDER_PERSONA,
  REAL_ESTATE_TEAM_PERSONA,
  SERVICE_PERSONA,
  personaEdition,
  personas,
  type PersonaEdition,
} from "./personas.ts";

export { CHURCH_PERSONA } from "./personas.ts";

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
    eyebrow: "Recommended for your church",
    name: ministryEdition.name,
    body: ministryEdition.body,
    points: ministryEdition.points,
    plans: ministryLevels.levels.map((plan) => `${plan.name}, ${plan.priceDisplay} a month`),
    enterprise: ministryLevels.enterprise.line,
    stepNote:
      "Genesis Ministry is built for churches of about 100 to 1,000 people. The next questions are about guests and care at your church, and your results show the plan that fits.",
    page: { label: "See Genesis Ministry", href: ministryEdition.href },
    plansLink: { label: "See the Plans", href: `${ministryEdition.href}#levels` },
    call: { label: ministryHero.primary.label, href: ministryHero.primary.href },
  };
}

export type Choice = { value: string; label: string };

export type Question =
  | { id: string; kind: "single"; label: string; help?: string; options: readonly Choice[] }
  | {
      id: string;
      kind: "multi";
      label: string;
      help?: string;
      options: readonly Choice[];
      /** Choices that stand alone, such as "None yet": picking one clears the rest, and picking another clears it. */
      exclusive?: readonly string[];
    }
  | { id: string; kind: "text"; label: string; help?: string; placeholder?: string };

export type Step = {
  id: string;
  heading: string;
  questions: readonly Question[];
};

const choices = (...labels: string[]): readonly Choice[] =>
  labels.map((label) => ({ value: label, label }));

/*
 * Team sizes break where the Levels do: Level 01 is 1 user, Level 02 up to 5,
 * Level 03 up to 25, and more than 25 is Genesis Enterprise.
 */
export const TEAM_SIZES = ["Just me", "2 to 5", "6 to 25", "26 to 50", "More than 50"] as const;

/** The persona question, shared by both paths, so a visitor can still change it on step one. */
export const personaQuestion: Question = {
  id: "persona",
  kind: "single",
  label: "Which best describes you?",
  options: choices(...personas),
};

/*
 * The CRM answer still feeds the Needs GHL tag (lib/crm.ts), so its values
 * stay the CRM labels. Only the words a visitor reads say more, and they
 * name no integration Genesis does not have.
 */
const crmChoices: readonly Choice[] = crmOptions.map((option) => ({
  value: option.label,
  label:
    option.value === "other"
      ? "Another CRM, such as Salesforce, HubSpot or a field service or mortgage CRM"
      : option.value === "none"
        ? "None yet"
        : option.label,
}));

/** Steps 1 to 7. The eighth step asks who to follow up with, and is its own form. */
export const assessmentSteps: readonly Step[] = [
  {
    id: "business",
    heading: "First, tell us about your business.",
    questions: [
      personaQuestion,
      {
        id: "team_size",
        kind: "single",
        label: "How many people work in the business?",
        options: choices(...TEAM_SIZES),
      },
    ],
  },
  {
    id: "leads",
    heading: "How does new business come in?",
    questions: [
      {
        id: "lead_sources",
        kind: "multi",
        label: "Where do new leads come from?",
        options: choices(
          "Website",
          "Paid advertising",
          "Referrals",
          "Portal or marketplace leads",
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
        label: "How often does a new lead get a reply without anyone chasing it?",
        options: choices("Almost always", "Usually", "Sometimes", "Rarely", "Only when someone notices"),
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
        label: "Which systems does the business use today?",
        options: choices(
          "CRM",
          "Email",
          "Calendar",
          "Text or SMS",
          "Phone system",
          "Cloud storage",
          "Microsoft 365",
          "Google Workspace",
          "Transaction management software",
          "Loan origination system (Encompass, Arive and others)",
          "Field service software (ServiceTitan, Housecall Pro, Jobber)",
          "QuickBooks",
          "Spreadsheets",
          "Project management",
          "Other",
        ),
      },
      {
        id: "crm",
        kind: "single",
        label: CRM_QUESTION,
        options: crmChoices,
      },
      {
        id: "manual_transfer_frequency",
        kind: "single",
        label: "How often does someone copy information between these systems?",
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
        label: "How does follow up happen today?",
        options: choices(
          "Mostly automated",
          "A set process with manual steps",
          "CRM reminders",
          "Each person manages their own",
          "Mostly from memory or the inbox",
          "It varies from lead to lead",
        ),
      },
      {
        id: "communication_channels",
        kind: "multi",
        label: "Where do important conversations happen?",
        options: choices(
          "Email",
          "Text",
          "Phone",
          "CRM",
          "Teams or Slack",
          "Personal inboxes",
          "Different places for different people",
        ),
      },
    ],
  },
  {
    id: "deals",
    heading: "What happens once work is under way?",
    questions: [
      {
        id: "document_storage",
        kind: "single",
        label: "Where do customer, job or deal documents live?",
        options: choices(
          "One organized system",
          "CRM",
          "Cloud drive",
          "Email",
          "Shared folders",
          "Several places",
          "Depends on the person",
        ),
      },
      {
        id: "handoff_quality",
        kind: "single",
        label: "When work changes hands, does the next person have the context?",
        options: choices("Yes, every time", "Usually", "Sometimes", "Rarely", "They have to ask someone"),
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
        label: "Which of these sound familiar?",
        options: choices(
          "Missed or after hours calls",
          "Leads slipping through",
          "Inconsistent follow up",
          "Too many systems",
          "Typing the same information twice",
          "Documents hard to find",
          "Hard to see the pipeline",
          "Team handoffs",
          "Too much rests on the owner",
          "Repetitive admin work",
          "Conversations scattered across tools",
          "Processes living in people's heads",
          "Knowing what needs attention next",
          "Other",
        ),
      },
      {
        id: "growth_breakpoint",
        kind: "text",
        label: "If volume doubled next month, what would break first?",
        placeholder: "The part of the business you would worry about…",
      },
    ],
  },
  {
    id: "outcomes",
    heading: "What would you most like to work better?",
    questions: [
      {
        id: "desired_outcomes",
        kind: "multi",
        label: "Which of these would help most?",
        options: choices(
          "Answer every call, even after hours",
          "Reply to every lead quickly",
          "Automate follow up",
          "Connect the systems we have",
          "Get more from our CRM",
          "Organize customer, job and deal information",
          "Smoother team handoffs",
          "Automate document requests",
          "Find information faster",
          "Less repetitive admin",
          "See the whole pipeline",
          "Use AI across the business",
          "Not sure yet",
        ),
        exclusive: ["Not sure yet"],
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
export const churchSteps: readonly Step[] = [
  {
    id: "church-start",
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
        exclusive: ["None yet"],
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
        /* The sizes the church consultation form asks, so a church answers once, one way. */
        options: choices(...ministryContact.form.staffSizes),
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
  /** The part of Genesis that speaks to it, named only when it exists. */
  fit?: string;
};

/*
 * The words a business's findings use, by the edition its persona belongs
 * to: a lender hears about borrowers and files, a trade about jobs and
 * quotes, real estate about buyers, sellers and deals. The logic behind each
 * finding is the same for everyone; only the nouns change.
 */
type Nouns = { work: string; customers: string; busy: string };

const NOUNS: Record<PersonaEdition | "any", Nouns> = {
  lending: { work: "borrower files", customers: "borrowers", busy: "while you are with another borrower" },
  real_estate: { work: "deals and showings", customers: "buyers and sellers", busy: "while you are at a showing" },
  business: { work: "jobs and quotes", customers: "customers", busy: "during a job" },
  any: { work: "jobs, files or deals", customers: "customers", busy: "while you are busy" },
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/*
 * Each category and the answers that point at it. A category only appears
 * when the answers actually carry a signal for it: nothing is shown to fill
 * a quota, and nothing is scored into a percentage it could not support.
 *
 * Each fit line names only what that edition actually lists (lib/editions.ts
 * and the Level bullets in lib/editionPlans.ts), with the Level where it
 * matters. Where an edition lists nothing for a finding, there is no fit line.
 */
type BusinessCategory = {
  id: string;
  title: string;
  review: string;
  body: (nouns: Nouns) => string;
  fit: Partial<Record<PersonaEdition, string>>;
  weight: (answers: Answers) => number;
};

const SLOW_REPLY = ["Sometimes", "Rarely", "Only when someone notices"];

const categories: readonly BusinessCategory[] = [
  {
    id: "missed-calls",
    title: "Calls go unanswered",
    review: "Calls and first response",
    body: (n) =>
      `Calls that come in ${n.busy} or after hours may reach no one, and a caller who reaches no one usually calls the next business.`,
    fit: {
      business: "Genesis Business starts with calls answered, on every Level.",
      lending: "Genesis Lending starts with an instant first reply to every borrower inquiry.",
      real_estate: "Genesis Real Estate Pros starts with same day lead response.",
    },
    weight: (a) =>
      signals(
        many(a, "operational_pain_points").includes("Missed or after hours calls"),
        many(a, "desired_outcomes").includes("Answer every call, even after hours"),
        many(a, "lead_sources").includes("Phone") && SLOW_REPLY.includes(one(a, "lead_response")),
      ),
  },
  {
    id: "follow-up-dependency",
    title: "Follow up depends on memory",
    review: "Lead intake and follow up",
    body: (n) => `Next steps with ${n.customers} still depend on someone noticing, remembering or starting them by hand.`,
    fit: {
      business: "Quotes followed up and appointments confirmed, on every Level.",
      lending: "Level 02 adds document follow up, and Level 03 adds AI follow up that keeps every borrower conversation moving.",
      real_estate: "Every Level includes a guided first touch and follow up.",
    },
    weight: (a) =>
      signals(
        ["Mostly from memory or the inbox", "Each person manages their own"].includes(one(a, "follow_up_process")),
        one(a, "follow_up_process") === "It varies from lead to lead",
        SLOW_REPLY.includes(one(a, "lead_response")),
        many(a, "operational_pain_points").includes("Inconsistent follow up"),
        many(a, "operational_pain_points").includes("Leads slipping through"),
      ),
  },
  {
    id: "system-fragmentation",
    title: "Your systems do not connect",
    review: "Systems and communication",
    body: (n) => `Information about ${n.work} is spread across systems, so people move or reconcile it by hand.`,
    fit: {
      business: "Level 03 puts Genesis to work across your connected systems.",
    },
    weight: (a) =>
      signals(
        many(a, "systems_used").length >= 5,
        many(a, "systems_used").length >= 8,
        ["Every day", "Constantly"].includes(one(a, "manual_transfer_frequency")),
        many(a, "operational_pain_points").includes("Too many systems"),
        many(a, "operational_pain_points").includes("Conversations scattered across tools"),
      ),
  },
  {
    id: "handoff-friction",
    title: "Handoffs lose context",
    review: "Team handoffs",
    body: (n) => `${capitalize(n.work)} can change hands without everything the next person needs.`,
    fit: {
      business: "Level 02 adds team roles and routing rules.",
      lending: "From Level 02, every borrower inquiry has a clear owner and a clear next step.",
      real_estate: "Level 02 adds team roles and routing rules.",
    },
    weight: (a) =>
      signals(
        ["Sometimes", "Rarely"].includes(one(a, "handoff_quality")),
        one(a, "handoff_quality") === "They have to ask someone",
        many(a, "operational_pain_points").includes("Team handoffs"),
      ),
  },
  {
    id: "document-friction",
    title: "Documents are hard to find",
    review: "Documents",
    body: (n) =>
      n === NOUNS.lending
        ? "Document requests and borrower files may take extra searching, chasing or sorting by hand."
        : `Documents for ${n.work} may take extra searching, requesting or sorting by hand.`,
    fit: {
      lending: "Level 02 adds document follow up.",
    },
    weight: (a) =>
      signals(
        ["Several places", "Depends on the person"].includes(one(a, "document_storage")),
        ["Email", "Shared folders"].includes(one(a, "document_storage")),
        many(a, "operational_pain_points").includes("Documents hard to find"),
      ),
  },
  {
    id: "owner-dependency",
    title: "The owner carries it",
    review: "Who carries the work",
    body: (n) => `The business appears to depend on the owner, or a few people, to remember how ${n.work} move.`,
    fit: {
      business: "Calls answered, quotes followed up and appointments confirmed, on every Level, so less waits on the owner.",
      lending: "Level 03 adds file status in one view.",
      real_estate: "Level 03 adds a live deal board.",
    },
    weight: (a) =>
      signals(
        many(a, "operational_pain_points").includes("Too much rests on the owner"),
        many(a, "operational_pain_points").includes("Processes living in people's heads"),
        one(a, "follow_up_process") === "Mostly from memory or the inbox",
      ),
  },
  {
    id: "visibility-gaps",
    title: "It is hard to see what is next",
    review: "Seeing what is next",
    body: (n) => `It may be hard to see which ${n.work} need attention next without checking several systems.`,
    fit: {
      lending: "Level 03 adds file status in one view.",
      real_estate: "Level 03 adds a live deal board.",
    },
    weight: (a) =>
      signals(
        many(a, "operational_pain_points").includes("Hard to see the pipeline"),
        many(a, "operational_pain_points").includes("Knowing what needs attention next"),
        many(a, "communication_channels").includes("Different places for different people"),
        many(a, "communication_channels").length >= 4,
      ),
  },
  {
    id: "repetitive-manual-work",
    title: "Repetitive work takes too long",
    review: "Repeatable work",
    body: (n) => `Repeatable tasks around ${n.work} still take a lot of manual coordination.`,
    fit: {
      business: "Level 02 adds automation across workflows and handoffs.",
    },
    weight: (a) =>
      signals(
        many(a, "operational_pain_points").includes("Repetitive admin work"),
        many(a, "operational_pain_points").includes("Typing the same information twice"),
        one(a, "manual_transfer_frequency") === "Constantly",
      ),
  },
];

/**
 * The areas the answers actually point at, strongest first, capped at three,
 * in the words of the visitor's own line of work. An operation that reports
 * little friction gets a short list, not a padded one: naming a problem the
 * answers do not describe would be a worse result than naming none.
 */
export function assessmentFindings(answers: Answers): readonly ResultCategory[] {
  const edition = personaEdition(one(answers, "persona") || undefined);
  const nouns = NOUNS[edition ?? "any"];
  return categories
    .map((category) => ({ category, weight: category.weight(answers) }))
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map(({ category }) => {
      const fit = edition ? category.fit[edition] : undefined;
      return {
        id: category.id,
        title: category.title,
        body: category.body(nouns),
        review: category.review,
        ...(fit ? { fit } : {}),
      };
    });
}

export type MinistryPlanId = "care" | "shepherd" | "plus";

/** A church finding, with the part of Genesis Ministry that speaks to it. */
export type ChurchFinding = ResultCategory & {
  fit: string;
  /** The first Ministry plan that includes what the fit line names. */
  plan: MinistryPlanId;
};

/** Where a fit line's feature starts, said once beside it rather than at the start of every line. */
export function planLabel(plan: MinistryPlanId): string {
  return plan === "care" ? "In every plan" : plan === "shepherd" ? "In Shepherd and Plus" : "In Plus";
}

/*
 * What a church's answers point at. Each "fit" line names only what Genesis
 * Ministry actually includes (see lib/ministryPage.ts), and the plan it
 * comes with is shown beside it. Nothing here promises an outcome.
 */
const churchCategories: readonly (ChurchFinding & { weight: (answers: Answers) => number })[] = [
  {
    id: "guest-follow-up",
    title: "Guests can wait too long to hear from you",
    plan: "shepherd",
    body: "First time guests may not hear from anyone in time, because follow up depends on someone noticing and remembering.",
    fit: "Every guest lands in one guest pipeline, and the Today view shows your team who to welcome next.",
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
    title: "Care requests are scattered",
    plan: "shepherd",
    body: "Prayer and care requests reach your pastors in more than one way, so it can be hard to see who is waiting and who has been cared for.",
    fit: "Requests arrive in one care inbox, and prayer is seen only by your pastors and the prayer team you name.",
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
    title: "The first visit starts online",
    plan: "care",
    body: "Guests look you up before they come. A site that is hard to use on a phone, or questions that wait for the office, can cost a first visit.",
    fit: "A website built for the phone first, and Hope, which answers visitors from the facts your church approves.",
    review: "Website and first questions",
    weight: (a) =>
      signals(
        many(a, "church_pain_points").includes("Our website is hard to use on a phone"),
        many(a, "church_pain_points").includes("The office answers the same questions all week"),
      ),
  },
  {
    id: "few-hands",
    title: "A few people carry the welcome",
    plan: "shepherd",
    body: "Welcome and follow up appear to rest on one or two people, so a busy week or a sick day means people wait.",
    fit: "Genesis AI drafts welcome and follow up notes for your team, and none goes out until a person approves it.",
    review: "Who carries follow up",
    weight: (a) =>
      signals(
        many(a, "church_pain_points").includes("Follow up depends on one person"),
        one(a, "guest_follow_up") === "A pastor handles it personally",
        one(a, "church_staff") === ministryContact.form.staffSizes[0],
      ),
  },
  {
    id: "tools-apart",
    title: "Your tools do not share what they know",
    plan: "shepherd",
    body: "Church information sits in several tools, so people retype details or chase them between systems.",
    fit: "Every guest who fills in a card, a form or a chat with Hope lands in one guest pipeline, so nobody chases them across inboxes. Planning Center or Subsplash keep running giving and check in, and your website and Hope send people there.",
    review: "Church tools",
    weight: (a) =>
      signals(
        many(a, "church_pain_points").includes("Our tools do not talk to each other"),
        many(a, "church_tools").filter((tool) => !["None yet", "Other"].includes(tool)).length >= 3,
      ),
  },
  {
    id: "word-out",
    title: "Getting the word out takes too much time",
    plan: "care",
    body: "Sharing what is happening each week takes more time than it should.",
    fit: "A social marketing plan: a weekly rhythm, a 30 day calendar and sample captions.",
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
    .map(({ id, title, body, fit, review, plan }) => ({ id, title, body, fit, review, plan }));
}

/** The Ministry plan a church's answers point to, and why, for the results to suggest. */
export type SuggestedPlan = {
  id: MinistryPlanId;
  name: string;
  price: string;
  /** /contact?topic=ministry-<plan>#consultation-form, which opens with the plan and its price in the note. */
  href: string;
  reason: string;
  /** A plan the church may want later, said plainly, never as the suggestion. */
  later: string | null;
};

const PLAN_ORDER: readonly MinistryPlanId[] = ["care", "shepherd", "plus"];

/**
 * The plan to start with: the lowest plan that includes everything the
 * findings name. Plus is never pushed as the start; a larger staff that wants
 * to know who needs care next hears that Plus adds person pages and reports,
 * as a later step. No findings, no suggestion: a call decides it instead.
 */
export function suggestedMinistryPlan(answers: Answers, findings: readonly ChurchFinding[]): SuggestedPlan | null {
  if (!findings.length) return null;
  const id = findings.reduce<MinistryPlanId>(
    (best, finding) => (PLAN_ORDER.indexOf(finding.plan) > PLAN_ORDER.indexOf(best) ? finding.plan : best),
    "care",
  );
  const plan = ministryLevels.levels.find((level) => level.id === id)!;
  const largerStaff = (ministryContact.form.staffSizes.slice(2) as readonly string[]).includes(one(answers, "church_staff"));
  const wantsCareView = many(answers, "church_pain_points").includes("Knowing who needs care next");
  const reason =
    id === "shepherd"
      ? "The guest pipeline, the care inbox and drafts that wait for approval all start with Shepherd."
      : "The website and Hope are in every plan, so Care is a good place to start.";
  const later =
    id !== "plus" && largerStaff && wantsCareView
      ? "With a larger staff, you may want Plus later: it adds person pages and reports, so pastors can see who needs care next."
      : null;
  return { id, name: plan.name, price: plan.priceDisplay, href: plan.action.href, reason, later };
}

/** The findings for the path this visitor took. */
export function findingsFor(answers: Answers): readonly ResultCategory[] {
  return answers.persona === CHURCH_PERSONA ? churchFindings(answers) : assessmentFindings(answers);
}

/** The distinct areas a review would look at, in the order they were found. */
export function reviewAreas(findings: readonly ResultCategory[]): readonly string[] {
  return [...new Set(findings.map((finding) => finding.review))];
}

/*
 * A business visitor's results name the edition built for them too: Lending,
 * Real Estate Pros or Business, with its three Levels at the prices the
 * pricing pages print, the Level their team size fits, and the edition's own
 * disclaimer. The next step stays the review: assess first, then decide.
 */
export type SuggestedLevel = {
  /** "01", "02" or "03"; null when the team is larger than the Levels cover. */
  step: string | null;
  label: string;
  reason: string;
};

export type BusinessRecommendation = {
  edition: PersonaEdition;
  name: string;
  href: string;
  body: string;
  /** Each Level as "Level 01, $750 a month, plus $500 setup". */
  levels: readonly string[];
  disclaimer: string;
  pricingHref: string;
  /** The Level the team size fits, or Enterprise above 25 users; null without a team size. */
  suggested: SuggestedLevel | null;
};

const EDITION_HREF: Record<PersonaEdition, string> = {
  lending: "/lending",
  real_estate: "/real-estate",
  business: "/business",
};

/** Team sizes above the 25 users Level 03 covers: Genesis Enterprise. */
export const ENTERPRISE_TEAM_SIZES: readonly string[] = ["26 to 50", "More than 50"];

/**
 * The Level a team size fits, using the user limits the Levels print:
 * 1 user, up to 5 and up to 25. More than 25 users is Genesis Enterprise.
 */
export function suggestedLevel(edition: PersonaEdition, teamSize: string | undefined): SuggestedLevel | null {
  if (!teamSize) return null;
  if (ENTERPRISE_TEAM_SIZES.includes(teamSize)) {
    return {
      step: null,
      label: "Genesis Enterprise",
      reason: "More than 25 users is Genesis Enterprise: custom workflows and systems connected across locations, scoped with you on a call.",
    };
  }
  const index = TEAM_SIZES.indexOf(teamSize as (typeof TEAM_SIZES)[number]);
  if (index < 0) return null;
  const { plan } = editionLevels(edition)[Math.min(index, 2)];
  return {
    step: plan.step,
    label: `Level ${plan.step}, ${plan.priceDisplay} a month`,
    reason: `Level ${plan.step} covers ${plan.userLimit.toLowerCase()}, which fits a team of ${teamSize.toLowerCase()}.`,
  };
}

export function businessRecommendation(
  persona: string | undefined,
  teamSize: string | undefined,
): BusinessRecommendation | null {
  const key = personaEdition(persona);
  if (!key) return null;
  const href = EDITION_HREF[key];
  const edition = editions.find((candidate) => candidate.href === href)!;
  return {
    edition: key,
    name: edition.name,
    href: edition.href,
    body: edition.body,
    levels: managedPlans.map((plan) => `Level ${plan.step}, ${plan.priceDisplay} a month, ${plan.setupLine}`),
    disclaimer: edition.disclaimer,
    pricingHref: pricingPathForPersona(persona),
    suggested: suggestedLevel(key, teamSize),
  };
}

/**
 * The persona a link can open the assessment with: /assessment?for=church,
 * or ?persona=lending, real-estate or business from an edition page. Only
 * these values are read; anything else starts the assessment blank.
 */
const personaParams: Readonly<Record<string, string>> = {
  church: CHURCH_PERSONA,
  ministry: CHURCH_PERSONA,
  lending: LENDER_PERSONA,
  "real-estate": REAL_ESTATE_TEAM_PERSONA,
  business: SERVICE_PERSONA,
};

/** Reads ?for= or ?persona= from URLSearchParams or from a page's searchParams object. */
export function personaFromParams(
  params: URLSearchParams | Readonly<Record<string, string | string[] | undefined>>,
): string | undefined {
  const get = (name: string) => {
    if (params instanceof URLSearchParams) return params.get(name);
    const value = params[name];
    return typeof value === "string" ? value : null;
  };
  const key = get("for") ?? get("persona");
  return key && Object.hasOwn(personaParams, key) ? personaParams[key] : undefined;
}

/** Toggle one choice in a multi question, honouring the choices that stand alone. */
export function toggleChoice(
  question: { exclusive?: readonly string[] },
  selected: readonly string[],
  value: string,
): string[] {
  if (selected.includes(value)) return selected.filter((item) => item !== value);
  const alone = question.exclusive ?? [];
  if (alone.includes(value)) return [value];
  return [...selected.filter((item) => !alone.includes(item)), value];
}

/** The /contact topic a business visitor's results book, and the note it opens with. */
export const ASSESSMENT_REVIEW_TOPIC = "assessment-review";
export const assessmentReviewNote = "I took the Genesis assessment and would like to review my results. ";

/**
 * The few lines the contact form adds to its notes after an assessment, so
 * the call starts from what the visitor already told us. Built from the
 * answers and findings only: nothing typed into a free text box.
 */
export function assessmentSummary(answers: Answers, findings: readonly ResultCategory[]): string {
  const lines: string[] = [];
  const attendance = one(answers, "weekly_attendance");
  if (attendance) lines.push(`Weekend attendance: ${attendance}.`);
  const team = one(answers, "team_size");
  if (team) lines.push(`Team size: ${team}.`);
  if (findings.length) lines.push(`Assessment findings: ${findings.map((finding) => finding.title).join("; ")}.`);
  return lines.join(" ");
}

/* ── the words on the page ───────────────────────────────────────────── */

export const assessmentCopy = {
  eyebrow: "Free Genesis Assessment",
  headline: "See where your operation is carrying unnecessary work.",
  summary: [
    "Answer a few questions about how calls, leads, follow up and handoffs move today. We show where work depends on someone remembering.",
  ],
  /** The card's eyebrow: the one place the assessment's name is shown. */
  cardEyebrow: "Free Genesis Assessment",
  /** The same page, in a church's words, once a church picks its persona. */
  church: {
    eyebrow: "Free Church Assessment",
    headline: "See where guests and care may be slipping.",
    summary: [
      "Answer a few questions about how guests find you, how follow up happens and where care requests land. We show where it depends on someone remembering.",
    ],
  },
  /** The summary row when a link already said who is answering. */
  answeringFor: "Answering for",
  change: "Change",
  cta: "Assess My Business",
  note: "No purchase required.",
  /** The eighth step. */
  contact: {
    heading: "Who should we follow up with?",
    submit: "Show My Assessment",
    consent: "I'd like Genesis to review my results with me.",
  },
  results: {
    eyebrow: "Your Genesis Snapshot",
    headline: "Here is what we heard about your business.",
    /** The edition card's eyebrow on the business results. */
    editionEyebrow: "Recommended for your business",
    intro:
      "Below is the Genesis edition built for your line of work, and the places where your business appears to be carrying the most manual coordination.",
    /** Shown when the answers describe an operation that is already connected. */
    clear:
      "Your answers do not point strongly at any one area. That usually means the business is holding together well today, and the useful conversation is about what happens as volume grows.",
    /** The findings card, when nothing stood out. */
    nothing: "Nothing stood out strongly. A review can look at what changes as the business grows.",
    findingsTitle: "What your answers point to",
    caveat: "This is a directional snapshot, not a finished plan for your business.",
    suggestedLabel: "Fits what you told us",
    ctaHeadline: "Want us to map what should change?",
    ctaBody:
      "A free review looks at your answers with you, how the work actually moves today, and where Genesis could take the most work off your team.",
    ctaPrimary: "Book My Free Review",
    /* A church's results, in a church's words. */
    churchEyebrow: "Your Church Snapshot",
    churchHeadline: "Here is what we heard about your church.",
    churchIntro:
      "Below is the Genesis Ministry plan we would start with, and the places where guests and care may be depending on someone remembering.",
    churchClear:
      "Your answers do not point strongly at any one gap. That usually means guests and care are in good hands today, and the useful conversation is about what happens as your church grows.",
    /** The findings card, when nothing stood out. */
    churchNothing: "Nothing stood out strongly. A call can look at what changes as your church grows.",
    /** The plan card's eyebrow when the church is outside the size Ministry is built for. */
    churchOutsideEyebrow: "Built for churches of 100 to 1,000",
    churchSuggested: "Where we would start",
    received: "We have your answers.",
    /** Shown only when they ticked the box asking Genesis to review the results with them. */
    reviewRequested: "You asked us to review your results with you, so someone from Genesis will reach out to set a time.",
    /** Replaces the call buttons once they have already asked us to reach out. */
    onTheList: "You are on our list. Want to tell us more before the call?",
    addDetails: "Add Details for the Call",
    print: "Print or save these results",
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
