import type { OfferPathId } from "./offers";

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
 */
export const navigation: NavEntry[] = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Company",
    items: [
      { label: "About", href: "/about", description: "Team and principles." },
      { label: "Results", href: "/results", description: "The proof standard." },
      { label: "Contact", href: "/contact", description: "Book a consultation." },
    ],
  },
];

export const systemLayers: SystemLayer[] = [
  {
    number: "01",
    title: "Operational Foundation",
    shortTitle: "Foundation",
    description: "Microsoft 365, business email, identity, documents, and integrations—provisioned as dependable business infrastructure.",
    details: ["Business email on your domain", "Identity and permission management", "Calendars, documents, and Teams", "Connections to the tools you keep"],
  },
  {
    number: "02",
    title: "Applied AI & Data Synthesis",
    shortTitle: "Intelligence",
    description: "Genesis connects scattered operational signals, turns them into usable context, and applies AI inside the workflows where work gets stuck.",
    details: ["Cross-system context synthesis", "Follow-up and routing workflows", "Document and information handling", "Human approval where judgment matters"],
  },
  {
    number: "03",
    title: "Genesis CRM — Optional",
    shortTitle: "Optional CRM",
    description: "A system of record for pipelines, campaigns, booking, and structured follow-up when the operation actually needs one.",
    details: ["No forced rip-and-replace", "Pipelines and opportunities", "Campaigns and booking", "Structured follow-up"],
  },
  {
    number: "04",
    title: "Fully Managed — Ongoing",
    shortTitle: "Managed",
    description: "Genesis monitors, supports, maintains, and improves the platform so running the system does not become the operator’s next job.",
    details: ["Monitoring and support", "System maintenance", "Workflow refinement", "Continuous improvement"],
  },
];

/** The managed engagement. `summary` is the short label the engagement path already uses. */
export const processSteps = [
  { number: "01", title: "Consultation", summary: "Free fit conversation", description: "A focused, no-cost conversation about the operation, its priorities, and where work currently depends on you." },
  { number: "02", title: "Scoping", summary: "Recommendation + next step", description: "Genesis recommends the implementation boundary. When complexity warrants deeper paid Discovery or a focused Pilot, that work is proposed after the consultation." },
  { number: "03", title: "Implementation", summary: "The system build", description: "The foundation, Applied AI workflows, integrations, and optional CRM are provisioned and connected around the operation." },
  { number: "04", title: "Launch", summary: "Live in the operation", description: "The platform goes into daily use with focused adoption, validation, and support through the agreed launch boundary." },
  { number: "05", title: "Managed Platform", summary: "Support + improve when included", description: "When ongoing management is in scope, Genesis keeps the agreed system supported, current, and improving as priorities change." },
] as const;

export const audiences = [
  { title: "Broker-owners", outcome: "Stop being the bottleneck.", description: "Connect producer activity, documents, communication, and pipeline oversight in one managed operating environment." },
  { title: "Lending principals", outcome: "Turn documents into context.", description: "Synthesize borrower, property, communication, and workflow signals so the next action is clearer and more consistent." },
  { title: "Acquisitions & builders", outcome: "Fewer gaps from intake to decision.", description: "Structure deal flow, diligence, vendor communication, documents, and decision support around the way the team already works." },
  { title: "Solo operators", outcome: "Build the foundation early.", description: "Start with professional infrastructure and focused automation, then add platform depth as the operation expands." },
] as const;

export type Faq = {
  question: string;
  answer: string;
  /** The homepage paths that ask it. */
  paths: readonly OfferPathId[];
};

/** Homepage questions. Answers hold to the reviewed offer mandate and the site's existing approved statements. */
export const faqs: readonly Faq[] = [
  { question: "What is the difference between Genesis Tools and Genesis Managed AI?", answer: "Genesis Tools are focused, self-service AI applications: you use Genesis intelligence to solve a specific problem yourself. Genesis Managed AI works across your business, connecting systems, data, workflows, communication, CRM, AI agents, automation, and operational intelligence into an integrated AI infrastructure.", paths: ["agent", "custom-infrastructure"] },
  { question: "Are the tools a smaller version of a managed plan?", answer: "No. They solve different scopes of problems. A tool helps you do a specific task yourself. Genesis Managed AI integrates Genesis into the way your business operates.", paths: ["agent", "custom-infrastructure"] },
  { question: "Does Genesis use AI to calculate the numbers in a deal?", answer: "No. Deal Architect calculates financial metrics with deterministic formulas, and Genesis interprets the deal after those calculations are complete. Figures are labeled known, user provided, calculated, estimated, or missing, so nothing speculative is presented as fact.", paths: ["agent"] },
  { question: "Does Funding Ready guarantee financing?", answer: "No. Funding Ready turns a deal into a professional, lender-ready financing submission. It does not imply guaranteed approval, guaranteed rates, or guaranteed financing.", paths: ["agent"] },
  { question: "Does a managed deployment require replacing our current systems?", answer: "Not automatically. Genesis reviews the current environment first, keeps useful systems where appropriate, and scopes the foundation, workflows, integrations, and optional CRM around the actual operation.", paths: ["custom-infrastructure"] },
  { question: "Are third-party software costs included in a managed plan?", answer: "Plan prices cover Genesis. Third-party licenses and usage, such as Microsoft 365, telephony, CRM, or model and API usage, are not included unless stated.", paths: ["custom-infrastructure"] },
];

export const proofItems: ProofItem[] = [];

export const routes = ["", "/mini", "/solutions", "/how-it-works", "/pricing", "/results", "/about", "/contact"] as const;

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
