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
  href: "/tools" | "/solutions";
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
    href: "/tools",
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

/** Pages that belong to one path, and so always show it as chosen: the
    tools and each tool's own page, and the managed page. */
export const offerPathByPage: Readonly<Record<string, OfferPathId>> = {
  "/tools": "agent",
  "/tools/deal-architect": "agent",
  "/tools/funding-ready": "agent",
  "/tools/deal-desk": "agent",
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
  /** The core belief, and the Custom Infrastructure hero's headline. */
  belief: "Your business should get smarter as it grows.",
  summary:
    "Genesis helps real estate businesses deploy AI-powered operating infrastructure across communication, sales, deal flow, knowledge, workflow, and execution.",
  /** The brand in one sentence: the footer, and the organization record. */
  brandDescription:
    "Genesis builds AI infrastructure for real estate professionals by connecting business systems, workflows, communication, deal flow, data, automation, and operational intelligence.",
  domains: [
    "Communication",
    "Sales",
    "Deal flow",
    "Knowledge",
    "Workflow",
    "Execution",
  ],
} as const;

/** The Genesis thesis section: the six domains' reason for being. */
export const genesisThesis = {
  eyebrow: "The Genesis thesis",
  headline: "Growth should create leverage, not more operational drag.",
  body: [
    "Most real estate businesses do not have a shortage of software. They have work scattered between CRMs, inboxes, documents, spreadsheets, follow-up systems, employees, and processes that still depend on someone remembering what happens next.",
    "Genesis is built around a different idea: as the business grows, the operation should become more connected, more informed, and more capable of carrying repeatable work.",
    "That means turning communication, sales activity, deal flow, business knowledge, workflows, and execution into infrastructure the business can keep using and improving.",
  ],
  closing: "The goal is not more AI inside the business. The goal is a better-operating business.",
} as const;

/**
 * The homepage opens with a title for each path, over the same hawk. The
 * accent is the closing phrase, set in gold.
 */
export const pathHeroes: Readonly<
  Record<OfferPathId, { eyebrow: string; title: string; accent: string; summary: string }>
> = {
  agent: {
    eyebrow: "Genesis Tools",
    title: "Solve a specific real estate problem",
    accent: "with Genesis.",
    summary:
      "Focused, self-service tools for analyzing opportunities, preparing financing requests, and working active transactions with clearer structure and context.",
  },
  "custom-infrastructure": {
    eyebrow: genesisPositioning.category,
    title: "Your business should get smarter",
    accent: "as it grows.",
    summary:
      "Genesis maps how work moves through your real estate business, connects the systems, data, communication, and workflows behind it, and builds managed infrastructure so more volume does not automatically mean more manual coordination.",
  },
};

/* ── Genesis Tools};

/* ── Genesis Tools ─────────────────────────────────────────────────────── */

export type ToolId = "deal-architect" | "funding-ready" | "deal-desk";

