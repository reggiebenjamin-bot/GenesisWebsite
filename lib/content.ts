export type NavItem = { label: string; href: string };

export type SystemLayer = {
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  details: string[];
};

export type PricingPlan = {
  slug: "foundation" | "growth" | "flagship";
  name: string;
  price: string;
  cadence: string;
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
  { number: "02", title: "Discovery", description: "Genesis maps the tools, data flow, and workflow gaps, then returns a written scope and implementation roadmap." },
  { number: "03", title: "Implementation", description: "The foundation, Applied AI workflows, integrations, and optional CRM are provisioned and connected around the operation." },
  { number: "04", title: "Launch", description: "The platform goes into daily use with focused adoption, validation, and Genesis still accountable for what happens next." },
  { number: "05", title: "Managed Platform", description: "Genesis keeps the system supported, current, and improving as volume, responsibilities, and priorities change." },
] as const;

export const audiences = [
  { title: "Broker-owners", outcome: "Keep files, follow-up, and handoffs moving without becoming the bottleneck.", description: "Connect producer activity, documents, communication, and pipeline oversight in one managed operating environment." },
  { title: "Lending principals", outcome: "Create usable context across a document-heavy operation.", description: "Synthesize borrower, property, communication, and workflow signals so the next action is clearer and more consistent." },
  { title: "Acquisitions & builders", outcome: "Move opportunities from intake to decision with fewer manual gaps.", description: "Structure deal flow, diligence, vendor communication, documents, and decision support around the way the team already works." },
  { title: "Solo operators", outcome: "Build the foundation before growth makes the gaps expensive.", description: "Start with professional infrastructure and focused automation, then add platform depth as the operation expands." },
] as const;

export const implementationPlans: PricingPlan[] = [
  {
    slug: "foundation", name: "Foundation", price: "$1,500–$2,500", cadence: "one-time",
    audience: "For a solo operator or small team establishing a dependable operating foundation.",
    features: ["Microsoft 365 foundation provisioning", "Business email, identity, and documents", "Core platform configuration", "Focused workflow implementation"],
  },
  {
    slug: "growth", name: "Growth", price: "$5,000–$9,500", cadence: "one-time",
    audience: "For an owner-led operation ready to connect its data, workflows, and team.",
    features: ["Everything in Foundation", "Applied AI workflow build", "Data synthesis across key systems", "Genesis CRM when needed", "Deeper integrations and adoption"], featured: true,
  },
  {
    slug: "flagship", name: "Flagship", price: "$15,000–$35,000", cadence: "one-time",
    audience: "For larger or more complex operations requiring a broader platform build.",
    features: ["Everything in Growth", "Multiple operational workflows", "Custom AI agents and integrations", "Multi-team implementation", "Expanded governance and launch support"],
  },
];

export const managedPlatformPlans: PricingPlan[] = [
  {
    slug: "foundation", name: "Foundation", price: "$297–$497", cadence: "/month",
    audience: "Ongoing management for a focused operating foundation.",
    features: ["Monitoring and support", "Platform maintenance", "Core workflow refinement", "Planned operating reviews"],
  },
  {
    slug: "growth", name: "Growth", price: "$897–$1,497", cadence: "/month",
    audience: "Continuous management for a growing, owner-led deal operation.",
    features: ["Everything in Foundation", "Applied AI workflow tuning", "Integration oversight", "CRM and data-flow management", "Continuous improvement"], featured: true,
  },
  {
    slug: "flagship", name: "Flagship", price: "$1,997–$4,500", cadence: "/month",
    audience: "A typical range for larger operations; complex scopes may run higher.",
    features: ["Everything in Growth", "Broader workflow portfolio", "Custom agent monitoring", "Priority operating support", "Multi-team platform improvement"],
  },
];

export const pricingPlans = managedPlatformPlans;

export const faqs = [
  { question: "How is Genesis different from an AI CRM?", answer: "A CRM is one possible layer. Genesis is the broader Applied AI platform connecting infrastructure, operational data, workflows, integrations, and ongoing management. If your existing CRM works, Genesis can build around it." },
  { question: "Why is there no self-serve signup?", answer: "The value comes from fitting the platform to the way your operation actually moves information and work. Genesis scopes, implements, and manages that environment with you rather than handing over another tool to configure." },
  { question: "What is the difference between the consultation and Discovery?", answer: "The consultation is a free fit conversation. Discovery is a paid, deliverable-bearing assessment that maps your operation and produces a written scope and roadmap you keep either way." },
  { question: "Do I have to complete a Pilot before Implementation?", answer: "No. A Pilot is optional and is most useful when a larger or more complex operation wants to validate one workflow on real data before committing to the broader build." },
  { question: "What if I am not sure which tier fits?", answer: "That is what the consultation is for. Team size matters, but workflow complexity, number of systems, data quality, and support requirements determine the right scope inside the published range." },
  { question: "What happens above Flagship?", answer: "Multi-brand, multi-location, and high-transaction-volume operations are scoped as an Enterprise Managed Partnership around their actual operating requirements." },
] as const;

export const proofItems: ProofItem[] = [];

export const routes = ["", "/solutions", "/how-it-works", "/pricing", "/results", "/about", "/contact"] as const;
