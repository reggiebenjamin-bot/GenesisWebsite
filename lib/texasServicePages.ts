import { FUNDING_LINE } from "./legal.ts";
import type { TexasLanding } from "./texasPages.ts";

/*
 * Texas service business landing pages: a hub and seven trade pages. Every
 * capability named here is one Genesis already shows on /business and
 * /ai-employees: calls answered, questions answered from approved
 * information, open times offered, appointments confirmed, quotes followed
 * up, and anything that needs a person routed to a person. Nothing is
 * invented: no stats, no client counts, no testimonials, no real estate or
 * lending claims. Visitor copy has no dashes or emoji.
 */

const HUB = "/texas/service-businesses";

const COST = {
  question: "What do the plans cost?",
  answer:
    "Levels are $750, $1,750 and $4,500 a month, each with a one time setup fee of $500, $1,500 and $10,000. See the pricing page for what each Level covers.",
};

const APPROVAL = {
  question: "Does a person approve what goes out?",
  answer:
    "Yes. Genesis drafts the follow up and a person on your team approves what goes out under your name.",
};

const EXISTING = {
  question: "Do I have to replace my phone, calendar or CRM?",
  answer:
    "No. Genesis reviews your current setup first and keeps the systems that work. The goal is a better connected operation, not a replacement for its own sake.",
};

const missedCallFaq = (who: string) => ({
  question: "Does Genesis text back a missed call?",
  answer: `Yes. When a call to your ${who} goes unanswered, Genesis texts the caller back so the missed call becomes a conversation. A person on your team handles anything beyond the wording you set up together.`,
});

const reviewFaq = (who: string) => ({
  question: "Can Genesis ask my customers for Google reviews?",
  answer: `Yes. After a job, Genesis sends a request for a Google review on behalf of your ${who}, so asking happens every time instead of when someone remembers.`,
});

const customFaq = (process: string) => ({
  question: "Can Genesis build something specific to how we work?",
  answer: `Yes. Genesis builds custom workflows around your own process, including ${process}. Tell us what your team does by hand today and we build it.`,
});

const capabilities = (job: string) =>
  [
    {
      title: "Missed call text back",
      body: "When a call goes unanswered, the caller gets a text right away, so a missed call turns into a conversation instead of a lost job.",
    },
    {
      title: "Google review requests",
      body: `After each ${job}, Genesis asks the customer for a Google review, every time, without your team having to remember.`,
    },
    {
      title: "Calls, quotes and appointments",
      body: "Callers get answers from information you approve, open times are offered, quotes are followed up and appointments are confirmed.",
    },
  ] as const;

const TRADES = [
  { label: "HVAC", href: "/texas/hvac" },
  { label: "Plumbing", href: "/texas/plumbing" },
  { label: "Roofing", href: "/texas/roofing" },
  { label: "Electrical", href: "/texas/electrical" },
  { label: "Landscaping", href: "/texas/landscaping" },
  { label: "Cleaning", href: "/texas/cleaning" },
  { label: "Contractors", href: "/texas/contractors" },
] as const;

const CITIES = [
  { label: "San Antonio", href: "/texas/san-antonio" },
  { label: "Dallas Fort Worth", href: "/texas/dfw" },
  { label: "Houston", href: "/texas/houston" },
  { label: "Austin", href: "/texas/austin" },
] as const;

const CTAS = [
  { label: "Start a consultation", href: "/assessment" },
  { label: "See pricing", href: "/pricing" },
  { label: "See Genesis Business", href: "/business" },
] as const;

type Trade = {
  slug: string;
  label: string;
  /** Used in the title, so keep the whole title under 48 characters. */
  title: string;
  description: string;
  headline: string;
  lede: string;
  points: readonly [string, string, string];
  /** The visit, in the trade's words, for the review request line. */
  job: string;
  /** Who the missed call and review FAQs name, such as "HVAC company". */
  who: string;
  /** What a custom workflow could cover for this trade, in plain words. */
  process: string;
  /** The custom workflow line under the capabilities. */
  custom: string;
  faqs: readonly { question: string; answer: string }[];
};

