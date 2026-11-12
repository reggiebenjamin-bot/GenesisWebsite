import { FUNDING_LINE } from "./legal.ts";
import { texasServiceLandings } from "./texasServicePages.ts";

/** A public Texas or city landing page. Visitor copy has no dashes or emoji. */
export type TexasLanding = {
  path: string;
  title: string;
  description: string;
  label: string;
  parent?: string;
  eyebrow: string;
  headline: string;
  lede: string;
  points: readonly string[];
  ctas: readonly { label: string; href: string }[];
  related: readonly { label: string; href: string }[];
  faqs: readonly { question: string; answer: string }[];
  /** The Levels edition to show, if this page should print the plan cards. */
  edition?: "real_estate" | "lending";
  /** Print the three Levels with price and setup, linking to /pricing. */
  pricing?: boolean;
  /** Capability blocks printed under the points. */
  capabilities?: readonly { title: string; body: string }[];
  /** A closing line under the capabilities. */
  custom?: string;
  disclaimer: string;
};

const PLANS = "Levels are $750, $1,750 and $4,500 a month.";
const COST_ANSWER =
  "Levels are $750, $1,750 and $4,500 a month. Genesis Tools are one time: Deal Architect is $49 per analysis, Deal Packager is $99 per package and Capital Advisor is $79 per capital plan.";
const WHAT_IS = {
  question: "What is Genesis?",
  answer:
    "Genesis is software for real estate professionals. It connects calls, inbox, CRM, calendar and pipeline, with AI employees that draft work for your approval.",
};
const COST = { question: "What do the plans cost?", answer: COST_ANSWER };
const FUNDING = {
  question: "Does Genesis lend, place or arrange funding?",
  answer: FUNDING_LINE,
};

const USE_CASES = [
  { label: "Texas investors", href: "/texas/investors" },
  { label: "Texas private lenders", href: "/texas/lenders" },
  { label: "Texas fix and flip", href: "/texas/fix-and-flip" },
] as const;

const CITIES = [
  { label: "San Antonio", href: "/texas/san-antonio" },
  { label: "Dallas Fort Worth", href: "/texas/dfw" },
  { label: "Houston", href: "/texas/houston" },
  { label: "Austin", href: "/texas/austin" },
] as const;

