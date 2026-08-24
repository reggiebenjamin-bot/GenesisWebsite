export type NavItem = {
  label: string;
  href: string;
};

export type SystemLayer = {
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  details: string[];
};

export type PricingPlan = {
  slug: "foundation" | "professional" | "enterprise";
  name: string;
  monthlyPrice: string;
  audience: string;
  features: string[];
  featured?: boolean;
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

export const navigation: NavItem[] = [
  { label: "Solutions", href: "/solutions" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Results", href: "/results" },
  { label: "About", href: "/about" },
];

export const systemLayers: SystemLayer[] = [
  {
    number: "01",
    title: "Microsoft 365 Foundation",
    shortTitle: "Foundation",
    description:
      "Business email, identity, calendars, documents, and Teams—professionally provisioned as the base of the operation.",
    details: [
      "Business email on your domain",
      "Identity and access",
      "Calendars, documents, and Teams",
      "A professional operating foundation",
    ],
  },
  {
    number: "02",
    title: "Applied AI & Data Synthesis",
    shortTitle: "Workflows",
    description:
      "Operational data is synthesized into usable context, then applied through practical AI workflows for follow-up, documents, administration, and repetitive real-estate work.",
    details: [
      "Cross-system context synthesis",
      "Follow-up workflows",
      "Administrative automation",
      "Document and information handling",
      "Real-estate operations support",
    ],
  },
  {
    number: "03",
    title: "Genesis CRM — Optional Layer",
    shortTitle: "Optional CRM",
    description:
      "Pipelines, campaigns, booking, marketing automation, and structured follow-up when the operation needs them.",
    details: [
      "Pipelines and opportunities",
      "Campaigns and booking",
      "Marketing automation",
      "Structured follow-up",
    ],
  },
  {
    number: "04",
    title: "Fully Managed — Ongoing",
    shortTitle: "Managed",
    description:
      "Monitoring, support, maintenance, and continuous improvement after the initial system is in place.",
    details: [
      "Monitoring and support",
      "System maintenance",
      "Workflow refinement",
      "Ongoing improvement",
    ],
  },
];

export const processSteps = [
  {
    number: "01",
    title: "Consult",
    description:
      "We map your current tools, workflows, and gaps—and scope the right starting point for how you actually work.",
  },
  {
    number: "02",
    title: "Provision",
    description:
      "Genesis provisions the Microsoft 365 foundation, migrates what is in scope, and prepares the operating environment.",
  },
  {
    number: "03",
    title: "Integrate & Automate",
    description:
      "We connect the right tools, build practical workflows, and add Genesis CRM when it belongs in the solution.",
  },
  {
    number: "04",
    title: "Manage & Improve",
    description:
      "We continue with monitoring, support, maintenance, and improvements as the business changes.",
  },
] as const;

export const audiences = [
  {
    title: "Solo agents",
    outcome: "Look professional. Protect more selling time.",
    description:
      "Professional email, organized documents, and practical automation that reduces the administrative work between client conversations.",
  },
  {
    title: "Teams & team leads",
    outcome: "Make every handoff more consistent.",
    description:
      "Shared calendars, standardized follow-up, CRM pipelines, and repeatable workflows across the team.",
  },
  {
    title: "Brokers & brokerages",
    outcome: "Standardize without slowing people down.",
    description:
      "Multi-user identity, access, onboarding, and a managed environment that can scale across the operation.",
  },
  {
    title: "Investors & operators",
    outcome: "Keep opportunities and documents moving.",
    description:
      "Deal flow, vendor communication, and document management structured in one secure environment.",
  },
] as const;

export const pricingPlans: PricingPlan[] = [
  {
    slug: "foundation",
    name: "Foundation",
    monthlyPrice: "$750",
    audience:
      "For a solo agent or small operator who needs a professional foundation, done right.",
    features: [
      "Up to 3 users included",
      "Microsoft 365 provisioning and setup",
      "Business email on your domain, identity, and documents",
      "Core AI infrastructure setup",
      "Fully managed and supported, ongoing",
    ],
  },
  {
    slug: "professional",
    name: "Professional",
    monthlyPrice: "$1,750",
    audience:
      "For a growing team ready to run marketing, follow-up, and operations on one system.",
    features: [
      "Up to 8 users included",
      "Everything in Foundation",
      "Genesis CRM and marketing automation",
      "AI workflows and automation built for your team",
      "Deeper integrations across your stack",
    ],
    featured: true,
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    monthlyPrice: "$4,500",
    audience:
      "For brokerages and larger operations that need the full stack across many users.",
    features: [
      "Up to 15 users included, then $200 per additional user monthly",
      "Full stack for multi-user teams",
      "Custom AI agents and integrations",
      "Everything in Professional, at brokerage scale",
      "Priority support",
    ],
  },
];

export const faqs = [
  {
    question: "What exactly is AI infrastructure?",
    answer:
      "It is the professional foundation your business runs on: Microsoft 365 for email, identity, documents, and Teams, with AI workflows and automation built on top—all set up and managed as one system.",
  },
  {
    question: "I already have email or Microsoft 365. Do I have to start over?",
    answer:
      "No. During the consultation, Genesis assesses what you have. If the existing setup is solid, the work can build on it; if it is fragmented or uses consumer accounts, a clean migration can be scoped.",
  },
  {
    question: "What is Genesis CRM, and do I need it?",
    answer:
      "Genesis CRM is the optional CRM and marketing automation layer for pipelines, campaigns, booking, and follow-up. It is available with Professional and Enterprise; Foundation clients may not need it yet.",
  },
  {
    question: "How fast can I be up and running?",
    answer:
      "Core provisioning typically completes within days. Migrations, CRM buildout, and custom AI workflows are scoped during the consultation so the timeline is clear before work begins.",
  },
  {
    question: "Is this a one-time project or an ongoing service?",
    answer:
      "It is ongoing. Monthly pricing covers the agreed provisioning and setup plus continuous management, including monitoring, support, and improving automations as the business changes.",
  },
] as const;

// No verified testimonials, client results, or publishable case studies were
// present in the supplied Genesis snapshot. The UI renders proof only when
// this typed collection contains approved, attributable material.
export const proofItems: ProofItem[] = [];

export const routes = [
  "",
  "/solutions",
  "/how-it-works",
  "/pricing",
  "/results",
  "/about",
  "/contact",
] as const;
