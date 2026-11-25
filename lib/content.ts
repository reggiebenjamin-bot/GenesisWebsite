import { allEditions } from "./editions.ts";
import { levelAiEmployeesSummary, type OfferPathId } from "./offers.ts";

/**
 * The answer to "Are usage and other software costs included?". The exact
 * usage line (USAGE_BILLING_LINE) is printed once beside the prices, so this
 * points to it in other words rather than printing it a second time.
 */
export const USAGE_QUESTION = "Are usage and other software costs included?";
const USAGE_AND_SOFTWARE_ANSWER =
  "Plan prices cover Genesis. Usage is on top of the plan and goes on your own card, as the note beside the prices says. Software you already pay for, such as your CRM or Microsoft 365, stays on your own accounts.";

/** One short line per edition under its name in the Editions dropdown. */

export type NavItem = { label: string; href: string };

export type NavLink = NavItem & { description?: string };

/** A navigation entry that stands for several destinations: a dropdown. */
export type NavGroup = {
  label: string;
  items: NavLink[];
  feature?: {
    eyebrow: string;
    title: string;
    description: string;
    href: string;
    action: string;
  };
};

export type NavEntry = NavLink | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

/** Every destination in the navigation, flattened, in display order. */
export function navigationLinks(entries: NavEntry[]): NavLink[] {
  return entries.flatMap((entry) => (isNavGroup(entry) ? entry.items : [entry]));
}

/** The first link for each destination, in order: a list that repeats an href renders it once. */
export function uniqueByHref<T extends NavItem>(links: readonly T[]): T[] {
  const seen = new Set<string>();
  return links.filter((link) => !seen.has(link.href) && Boolean(seen.add(link.href)));
}

export type SystemLayer = {
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  details: string[];
};

export type ProofItem = {
  slug: string;
  client: string;
  challenge: string;
  implementation: string;
  outcome: string;
  attribution?: string;
};

export const contact = {
  email: "info@geai.us",
  phoneDisplay: "+1 682 647 5934",
  phoneHref: "+16826475934",
  linkedin: "https://www.linkedin.com/company/genesis-ai-studio",
  facebook: "https://www.facebook.com/profile.php?id=61586903450734",
} as const;

/**
 * Book a Call, on /contact and its success state: the reply promise, and the
 * calendar where a visitor can choose a time without waiting for the reply.
 */
export const bookACall = {
  replyPromise: "We reply within one business day.",
  pickTime: {
    label: "Pick a Time",
    lead: "Or pick a time on the calendar now.",
    href: "https://outlook.office.com/bookwithme/user/9aad5fd73bf342e9a8b09822b37992b7@powerlandgroup.com?anonymous",
  },
} as const;

/**
 * Entries with more than one destination are groups, and render as dropdowns.
 * The two path pages (/mini and /solutions) are reached through the Agent /
 * Custom Infrastructure toggle in the navigation bar, not from this list.
 * The Editions dropdown lists all five Genesis OS editions, Ministry once,
 * and features the assessment, which points each visitor to the one that fits.
 */
export const navigation: NavEntry[] = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "AI Employees", href: "/ai-employees" },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Editions",
    items: allEditions.map((edition) => ({
      label: edition.name.replace(/^Genesis /, ""),
      href: edition.href,
      /* The same "For ..." line the edition cards and the edition hero eyebrows read. */
      description: `${edition.audience}.`,
    })),
    /* The shared next step for every edition: the assessment points to the one that fits. */
    feature: {
      eyebrow: "Not sure which edition?",
      title: "Take the free assessment",
      description: "Answer a few questions and we will point you to the edition that fits, business or church.",
      href: "/assessment",
      action: "Start the assessment",
    },
  },
  {
    label: "Company",
    items: [
      { label: "About", href: "/about", description: "Our principles." },
      { label: "Results", href: "/results", description: "The proof standard." },
      { label: "Contact", href: "/contact", description: "Book a call." },
    ],
  },
];

export const systemLayers: SystemLayer[] = [
  {
    number: "01",
    title: "Operational Foundation",
    shortTitle: "Foundation",
    description: "Microsoft 365, business email, identity, documents, permissions, and approved integrations configured as dependable business infrastructure.",
    details: ["Business email on your domain", "Identity and permission management", "Calendars, documents, and Teams", "Connections to the tools you keep"],
  },
  {
    number: "02",
    title: "Applied AI & Data Synthesis",
    shortTitle: "Intelligence",
    description: "Genesis turns scattered operational signals into usable context and applies AI inside the workflows where interpretation, coordination, generation, or follow-up can move the work forward.",
    details: ["Cross-system context synthesis", "Follow-up and routing workflows", "Document and information handling", "Human approval where judgment matters"],
  },
  {
    number: "03",
    title: "Genesis CRM — Optional",
    shortTitle: "Optional CRM",
    description: "A system of record for pipeline, campaigns, booking, and structured follow-up when the operation needs one. Genesis does not force a CRM replacement simply to make the rest of the system work.",
    details: ["No forced rip-and-replace", "Pipelines and opportunities", "Campaigns and booking", "Structured follow-up"],
  },
  {
    number: "04",
    title: "Fully Managed — Ongoing",
    shortTitle: "Managed",
    description: "When included in the engagement, Genesis monitors, supports, maintains, and improves the agreed platform so managing the infrastructure does not become the operator’s next job.",
    details: ["Monitoring and support", "System maintenance", "Workflow refinement", "Continuous improvement"],
  },
];