const trades: readonly Trade[] = [
  {
    slug: "hvac",
    job: "service visit",
    who: "HVAC company",
    process: "your estimate, dispatch and maintenance reminder steps",
    custom: "Genesis also builds custom workflows around how your HVAC company runs its own estimates, dispatch and maintenance follow up.",
    label: "HVAC",
    title: "AI for Texas HVAC Companies",
    description:
      "Genesis is software for Texas HVAC companies. Missed calls get a text back, estimates get followed up, visits get confirmed and Google reviews get requested.",
    headline: "Software that answers the call for your HVAC company.",
    lede: "When your technicians are on a roof or in an attic, the phone still rings. Genesis answers callers, offers open times, confirms service visits and follows up on estimates, so a customer is not left waiting.",
    points: ["Calls answered while crews work", "Estimates followed up", "Service visits confirmed"],
    faqs: [
      {
        question: "What does Genesis do for an HVAC company?",
        answer:
          "Genesis answers common caller questions from information you approve, offers open times, confirms service visits and follows up on estimates. Anything that needs a person goes to a person on your team.",
      },
      {
        question: "What happens with an urgent call in a heat wave?",
        answer:
          "You decide what counts as urgent when Genesis is set up. Those calls are routed to a person on your team instead of waiting in a queue.",
      },
      COST,
      APPROVAL,
      EXISTING,
    ],
  },
  {
    slug: "plumbing",
    job: "job",
    who: "plumbing company",
    process: "your quote, callback and after job steps",
    custom: "Genesis also builds custom workflows around how your plumbing company runs its own quotes, callbacks and after job follow up.",
    label: "Plumbing",
    title: "AI for Texas Plumbing Companies",
    description:
      "Genesis is software for Texas plumbing companies. Missed calls get a text back, quotes get followed up, and Google reviews get requested after each job.",
    headline: "Software that picks up and follows up for your plumbing company.",
    lede: "A plumber under a sink cannot answer the phone. Genesis answers callers from the information you approve, offers open times, follows up on quotes and routes urgent calls to a person.",
    points: ["Callers get an answer and a time", "Quotes followed up", "Urgent calls routed to a person"],
    faqs: [
      {
        question: "What does Genesis do for a plumbing company?",
        answer:
          "Genesis answers callers, offers open times, confirms appointments and follows up on quotes. Anything that needs a person goes to a person on your team.",
      },
      {
        question: "Who handles a burst pipe call?",
        answer:
          "A person on your team. You set what counts as urgent, and Genesis routes those calls to a person instead of handling them on its own.",
      },
      COST,
      APPROVAL,
      EXISTING,
    ],
  },
  {
    slug: "roofing",
    job: "inspection or job",
    who: "roofing company",
    process: "your inspection, quote and storm season follow up steps",
    custom: "Genesis also builds custom workflows around how your roofing company runs its own inspections, quotes and storm season follow up.",
    label: "Roofing",
    title: "AI for Texas Roofing Companies",
    description:
      "Genesis is software for Texas roofing companies. Missed calls get a text back, quotes get followed up, inspections get confirmed and Google reviews get requested.",
    headline: "Software that follows up on every roofing inquiry.",
    lede: "After a storm the calls and form fills arrive all at once. Genesis answers each inquiry, offers inspection times, confirms appointments and follows up on every quote so none of them go quiet.",
    points: ["Every inquiry answered", "Quotes followed up", "Inspections confirmed"],
    faqs: [
      {
        question: "What does Genesis do for a roofing company?",
        answer:
          "Genesis answers inquiries from information you approve, offers inspection times, confirms appointments and follows up on quotes. A person on your team handles anything that needs judgment.",
      },
      {
        question: "Can Genesis keep up when many inquiries arrive at once?",
        answer:
          "Genesis keeps every inquiry in one pipeline with a next step, so a busy week does not leave a customer without a reply. Your team still approves what goes out.",
      },
      COST,
      APPROVAL,
      EXISTING,
    ],
  },
  {
    slug: "electrical",
    job: "job",
    who: "electrical company",
    process: "your quote, scheduling and after job steps",
    custom: "Genesis also builds custom workflows around how your electrical company runs its own quotes, scheduling and after job follow up.",
    label: "Electrical",
    title: "AI for Texas Electrical Contractors",
    description:
      "Genesis is software for Texas electrical contractors. Missed calls get a text back, quotes get followed up and Google reviews get requested after each job.",
    headline: "Software that answers and follows up for electrical contractors.",
    lede: "Electricians spend the day on job sites, not at a desk. Genesis answers callers, offers open times, follows up on quotes and confirms visits, and hands anything complicated to a person.",
    points: ["Calls answered on job days", "Quotes followed up", "Job visits confirmed"],
    faqs: [
      {
        question: "What does Genesis do for an electrical contractor?",
        answer:
          "Genesis answers callers, offers open times, confirms job visits and follows up on quotes. Anything that needs a licensed person's judgment goes to a person on your team.",
      },
      {
        question: "Does Genesis give technical or safety advice?",
        answer:
          "No. Genesis answers from the information you approve and sends technical questions to a person on your team.",
      },
      COST,
      APPROVAL,
      EXISTING,
    ],
  },
  {
    slug: "landscaping",
    job: "visit",
    who: "landscaping company",
    process: "your estimate, recurring visit and renewal steps",
    custom: "Genesis also builds custom workflows around how your landscaping company runs its own estimates, recurring visits and renewals.",
    label: "Landscaping",
    title: "AI for Texas Landscaping Companies",
    description:
      "Genesis is software for Texas landscaping companies. Missed calls get a text back, quotes get followed up and Google reviews get requested after each visit.",
    headline: "Software that keeps landscaping quotes and visits moving.",
    lede: "Lawn and landscape requests come in through calls, texts and forms while crews are in the field. Genesis answers them, offers open times, follows up on quotes and confirms visits.",
    points: ["Requests answered", "Quotes followed up", "Visits and estimates confirmed"],
    faqs: [
      {
        question: "What does Genesis do for a landscaping company?",
        answer:
          "Genesis answers requests from information you approve, offers open times, confirms estimates and visits, and follows up on quotes. A person on your team handles anything that needs a decision.",
      },
      {
        question: "Can Genesis help with quotes that never got an answer?",
        answer:
          "Yes. Quoted work stays in your pipeline with a next step, and Genesis drafts the follow up for your approval.",
      },
      COST,
      APPROVAL,
      EXISTING,
    ],
  },
  {
    slug: "cleaning",
    job: "cleaning",
    who: "cleaning company",
    process: "your quote, recurring schedule and rebooking steps",
    custom: "Genesis also builds custom workflows around how your cleaning company runs its own quotes, recurring schedules and rebooking.",
    label: "Cleaning",
    title: "AI for Texas Cleaning Companies",
    description:
      "Genesis is software for Texas cleaning companies. Missed calls get a text back, quotes get followed up and Google reviews get requested after each cleaning.",
    headline: "Software that books and confirms for your cleaning company.",
    lede: "Cleaning customers pick whoever replies first. Genesis answers each request, offers open times, follows up on quotes and confirms the cleaning so your office is not stuck in phone tag.",
    points: ["New requests answered", "Quotes followed up", "Cleanings scheduled and confirmed"],
    faqs: [
      {
        question: "What does Genesis do for a cleaning company?",
        answer:
          "Genesis answers requests, offers open times, books and confirms cleanings, and follows up on quotes. A person on your team handles anything that needs a decision.",
      },
      {
        question: "Can Genesis handle rescheduling?",
        answer:
          "Genesis can move and confirm appointments from the open times you set, and it routes anything unusual to a person on your team.",
      },
      COST,
      APPROVAL,
      EXISTING,
    ],
  },
  {
    slug: "contractors",
    job: "project",
    who: "contracting company",
    process: "your bid, walkthrough and project close out steps",
    custom: "Genesis also builds custom workflows around how your contracting company runs its own bids, walkthroughs and project close out.",
    label: "Contractors",
    title: "AI for Texas General Contractors",
    description:
      "Genesis is software for Texas general contractors. Missed calls get a text back, bids get followed up and Google reviews get requested after each project.",
    headline: "Software that follows up on every bid for contractors.",
    lede: "General contractors and remodelers lose work when a bid goes quiet. Genesis answers inquiries, offers walkthrough times, follows up on every bid and keeps each job in one pipeline.",
    points: ["Inquiries answered", "Bids followed up", "Site visits confirmed"],
    faqs: [
      {
        question: "What does Genesis do for a general contractor?",
        answer:
          "Genesis answers inquiries from information you approve, offers walkthrough times, confirms site visits and follows up on bids. A person on your team handles scope and pricing decisions.",
      },
      {
        question: "Does Genesis write or price bids?",
        answer:
          "No. You and your team price the work. Genesis keeps the bid in your pipeline and drafts the follow up for your approval.",
      },
      COST,
      APPROVAL,
      EXISTING,
    ],
  },
];

