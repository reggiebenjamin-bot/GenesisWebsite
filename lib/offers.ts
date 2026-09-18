/**
 * The two ways to use Genesis — the one source the website reads for offer
 * wording and prices.
 *
 * Every string and price here comes from the reviewed product mandate
 * ("Genesis AI — Self-Serve Tools Product Layer"). Nothing is invented: where
 * the mandate requires an entitlement to exist in data but has not defined it
 * yet (included users, connected accounts, integrations, implementation,
 * support), the field is `null`, and the site renders nothing for it.
 *
 * This is deliberately separate from lib/products.ts. That file holds the
 * earlier custom-build implementation catalog, which the consultation form and
 * API still validate against and which its contract tests pin.
 *
 * No path aliases in this file: tests import it directly under Node.
 */

export type OfferPathId = "agent" | "custom-infrastructure";

export type OfferPath = {
  id: OfferPathId;
  /** The selector label a visitor chooses. */
  label: string;
  /** The page dedicated to this path. */
  href: "/mini" | "/solutions";
  /** The Genesis offer that path presents. */
  product: string;
  /** How the visitor would describe the need. */
  intent: string;
  /** TOOLS = help me do this task. MANAGED = help my business operate this way. */
  distinction: string;
  /** The relationship in one line. */
  relationship: string;
};

export const DEFAULT_OFFER_PATH: OfferPathId = "agent";

export const offerPaths: readonly OfferPath[] = [
  {
    id: "agent",
    label: "Agent",
    href: "/mini",
    product: "Genesis Tools",
    intent: "I want to solve a specific task myself.",
    distinction: "Help me do this task.",
    relationship: "I use Genesis.",
  },
  {
    id: "custom-infrastructure",
    label: "Custom Infrastructure",
    href: "/solutions",
    product: "Genesis Managed AI",
    intent: "I want AI operating across my business.",
    distinction: "Help my business operate this way.",
    relationship: "Genesis works inside my business.",
  },
];

export function isOfferPathId(value: string): value is OfferPathId {
  return offerPaths.some((path) => path.id === value);
}

/* ── the site-wide path choice ───────────────────────────────────────────
   The chosen path lives on <html data-offer-path>. An inline script sets it
   before first paint (from the URL hash, the page, or the session), and CSS
   shows the matching content, so a returning visitor never sees the other
   path flash first. */

export const OFFER_PATH_ATTRIBUTE = "data-offer-path";
export const OFFER_PATH_STORAGE_KEY = "genesis-offer-path";

/** Hashes from the previous pricing page that still select a path. */
export const offerPathHashAliases: Readonly<Record<string, OfferPathId>> = {
  mini: "agent",
  infrastructure: "custom-infrastructure",
};

/** Pages that belong to one path, and so always show it as chosen. */
export const offerPathByPage: Readonly<Record<string, OfferPathId>> = {
  "/mini": "agent",
  "/solutions": "custom-infrastructure",
};

/** Pages that show both paths and switch between them in place. */
export const offerPathSwitchPages: readonly string[] = ["/", "/pricing"];

export type OfferPathPageKind =
  | { kind: "switch" }
  | { kind: "page"; path: OfferPathId }
  | { kind: "neutral" };

/** How the navigation toggle behaves on a given page. */
export function offerPathPageKind(pathname: string): OfferPathPageKind {
  if (offerPathSwitchPages.includes(pathname)) return { kind: "switch" };
  const path = offerPathByPage[pathname];
  return path ? { kind: "page", path } : { kind: "neutral" };
}

