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
        label: "Which best describes your business?",
        options: choices(
          "Agent / Solo Operator",
          "Real Estate Team",
          "Brokerage",
          "Lender",
          "Investor / Acquisitions",
          "Developer",
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

/** Every question a step asks, flattened, in order. */
export const assessmentQuestions: readonly Question[] = assessmentSteps.flatMap(
  (step) => step.questions,
);

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
  },
} as const;