const hub: TexasLanding = {
  path: HUB,
  title: "AI for Texas Service Businesses",
  description:
    "Genesis is software for Texas service businesses. Calls get answered, missed calls get a text back, quotes get followed up and Google reviews get requested.",
  label: "Service businesses",
  parent: "/texas",
  eyebrow: "Texas service businesses",
  headline: "Software that answers the call for Texas service businesses.",
  lede: "HVAC, plumbing, roofing, electrical, landscaping, cleaning and contracting teams use Genesis so calls get answered, missed calls get a text back, quotes get followed up and Google reviews get requested while the crew is working.",
  points: ["Calls answered", "Quotes followed up", "Appointments confirmed"],
  ctas: [...CTAS],
  related: [{ label: "Texas", href: "/texas" }, ...TRADES, ...CITIES],
  faqs: [
    {
      question: "What does Genesis do for a service business?",
      answer:
        "Genesis answers callers from information you approve, offers open times, confirms appointments and follows up on quotes. Anything that needs a person goes to a person on your team.",
    },
    {
      question: "Which Texas service businesses is Genesis for?",
      answer:
        "Genesis is built for owners and operators across Texas, including HVAC, plumbing, roofing, electrical, landscaping, cleaning and general contracting companies.",
    },
    missedCallFaq("business"),
    reviewFaq("business"),
    customFaq("the steps your team does by hand today"),
    COST,
    APPROVAL,
    EXISTING,
  ],
  capabilities: capabilities("job"),
  custom:
    "Genesis also builds custom workflows around the way your trade runs its own process, whatever the trade.",
  pricing: true,
  disclaimer: FUNDING_LINE,
};

export const texasServiceLandings: readonly TexasLanding[] = [
  hub,
  ...trades.map(
    (trade): TexasLanding => ({
      path: `/texas/${trade.slug}`,
      title: trade.title,
      description: trade.description,
      label: trade.label,
      parent: HUB,
      eyebrow: `Texas ${trade.label}`,
      headline: trade.headline,
      lede: trade.lede,
      points: trade.points,
      ctas: [...CTAS],
      related: [
        { label: "Texas service businesses", href: HUB },
        { label: "Texas", href: "/texas" },
        ...TRADES.filter((item) => item.href !== `/texas/${trade.slug}`),
        ...CITIES,
      ],
      faqs: [
        ...trade.faqs.slice(0, 2),
        missedCallFaq(trade.who),
        reviewFaq(trade.who),
        customFaq(trade.process),
        ...trade.faqs.slice(2),
      ],
      capabilities: capabilities(trade.job),
      custom: trade.custom,
      pricing: true,
      disclaimer: FUNDING_LINE,
    }),
  ),
];