/** A path named by a URL hash, including the previous page's hashes. */
export function offerPathFromHash(hash: string): OfferPathId | null {
  const value = hash.replace(/^#/, "");
  if (isOfferPathId(value)) return value;
  return offerPathHashAliases[value] ?? null;
}

/**
 * A path's homepage: the homepage with that path chosen. Where the toggle
 * links instead of switching in place, this is where it leads.
 */
export function offerPathHomeHref(path: OfferPathId): `/#${OfferPathId}` {
  return `/#${path}`;
}

export const genesisPositioning = {
  category: "AI Infrastructure for Real Estate Professionals",
  summary:
    "Genesis helps real estate businesses deploy AI-powered operating infrastructure across communication, sales, deal flow, knowledge, workflow, and execution.",
  /** The summary cut to one short line for the Custom Infrastructure hero: the same claim, without the domains. */
  shortSummary: "AI-powered operating infrastructure for real estate businesses.",
  thesis:
    "Genesis turns domain expertise, business data, software, communication, and AI into operational infrastructure.",
  domains: [
    "Communication",
    "Sales",
    "Deal flow",
    "Knowledge",
    "Workflow",
    "Execution",
  ],
} as const;

/**
 * The homepage opens with a title for each path, over the same hawk. Custom
 * Infrastructure keeps the site's approved title. Agent's is the Genesis Tools
 * headline, "Use Genesis intelligence to solve a specific problem yourself.",
 * cut to its core.
 */
export const pathHeroes: Readonly<
  Record<OfferPathId, { title: string; accent: string; summary: string }>
> = {
  agent: {
    title: "Solve a specific problem",
    accent: "yourself.",
    summary: "Focused, self-service AI applications for real estate professionals.",
  },
  "custom-infrastructure": {
    title: "Stop holding",
    accent: "every deal together.",
    summary: genesisPositioning.shortSummary,
  },
};

/* ── Genesis Tools ─────────────────────────────────────────────────────── */

export type ToolId = "deal-architect" | "funding-ready" | "deal-desk";

export type ToolPrice = {
  /** As displayed. Deal Desk shows the top of its reviewed range for now. */
  display: string;
  /** What one price buys. */
  unit: "analysis" | "package" | "month";
  cadence: "per-use" | "monthly";
  /** Whole US dollars, [low, high]. Equal unless the mandate states a range. */
  amountUsd: readonly [number, number];
};

export type GenesisTool = {
  id: ToolId;
  number: string;
  name: string;
  promise: string;
  purpose: string;
  /** Only where the mandate names the user. */
  primaryUsers: string | null;
  price: ToolPrice;
  /** The tool in one short line, for its card: trimmed from its promise or purpose. */
  tagline: string;
  /** Three things it does, a few words each, for its card: trimmed from its outputs. */
  keyPoints: readonly [string, string, string];
  /** A short, representative subset of what the tool produces or supports. */
  highlights: readonly string[];
  /** The structured steps or intake areas the tool works through. */
  structure: { label: string; steps: readonly string[] };
};

export const toolsOverview = {
  product: "Genesis Tools",
  headline: "Use Genesis intelligence to solve a specific problem yourself.",
  summary: "Focused, self-service AI applications.",
  examples: [
    "Analyze this deal.",
    "Prepare this financing request.",
    "Help me work through this transaction.",
  ],
  invitation: {
    title: "Want to experience Genesis first?",
    description: "Try focused AI tools built around real real-estate workflows.",
  },
} as const;

export const genesisTools: readonly GenesisTool[] = [
  {
    id: "deal-architect",
    number: "01",
    name: "Deal Architect",
    promise: "Bring us the opportunity. Deal Architect helps you understand the deal.",
    purpose:
      "Help a real estate professional understand an opportunity before deciding how to pursue it.",
    primaryUsers:
      "Investor, wholesaler, agent, acquisition professional, or operator evaluating a potential real estate transaction.",
    price: { display: "$49", unit: "analysis", cadence: "per-use", amountUsd: [49, 49] },
    tagline: "Understand the deal before you pursue it.",
    keyPoints: ["Project cost and cash required", "Risk flags and missing information", "Suggested next actions"],
    highlights: [
      "Total project cost and estimated cash requirement",
      "Missing information and risk flags",
      "Plausible transaction structures and financing categories",
      "Suggested next actions",
    ],
    structure: {
      label: "Structured workflow",
      steps: [
        "Property",
        "Acquisition",
        "Rehab / Development",
        "ARV / Value / Rent",
        "Financing",
        "Borrower / Sponsor",
        "Exit assumptions",
        "Analysis",
      ],
    },
  },
  {
    id: "funding-ready",
    number: "02",
    name: "Funding Ready",
    promise: "Turn your deal into a lender-ready package.",
    purpose:
      "Turn an unstructured borrower + property + project into a professional financing submission.",
    primaryUsers: null,
    price: { display: "$99", unit: "package", cadence: "per-use", amountUsd: [99, 99] },
    tagline: "Turn your deal into a lender-ready package.",
    keyPoints: ["Executive financing summary", "Sources and uses", "Document checklist"],
    highlights: [
      "Executive financing summary",
      "Sources and uses",
      "Document checklist",
      "Lender-ready submission package",
    ],
    structure: {
      label: "Intake",
      steps: ["Borrower / Sponsor", "Property", "Project", "Financing", "Documentation"],
    },
  },
  {
    id: "deal-desk",
    number: "03",
    name: "Deal Desk",
    promise: "An AI deal desk that understands real estate transactions.",
    purpose:
      "Provide an ongoing AI workspace for real estate operators working through transactions.",
    primaryUsers: null,
    price: { display: "$49", unit: "month", cadence: "monthly", amountUsd: [29, 49] },
    tagline: "An AI deal desk for your transactions.",
    keyPoints: ["Review opportunities", "Compare loan structures", "Recall saved deals"],
    highlights: [
      "Reviewing opportunities",
      "Comparing loan structures",
      "Analyzing cash-to-close",
      "Recalling saved deals",
    ],
    structure: {
      label: "Built on",
      steps: [
        "Structured deal context",
        "Saved transactions",
        "Calculators",
        "Reusable workflows",
        "Document generation",
        "Persistent deal history",
      ],
    },
  },
];

/**
 * How the tools connect. Each step pairs the task a visitor brings with the
 * question that leads there from the step before. The financing-review hand-off
 * is deliberately absent: it belongs to a separately branded partner and is
 * offered inside the product, never on Genesis marketing pages.
 */
export const toolJourney: readonly {
  tool: ToolId;
  task: string;
  gate: string | null;
  /** The gate in a few words, for the flow diagram. */
  cue: string;
}[] = [
  { tool: "deal-architect", task: "Analyze this deal.", gate: null, cue: "Start here" },
  {
    tool: "funding-ready",
    task: "Prepare this financing request.",
    gate: "Is there a viable opportunity worth pursuing?",
    cue: "Worth pursuing?",
  },
  {
    tool: "deal-desk",
    task: "Help me work through this transaction.",
    gate: "Working multiple deals?",
    cue: "Working multiple deals?",
  },
];

export const toolsToManaged = {
  question: "Want Genesis connected to your CRM, email, communication, workflows, and team?",
  action: "Explore Genesis Managed AI",
} as const;

/** How Deal Architect labels every figure, so nothing speculative reads as fact. */
export const dataProvenance = [
  "Known",
  "User provided",
  "Calculated",
  "Estimated",
  "Missing",
] as const;

export type DataProvenance = (typeof dataProvenance)[number];

/** What each provenance label means, in the reader's terms. */
export const dataProvenanceMeaning: Readonly<Record<DataProvenance, string>> = {
  Known: "Established facts about the property or transaction.",
  "User provided": "Figures you supplied.",
  Calculated: "Derived from your inputs with deterministic formulas.",
  Estimated: "An estimate, labeled so it is never read as fact.",
  Missing: "Not supplied, and reported as missing rather than guessed.",
};

/** How Deal Architect handles numbers, in short points. */
export const numbersHandled = {
  title: "Formulas calculate. Genesis interprets.",
  points: ["Deterministic math first", "Every figure labeled by source", "Missing stays missing"],
} as const;

/** Never produced by inference. When it is not supplied, it is reported missing. */
export const neverFabricated = [
  "Comps",
  "Property values",
  "Rates",
  "Lender terms",
  "Borrower information",
  "Title information",
  "Liens",
  "Zoning",
  "Taxes",
  "Insurance",
  "Approvals",
] as const;

export const TOOLS_INTEREST_SUBJECT = "Genesis Tools interest";

/* ── Genesis Managed AI ────────────────────────────────────────────────── */

export const managedOverview = {
  product: "Genesis Managed AI",
  headline: "Genesis works across your business.",
  summary:
    "It connects systems, data, workflows, communication, CRM, AI agents, automation, and operational intelligence into an integrated AI infrastructure.",
  capabilities: [
    "Systems",
    "Data",
    "Workflows",
    "Communication",
    "CRM",
    "AI agents",
    "Automation",
    "Operational intelligence",
  ],
  /** What it does, in short points: trimmed from the summary and the managed layer. */
  points: ["Connects systems and data", "AI agents and automation", "Monitored and improved"],
  progression:
    "Increasing levels of implementation, integration, automation, intelligence, and operational support.",
  thirdPartyNote:
    "Plan prices cover Genesis. Third-party licenses and usage, such as Microsoft 365, telephony, CRM, or model and API usage, are not included unless stated.",
  thirdPartyShort: "Plan prices cover Genesis; third-party licenses and usage are extra unless stated.",
} as const;

export type ManagedPlanId = "managed-750" | "managed-1750" | "managed-4500";

export type ManagedPlan = {
  id: ManagedPlanId;
  step: string;
  monthlyPriceUsd: number;
  priceDisplay: string;
  /** What the deployment is. */
  scope: string;
  /** Who Genesis serves at this level. */
  ladder: string;
  /** How much automation the level carries. */
  automationLevel: string;
  /** The scope and the automation in a few words each, for its card. */
  points: readonly [string, string];
  /*
   * Required in data by the mandate, not yet defined by it or by the
   * repository. Left null rather than guessed; the site renders nothing for a
   * null field.
   */
  includedUsers: number | null;
  additionalUserPriceUsd: number | null;
  includedAiAgents: readonly string[] | null;
  connectedAccounts: readonly string[] | null;
  integrations: readonly string[] | null;
  includedUsage: string | null;
  implementationLevel: string | null;
  supportLevel: string | null;
};

const undefinedEntitlements = {
  includedUsers: null,
  additionalUserPriceUsd: null,
  includedAiAgents: null,
  connectedAccounts: null,
  integrations: null,
  includedUsage: null,
  implementationLevel: null,
  supportLevel: null,
} as const;

export const managedPlans: readonly ManagedPlan[] = [
  {
    id: "managed-750",
    step: "01",
    monthlyPriceUsd: 750,
    priceDisplay: "$750",
    scope: "Entry managed Genesis deployment.",
    ladder: "Genesis assists the operator.",
    automationLevel: "Focused workflows and individual productivity.",
    points: ["Entry managed deployment", "Focused workflows"],
    ...undefinedEntitlements,
  },
  {
    id: "managed-1750",
    step: "02",
    monthlyPriceUsd: 1750,
    priceDisplay: "$1,750",
    scope: "More substantial AI workflow and operational deployment.",
    ladder: "Genesis connects and assists the team.",
    automationLevel: "Cross-workflow automation and team operations.",
    points: ["Workflow and operations deployment", "Cross-workflow automation"],
    ...undefinedEntitlements,
  },
  {
    id: "managed-4500",
    step: "03",
    monthlyPriceUsd: 4500,
    priceDisplay: "$4,500",
    scope: "Advanced business-wide AI infrastructure and automation.",
    ladder: "Genesis helps orchestrate the operation.",
    automationLevel:
      "Business-wide orchestration, multiple agents, deeper integrations, and more sophisticated automation.",
    points: ["Business-wide AI infrastructure", "Multi-agent orchestration"],
    ...undefinedEntitlements,
  },
];

export function toolPriceLabel(price: ToolPrice) {
  return `${price.display} / ${price.unit}`;
}
