export type NavItem = { label: string; href: string };

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

export const navigation: NavItem[] = [
  { label: "Agent Software", href: "/mini" },
  { label: "Custom Infrastructure", href: "/solutions" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Results", href: "/results" },
  { label: "About", href: "/about" },
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

export const processSteps = [
  { number: "01", title: "Consultation", description: "A focused, no-cost conversation about the operation, its priorities, and where work currently depends on you." },
  { number: "02", title: "Scoping", description: "Genesis recommends the implementation boundary. When complexity warrants deeper paid Discovery or a focused Pilot, that work is proposed after the consultation." },
  { number: "03", title: "Implementation", description: "The foundation, Applied AI workflows, integrations, and optional CRM are provisioned and connected around the operation." },
  { number: "04", title: "Launch", description: "The platform goes into daily use with focused adoption, validation, and support through the agreed launch boundary." },
  { number: "05", title: "Managed Platform", description: "When ongoing management is in scope, Genesis keeps the agreed system supported, current, and improving as priorities change." },
] as const;

export const audiences = [
  { title: "Broker-owners", outcome: "Keep files, follow-up, and handoffs moving without becoming the bottleneck.", description: "Connect producer activity, documents, communication, and pipeline oversight in one managed operating environment." },
  { title: "Lending principals", outcome: "Create usable context across a document-heavy operation.", description: "Synthesize borrower, property, communication, and workflow signals so the next action is clearer and more consistent." },
  { title: "Acquisitions & builders", outcome: "Move opportunities from intake to decision with fewer manual gaps.", description: "Structure deal flow, diligence, vendor communication, documents, and decision support around the way the team already works." },
  { title: "Solo operators", outcome: "Build the foundation before growth makes the gaps expensive.", description: "Start with professional infrastructure and focused automation, then add platform depth as the operation expands." },
] as const;

export const faqs = [
  { question: "What does Genesis offer?", answer: "Genesis has two separate commercial paths. G-Core Mini is being prepared as standardized subscription software for independent agents and small teams. Genesis Infrastructure is a consultation-led custom build for brokerages, lenders, acquisitions teams, and complex operators." },
  { question: "Is G-Core Mini a smaller Infrastructure engagement?", answer: "No. When released, Mini will provide bounded software access with standardized features and plan limits. Infrastructure includes assessment, customer-specific implementation, integrations, governance, adoption, and the ongoing responsibility documented in the scope." },
  { question: "Can I sign up for G-Core Mini today?", answer: "Not yet. The Mini plan model is in commercial review, and no public account creation or checkout is enabled. The Mini page explains the proposed product boundary without implying that access has been granted." },
  { question: "Does an Infrastructure build require replacing our current systems?", answer: "Not automatically. Genesis reviews the current environment first, keeps useful systems where appropriate, and scopes the foundation, workflows, integrations, and optional CRM around the actual operation." },
  { question: "Why does Infrastructure require a consultation?", answer: "The published starting prices establish a minimum entry point. The final scope depends on the systems already in place, workflow complexity, data quality, team structure, integrations, governance, and the support required after launch." },
  { question: "What does ongoing management mean?", answer: "When ongoing management is included in the agreed scope, Genesis monitors and supports the implemented environment, maintains in-scope workflows and integrations, and refines the system as the operation changes. The exact support boundary is documented in the proposal." },
] as const;

export const proofItems: ProofItem[] = [];

export const routes = ["", "/mini", "/solutions", "/how-it-works", "/pricing", "/results", "/about", "/contact"] as const;