/**
 * The managed engagement. `summary` is the short label the engagement path
 * uses; `description` is the homepage's account of each step, and `method`
 * the How It Works page's.
 */
export const processSteps = [
  {
    number: "01",
    title: "Consultation",
    summary: "Free fit conversation",
    description:
      "A free call about how your calls, leads and follow up work today, and where things slip.",
    method:
      "We learn how your business runs and where work still depends on someone remembering to do it.",
  },
  {
    number: "02",
    title: "Scoping",
    summary: "Recommendation and next step",
    description:
      "We agree on what Genesis will do: which tools stay, what connects, and which jobs the AI employees take on.",
    method:
      "We agree on what stays, what connects, what the AI employees handle and what stays with your people.",
  },
  {
    number: "03",
    title: "Implementation",
    summary: "The system build",
    description:
      "We set up Genesis inside the tools you already use and train the AI employees on how you work.",
    method:
      "We connect your phone, inbox, calendar and CRM, and set up the AI employees for your business.",
  },
  {
    number: "04",
    title: "Launch",
    summary: "Live in the operation",
    description:
      "Your team starts using Genesis every day, and we check that calls, replies and follow up all happen as planned.",
    method:
      "Your team starts using it, and we check every call, reply and follow up lands where it should.",
  },
  {
    number: "05",
    title: "Managed Platform",
    summary: "Support and improve when included",
    description:
      "When your plan includes it, we keep Genesis running and improve it as your business grows.",
    method:
      "When your plan includes it, we keep Genesis running and adjust it as your business changes.",
  },
] as const;

export const audiences = [
  {
    title: "Agents & Small Teams",
    outcome: "Stop carrying the entire follow-up system in your head.",
    body: [
      "Connect the work around leads, follow-up, communication, CRM, active deals, and documents so producing more business does not require the owner to manually remember every next step.",
      "Genesis is not there just to store another contact. It is there to help the work around that contact move.",
    ],
  },
  {
    title: "Brokerages",
    outcome: "Stop making the broker-owner the integration layer.",
    body: [
      "Connect lead routing, producer follow-up, pipeline visibility, communication, documents, team handoffs, and operations so information can move through the brokerage without every exception eventually landing on one person.",
      "The objective is not more dashboards. It is clearer ownership, better context, and fewer operational gaps between systems and people.",
    ],
  },
  {
    title: "Lenders",
    outcome: "Keep borrower, property, document, and pipeline context connected.",
    body: [
      "Bring borrower information, property information, documents, communication, conditions, follow-up, pipeline activity, and internal handoffs into a clearer operational flow.",
      "Genesis can help organize context, surface missing information, support workflow execution, and prepare people for decisions. Underwriting, credit decisions, approvals, and other regulated judgments remain with the responsible humans and institutions.",
    ],
  },
  {
    title: "Investors, Acquisitions & Development",
    outcome: "Keep the opportunity connected from intake to decision.",
    body: [
      "Structure opportunity intake, diligence, deal information, documents, vendor communication, financing context, pipeline activity, and decision support around the way the team actually evaluates and advances projects.",
      "The goal is fewer gaps between discovering an opportunity and having the information required to act on it.",
    ],
  },
] as const;

export type Faq = {
  question: string;
  answer: string;
  /** The homepage paths that ask it. */
  paths: readonly OfferPathId[];
};

/** The tools' own questions: the tools page, each tool's page, and the homepage's Agent path. */
export const toolFaqs = [
  {
    question: "Are Genesis Tools the same as a Managed AI plan?",
    answer:
      "No. Tools help you complete specific work yourself. Managed AI integrates Genesis into how the broader business operates.",
  },
  {
    question: "Does Deal Architect invent missing deal information?",
    answer:
      "No. Information is identified as known, user provided, calculated, estimated, or missing. Missing information remains missing rather than being silently fabricated.",
  },
  {
    question: "Does Deal Packager invent evidence or guarantee a response?",
    answer:
      "No. Deal Packager organizes the facts, evidence, and assumptions you provide. It does not invent support, promise approval, or make a lender, partner, investor, or buyer's decision.",
  },
  {
    question: "Does Capital Advisor provide live lender terms or loan approval?",
    answer:
      "No. Capital Advisor reviews the assumptions you provide and helps prepare a capital request. It does not quote live rates, promise terms, approve financing, or replace a licensed financial professional.",
  },
] as const;