export const texasLandings: readonly TexasLanding[] = [
  {
    path: "/texas",
    title: "AI Software for Texas Real Estate",
    description:
      "Genesis is software for Texas real estate investors, private lenders and operators. It works the pipeline every day, and nothing goes out without your approval.",
    label: "Texas",
    eyebrow: "Texas",
    headline: "Software for Texas real estate operators.",
    lede: "Genesis helps investors, lending teams and fix and flip operators in Texas work every lead the same day and keep the deal board current.",
    points: [
      "Same day lead response",
      "Follow up drafted for your approval",
      "Live deal board",
    ],
    ctas: [
      { label: "Start a consultation", href: "/assessment" },
      { label: "See pricing", href: "/pricing" },
    ],
    related: [{ label: "Texas service businesses", href: "/texas/service-businesses" }, ...USE_CASES, ...CITIES],
    faqs: [WHAT_IS, COST, FUNDING],
    disclaimer: FUNDING_LINE,
  },
  {
    path: "/texas/investors",
    title: "AI for Texas Real Estate Investors",
    description:
      "Genesis is software for Texas real estate investors. New leads get a next step the same day, follow up is drafted for your approval, and the deal board stays current.",
    label: "Investors",
    parent: "/texas",
    eyebrow: "Texas investors",
    headline: "Software that works your investor pipeline every day.",
    lede: "Genesis is software for Texas real estate investors. New leads get a next step the same day, follow up is drafted for your approval, and the deal board stays current.",
    points: [
      "Same day lead response",
      "Follow up drafted for your approval",
      "Live deal board",
    ],
    ctas: [
      { label: "Start a consultation", href: "/assessment" },
      { label: "See Real Estate Pros", href: "/real-estate" },
      { label: "See pricing", href: "/pricing" },
    ],
    related: [{ label: "Texas", href: "/texas" }, ...CITIES, { label: "Texas private lenders", href: "/texas/lenders" }, { label: "Texas fix and flip", href: "/texas/fix-and-flip" }],
    faqs: [WHAT_IS, COST, FUNDING],
    edition: "real_estate",
    disclaimer: FUNDING_LINE,
  },
  {
    path: "/texas/lenders",
    title: "AI for Texas Private Lenders",
    description:
      "Genesis is software for Texas private lenders and lending teams. Inquiries get a fast first reply, document requests are tracked, and files do not stall quietly.",
    label: "Private lenders",
    parent: "/texas",
    eyebrow: "Texas private lenders",
    headline: "Software that helps Texas lending teams move every inquiry.",
    lede: "Brokers and lender desks use Genesis to capture, qualify and follow up with borrower inquiries faster, so no inquiry sits waiting for a reply.",
    points: [
      "Instant first reply",
      "Document follow up",
      "File status in one view",
    ],
    ctas: [
      { label: "Start a consultation", href: "/assessment" },
      { label: "See the Lending edition", href: "/lending" },
      { label: "See pricing", href: "/pricing" },
    ],
    related: [{ label: "Texas", href: "/texas" }, ...CITIES, { label: "Texas investors", href: "/texas/investors" }],
    faqs: [WHAT_IS, COST, FUNDING],
    edition: "lending",
    disclaimer: FUNDING_LINE,
  },
  {
    path: "/texas/fix-and-flip",
    title: "AI for Texas Fix and Flip Teams",
    description:
      "Genesis is software for Texas fix and flip operators. Seller leads get worked the same day, follow up is drafted for your approval, and the deal board stays current.",
    label: "Fix and flip",
    parent: "/texas",
    eyebrow: "Texas fix and flip",
    headline: "Software for Texas fix and flip operators.",
    lede: "Genesis works seller leads the same day, drafts follow up for your approval, and keeps the deal board current from the first call through the next step.",
    points: [
      "Same day seller lead response",
      "Follow up drafted for your approval",
      "Live deal board",
    ],
    ctas: [
      { label: "Start a consultation", href: "/assessment" },
      { label: "See Real Estate Pros", href: "/real-estate" },
      { label: "See pricing", href: "/pricing" },
    ],
    related: [{ label: "Texas", href: "/texas" }, ...CITIES, { label: "Texas investors", href: "/texas/investors" }],
    faqs: [WHAT_IS, COST, FUNDING],
    edition: "real_estate",
    disclaimer: FUNDING_LINE,
  },
  {
    path: "/texas/san-antonio",
    title: "AI for San Antonio Real Estate",
    description:
      "Genesis is software for real estate investors, lenders and teams in San Antonio. Leads get a next step the same day, and nothing goes out without your approval.",
    label: "San Antonio",
    parent: "/texas",
    eyebrow: "San Antonio",
    headline: "Software for real estate operators in San Antonio.",
    lede: "Genesis helps investors, lending teams and agents in San Antonio work every lead the same day and keep the deal board current.",
    points: [
      "Same day lead response",
      "Follow up drafted for your approval",
      "Live deal board",
    ],
    ctas: [
      { label: "Start a consultation", href: "/assessment" },
      { label: "See pricing", href: "/pricing" },
    ],
    related: [{ label: "Texas", href: "/texas" }, ...USE_CASES],
    faqs: [WHAT_IS, COST, FUNDING],
    disclaimer: FUNDING_LINE,
  },
  {
    path: "/texas/dfw",
    title: "AI for DFW Real Estate Operators",
    description:
      "Genesis is software for real estate investors, lenders and teams in Dallas Fort Worth. The pipeline stays in view, and follow up waits for your approval.",
    label: "Dallas Fort Worth",
    parent: "/texas",
    eyebrow: "Dallas Fort Worth",
    headline: "Software for real estate operators in Dallas Fort Worth.",
    lede: "Genesis helps investors, lending teams and agents in Dallas Fort Worth work every lead the same day and keep the deal board current.",
    points: [
      "Same day lead response",
      "Follow up drafted for your approval",
      "Live deal board",
    ],
    ctas: [
      { label: "Start a consultation", href: "/assessment" },
      { label: "See pricing", href: "/pricing" },
    ],
    related: [{ label: "Texas", href: "/texas" }, ...USE_CASES],
    faqs: [WHAT_IS, COST, FUNDING],
    disclaimer: FUNDING_LINE,
  },
  {
    path: "/texas/houston",
    title: "AI for Houston Real Estate Teams",
    description:
      "Genesis is software for real estate investors, lenders and teams in Houston. Every inquiry gets a next step, and drafts stay with you until you approve them.",
    label: "Houston",
    parent: "/texas",
    eyebrow: "Houston",
    headline: "Software for real estate operators in Houston.",
    lede: "Genesis helps investors, lending teams and agents in Houston work every lead the same day and keep the deal board current.",
    points: [
      "Same day lead response",
      "Follow up drafted for your approval",
      "Live deal board",
    ],
    ctas: [
      { label: "Start a consultation", href: "/assessment" },
      { label: "See pricing", href: "/pricing" },
    ],
    related: [{ label: "Texas", href: "/texas" }, ...USE_CASES],
    faqs: [WHAT_IS, COST, FUNDING],
    disclaimer: FUNDING_LINE,
  },
  {
    path: "/texas/austin",
    title: "AI for Austin Real Estate Teams",
    description:
      "Genesis is software for real estate investors, lenders and teams in Austin. New leads are worked the same day, and the deal board stays current.",
    label: "Austin",
    parent: "/texas",
    eyebrow: "Austin",
    headline: "Software for real estate operators in Austin.",
    lede: "Genesis helps investors, lending teams and agents in Austin work every lead the same day and keep the deal board current.",
    points: [
      "Same day lead response",
      "Follow up drafted for your approval",
      "Live deal board",
    ],
    ctas: [
      { label: "Start a consultation", href: "/assessment" },
      { label: "See pricing", href: "/pricing" },
    ],
    related: [{ label: "Texas", href: "/texas" }, ...USE_CASES],
    faqs: [WHAT_IS, COST, FUNDING],
    disclaimer: FUNDING_LINE,
  },
];

export function texasLanding(path: string): TexasLanding {
  const page = [...texasLandings, ...texasServiceLandings].find((candidate) => candidate.path === path);
  if (!page) throw new Error(`No Texas landing page for ${path}`);
  return page;
}