export type ToolPrice = {
  /** As displayed. Deal Desk shows the top of its reviewed range for now. */
  display: string;
  /** What one price buys. */
  unit: "analysis" | "package" | "month";
  /** The unit spelled out where the tools page does, e.g. "full analysis". */
  detail?: string;
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
  /** Who brings it work, where the copy names them. */
  primaryUsers: string | null;
  price: ToolPrice;
  /** The tool in one short line: its headline on the homepage card. */
  tagline: string;
  /** What the homepage card says under the headline. */
  body: string;
  /** Three things it does, a few words each, for its homepage card. */
  keyPoints: readonly [string, string, string];
  /** How the tools page presents it: its own headline and body. */
  hub: { headline: string; body: readonly string[] };
  /** How the pricing page presents it. */
  pricing: { for: string; get: readonly [string, string, string] };
  /** A short, representative subset of what the tool produces or supports. */
  highlights: readonly string[];
  /** Everything it can produce, where the copy lists it. */
  outputs?: readonly string[];
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
    description: "Try focused AI tools built around real estate workflows.",
  },
  /** The Genesis Tools section on the homepage. */
  home: {
    headline: "Start with the job in front of you.",
    summary:
      "Genesis Tools apply focused pieces of Genesis intelligence to individual real estate workflows. Use the tool you need now. Move into broader infrastructure when the problem extends beyond one task.",
  },
  /** The tools page. */
  page: {
    headline: "Start with one real estate problem.",
    summary:
      "Focused, self-service tools that apply Genesis intelligence to real transactions. Analyze an opportunity, prepare a financing package, or keep working a deal over time.",
    cta: "Ask About Genesis Tools",
    introEyebrow: "Three focused tools",
    introHeadline: "Use Genesis where you need it now.",
    introBody:
      "These are not smaller versions of Genesis Managed AI. Each tool is designed around a specific job you can complete yourself.",
  },
  /** The Genesis Tools half of the pricing page. */
  pricing: {
    headline: "I want to solve a specific problem myself.",
    body: "Focused products for individual real estate workflows.",
    cta: "See Genesis Tools",
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
      "Investors, wholesalers, agents, acquisition professionals, and operators evaluating a transaction.",
    price: {
      display: "$49",
      unit: "analysis",
      detail: "full analysis",
      cadence: "per-use",
      amountUsd: [49, 49],
    },
    tagline: "Understand the deal before you pursue it.",
    body: "Bring the opportunity and your assumptions. Deal Architect organizes the transaction, calculates the financial metrics that can be calculated, identifies missing information, and helps you understand what deserves attention next.",
    keyPoints: [
      "Project cost and cash required",
      "Risks, assumptions, and missing information",
      "Questions and suggested next actions",
    ],
    hub: {
      headline: "Understand the opportunity before deciding how to pursue it.",
      body: [
        "Deal Architect structures the transaction around the information that matters, performs deterministic calculations from your inputs, identifies missing information and risk flags, and helps frame the questions and next actions that deserve attention.",
      ],
    },
    pricing: {
      for: "Understand the deal before you pursue it.",
      get: [
        "Transaction calculations from supplied inputs",
        "Risks, assumptions, and missing information",
        "Suggested questions and next actions",
      ],
    },
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
        "Borrower / Sponsor, where relevant",
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
    tagline: "Turn the deal into a lender-ready package.",
    body: "Organize borrower, property, project, financing, and documentation information into a professional financing submission without implying approval, rates, or lender terms that have not been provided.",
    keyPoints: ["Executive financing summary", "Sources and uses", "Document checklist"],
    hub: {
      headline: "Turn an unstructured deal into a professional financing submission.",
      body: [
        "Funding Ready organizes borrower, sponsor, property, project, financing, and documentation information into a clear package built for lender review.",
        "It prepares the information. It does not promise approval, rates, terms, or financing.",
      ],
    },
    pricing: {
      for: "Turn your deal into a lender-ready financing package.",
      get: [
        "Executive financing summary",
        "Sources and uses",
        "Document checklist and missing-information review",
      ],
    },
    highlights: [
      "Executive financing summary",
      "Sources and uses",
      "Document checklist",
      "Lender-ready submission package",
    ],
    outputs: [
      "Executive financing summary",
      "Borrower / sponsor profile",
      "Property and project summary",
      "Sources and uses",
      "Financing request",
      "Exit strategy",
      "Risks and missing information",
      "Document checklist",
      "Professional lender-submission summary",
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
    tagline: "Keep the transaction context with the transaction.",
    body: "An ongoing Genesis workspace for reviewing opportunities, working through financing questions, organizing deal information, and continuing from the context you have already built.",
    keyPoints: [
      "Review active opportunities",
      "Compare financing structures",
      "Recall saved deals and context",
    ],
    hub: {
      headline: "An ongoing workspace for the deals you are actually working.",
      body: [
        "Deal Desk keeps structured transaction context available as the deal changes so you can continue analysis, work through financing questions, prepare follow-up, organize information, and return to previous deals without starting over.",
      ],
    },
    pricing: {
      for: "Keep working active transactions with persistent deal context.",
      get: [
        "Review opportunities",
        "Work through financing structures and questions",
        "Recall saved deals and transaction history",
      ],
    },
    highlights: [
      "Reviewing opportunities",
      "Comparing loan structures",
      "Analyzing cash-to-close",
      "Recalling saved deals",
    ],
    structure: {
      label: "Built around",
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
 * How the tools connect: each is where a deal can go next when the work calls
 * for it, not a stage every deal must pass through. The financing-review
 * hand-off is deliberately absent: it belongs to a separately branded partner
 * and is offered inside the product, never on Genesis marketing pages.
 */
export const toolFlow = {
  eyebrow: "Use the next tool when the work calls for it.",
  headline: "One deal can create different next steps.",
} as const;

export const toolJourney: readonly {
  tool: ToolId;
  task: string;
  /** When this tool applies, in a few words, for the flow card's label. */
  cue: string;
  description: string;
}[] = [
  {
    tool: "deal-architect",
    task: "Analyze this deal.",
    cue: "Start here",
    description:
      "Start by understanding the opportunity, the assumptions behind it, and what is still unknown.",
  },
  {
    tool: "funding-ready",
    task: "I need to prepare this for financing.",
    cue: "When financing matters",
    description:
      "When financing becomes part of the path, organize the borrower, property, project, and documentation into a professional submission.",
  },
  {
    tool: "deal-desk",
    task: "I’m going to keep working this transaction.",
    cue: "When the deal continues",
    description:
      "When the deal requires ongoing analysis, questions, documents, and follow-up, keep its context in one recurring workspace.",
  },
];

export const toolsToManaged = {
  headline: "The problem is bigger than one deal?",
  body: "If the same operational problems keep showing up across your CRM, communication, follow-up, documents, team, and workflows, that is where Genesis Managed AI begins.",
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
  "User provided": "Information and figures supplied by you.",
  Calculated: "Derived from supplied inputs using deterministic formulas.",
  Estimated: "An estimate, clearly labeled so it is not mistaken for fact.",
  Missing: "Information that has not been supplied and is reported as missing rather than guessed.",
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

/** The same list as one sentence: "Genesis does not fabricate …, or approvals." */
export const neverFabricatedSentence = `Genesis does not fabricate ${neverFabricated
  .slice(0, -1)
  .map((item) => item.toLowerCase())
  .join(", ")}, or ${neverFabricated.at(-1)?.toLowerCase()}.`;

export const TOOLS_INTEREST_SUBJECT = "Genesis Tools interest";

/* ── Genesis Managed AI ────────────────────────────────────────────────── */

export const managedOverview = {
  product: "Genesis Managed AI",
  eyebrow: "Custom Infrastructure · Genesis Managed AI",
  headline: "Genesis works across the operation, not just inside one task.",
  summary:
    "A managed Genesis deployment connects the systems and context behind the work: data, workflows, communication, CRM, automation, AI capabilities, and operational intelligence fitted around how the business actually runs.",
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
  /** What it does: a short title each, with the sentence behind it. */
  does: [
    {
      title: "Connect systems and context",
      body: "Keep the information required to move work forward from becoming trapped in separate tools, inboxes, files, and people.",
    },
    {
      title: "Apply intelligence to real workflows",
      body: "Use automation and AI where they can organize, interpret, communicate, generate, or move work without pretending AI should make every decision.",
    },
    {
      title: "Keep the infrastructure operational",
      body: "When ongoing management is included, Genesis supports, maintains, and refines the agreed system as the operation changes.",
    },
  ],
  /** The plans section on the homepage. */
  plans: {
    eyebrow: "Genesis Managed AI",
    headline: "Three levels of operational depth.",
    body: "The difference is not simply more features or more AI agents. Each level represents a broader implementation across the people, systems, workflows, integrations, and operational complexity Genesis is responsible for supporting.",
  },
  /** The Managed AI half of the pricing page. */
  pricing: {
    headline: "I want Genesis operating across my business.",
    body: "Managed plans represent increasing depth across implementation, integrations, workflows, automation, intelligence, and operational support.",
    closing: "A consultation confirms the appropriate implementation level for the operation.",
  },
  thirdPartyNote:
    "Plan prices cover Genesis. Third-party licenses and usage, including external software and infrastructure charges, are separate unless explicitly stated.",
  thirdPartyShort: "Plan prices cover Genesis. Third-party licenses and usage are extra unless stated.",
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
  /** Who the level is for, on the homepage card. */
  summary: string;
  /** Who the level is for, in the pricing comparison. */
  fit: string;
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
    summary:
      "For an operator or smaller team beginning to move repeatable work into a managed Genesis environment.",
    fit: "For operations beginning with a managed foundation and focused workflows.",
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
    summary:
      "For operations where the problem extends across multiple workflows, people, handoffs, and systems.",
    fit: "For businesses where the work crosses multiple people, systems, and operating workflows.",
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
    summary:
      "For businesses that need Genesis operating more broadly across connected systems, workflows, teams, and AI capabilities.",
    fit: "For organizations that need Genesis working broadly across infrastructure, workflows, integrations, and AI capabilities.",
    ...undefinedEntitlements,
  },
];

export function toolPriceLabel(price: ToolPrice) {
  return `${price.display} / ${price.unit}`;
}
