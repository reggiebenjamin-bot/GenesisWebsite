import { allEditions } from "./editions.ts";
import type { OfferPathId } from "./offers.ts";

/** One short line per edition under its name in the Editions dropdown. */
const editionNavNotes: Record<string, string> = {
  "/lending": "For mortgage lending teams.",
  "/real-estate": "For agents and brokerages.",
  "/business": "For contractors, HVAC, clinics.",
  "/enterprise": "For multi location operations.",
  "/ministry": "For churches.",
};

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
      description: editionNavNotes[edition.href],
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
      "A focused, no-cost conversation about how leads, deals, communication, documents, data, and handoffs move through the business today.",
    method:
      "Understand the operation, its priorities, and where work currently depends on manual memory, disconnected systems, or repeated coordination.",
  },
  {
    number: "02",
    title: "Scoping",
    summary: "Recommendation and next step",
    description:
      "Define the implementation boundary: what should stay, what needs to connect, where work is breaking down, and where automation or intelligence would be useful.",
    method:
      "Define what should remain, what needs to communicate, which workflows need structure, where automation is appropriate, and what stays with people.",
  },
  {
    number: "03",
    title: "Implementation",
    summary: "The system build",
    description:
      "Configure the agreed foundation, integrations, workflows, AI capabilities, and optional CRM around the operation.",
    method:
      "Configure the agreed operational foundation, integrations, workflows, AI capabilities, and optional CRM.",
  },
  {
    number: "04",
    title: "Launch",
    summary: "Live in the operation",
    description:
      "Put the platform into daily use, validate the workflow, and make sure the system is carrying the work it was designed to carry.",
    method:
      "Move the system into daily use, validate that information and actions are moving correctly, and support adoption through the agreed launch boundary.",
  },
  {
    number: "05",
    title: "Managed Platform",
    summary: "Support and improve when included",
    description:
      "When ongoing management is included, Genesis keeps the agreed infrastructure supported, current, and improving as the business changes.",
    method:
      "Where ongoing management is part of the engagement, Genesis supports and refines the system as business priorities, processes, and volume change.",
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
      "Genesis is AI infrastructure for service businesses, lenders and real estate teams. It connects business systems, workflows, communication, data, automation, and AI capabilities around the way the operation actually works.",
    paths: ["agent", "custom-infrastructure"],
  },
  {
    question: "Is Genesis another CRM?",
    answer:
      "No. CRM can be one part of the system, and Genesis CRM is optional. The broader job is connecting how work moves between communication, data, documents, workflows, deal activity, automation, and the people responsible for decisions.",
    paths: ["custom-infrastructure"],
  },
  {
    question: "Do we have to replace our current systems?",
    answer:
      "Not automatically. Genesis reviews the existing environment first and keeps useful systems where appropriate. The objective is a better-connected operation, not replacement for its own sake.",
    paths: ["custom-infrastructure"],
  },
  {
    question: "Is Genesis mainly a collection of AI agents?",
    answer:
      "No. AI agents are one capability inside Genesis. The larger value comes from how systems, data, context, workflows, automation, and human responsibilities are structured around them.",
    paths: ["custom-infrastructure"],
  },
  {
    question: "Does Genesis replace human judgment?",
    answer:
      "No. Genesis can organize information, surface context, automate defined work, and support decisions. Human users remain responsible for decisions that require human judgment, professional responsibility, or regulated authority.",
    paths: ["custom-infrastructure"],
  },
  {
    question: "Are third-party software costs included?",
    answer:
      "Plan prices cover Genesis. Third-party software, licenses, model or API usage, telephony, CRM, Microsoft 365, and similar external costs are separate unless explicitly stated otherwise.",
    paths: ["custom-infrastructure"],
  },
];

/** The pricing page's questions. */
export const pricingFaqs = [
  {
    question: "What changes between the Levels?",
    answer:
      "Level 01 is for one user: calls answered, quotes followed up and appointments confirmed. Level 02 covers up to 5 users and adds team roles, routing and automation across workflows. Level 03 covers up to 25 users and adds priority onboarding and Genesis working across your connected systems. More than 25 users is Genesis Enterprise.",
  },
  {
    question: "Are third-party software costs included?",
    answer:
      "No, unless explicitly stated. Plan pricing covers Genesis; external licenses and usage are separate.",
  },
  {
    question: "How do I know which Level fits?",
    answer:
      "Take the free assessment: your results suggest a Level from your team size. A short call then maps how the work moves today and what Genesis would be responsible for, before anything is recommended in writing.",
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