/** Homepage questions, by the path that asks them. */
export const faqs: readonly Faq[] = [
  {
    question: "What is Genesis?",
    answer:
      "Genesis gives service businesses, lenders and real estate teams AI employees that answer calls, reply to every lead, follow up and keep your pipeline moving, inside the tools you already use.",
    paths: ["agent", "custom-infrastructure"],
  },
  {
    question: "Is Genesis another CRM?",
    answer:
      "No. Genesis can work with the CRM you already have, and Genesis CRM is optional. The job is making sure every call, lead and next step reaches the right person on time.",
    paths: ["custom-infrastructure"],
  },
  {
    question: "Do we have to replace our current systems?",
    answer:
      "Usually not. We look at what you use today first and keep what works. Genesis connects your tools rather than replacing them for the sake of it.",
    paths: ["custom-infrastructure"],
  },
  {
    question: "Is Genesis mainly a collection of AI agents?",
    answer:
      "No. The AI employees are one part. The value is that they work inside your phone, inbox, calendar and CRM, with clear jobs and a person who decides what matters.",
    paths: ["custom-infrastructure"],
  },
  {
    question: "Does Genesis replace human judgment?",
    answer:
      "No. Genesis handles the routine work and brings you what needs a decision. Your people still make the calls that need judgment, a license or professional responsibility.",
    paths: ["custom-infrastructure"],
  },
  {
    question: USAGE_QUESTION,
    answer: USAGE_AND_SOFTWARE_ANSWER,
    paths: ["custom-infrastructure"],
  },
];

/** The pricing page's questions. */
export const pricingFaqs = [
  {
    question: "What changes between the Levels?",
    /* The all-edition answer. Each edition page builds its own from its own Level bullets
       (levelsFaqAnswer in lib/editionPlans.ts). */
    answer:
      "How many people use Genesis, and how much it takes on. Level 01 is one user, Level 02 up to 5 users and Level 03 up to 25 users, and each Level adds to the one before. " +
      `${levelAiEmployeesSummary()} More than 25 users is Genesis Enterprise. Each edition page lists what its Levels include.`,
  },
  {
    question: USAGE_QUESTION,
    answer: USAGE_AND_SOFTWARE_ANSWER,
  },
  {
    question: "How do I know which Level fits?",
    answer:
      "Take the free assessment: your results suggest a Level from how many people would use Genesis day to day. A short call then confirms it before anything is recommended in writing.",
  },
] as const;

export const proofItems: ProofItem[] = [];

export type ProductPillar = {
  figure: string;
  title: string;
  description: string;
};

/** The three pillars under the opening thesis, each carried by a FIG drawing. */
export const productPillars: ProductPillar[] = [
  {
    figure: "0.1",
    title: "A reusable product core",
    description:
      "Genesis is built on one platform, not a fresh pile of tooling per client. The core is what makes the work repeatable.",
  },
  {
    figure: "0.2",
    title: "Applied AI inside the work",
    description:
      "Intelligence sits in the workflows where files stall, not in a separate window somebody has to remember to open.",
  },
  {
    figure: "0.3",
    title: "Run as a managed service",
    description:
      "The system is monitored, maintained, and refined by Genesis, so keeping it useful never becomes the operator’s job.",
  },
];

export type Agent = {
  id: string;
  name: string;
  role: string;
  description: string;
  signals: string[];
};

/**
 * The four workflow mechanisms named in the Applied AI section. Wording is
 * held to what the site already claims: assistance with a person approving.
 */
export const agents: Agent[] = [
  {
    id: "follow-up",
    name: "Follow-up",
    role: "Keeps quiet files moving",
    description:
      "Drafts the next message on a file that has gone quiet, with the history and documents already attached. Nothing leaves without someone approving it.",
    signals: ["Last contact", "Open items", "Deal stage"],
  },
  {
    id: "documents",
    name: "Documents",
    role: "Files what arrives",
    description:
      "Reads incoming documents, files them against the right record, and flags what is still missing before the gap turns into a delay.",
    signals: ["Inbox", "Shared drives", "Record match"],
  },
  {
    id: "pipeline",
    name: "Pipeline",
    role: "Keeps the board honest",
    description:
      "Updates stage, owner, and next action from the activity already happening across email, calendar, and documents, instead of from memory.",
    signals: ["Activity", "Ownership", "Next action"],
  },
  {
    id: "briefs",
    name: "Decision briefs",
    role: "Prepares the conversation",
    description:
      "Assembles borrower, property, and conversation history into one brief before the call, with every claim linked back to its source.",
    signals: ["History", "Documents", "Source links"],
  },
];
