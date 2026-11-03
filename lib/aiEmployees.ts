
/** Dedicated phone line shown beside Reginald Benjamin. */
export const expertPhone = {
  display: "(469) 210 8466",
  href: "+14692108466",
} as const;

export const softwareDisclaimer =
  "Genesis is software. We do not lend, place or arrange funding.";

export const aiEmployeesHero = {
  eyebrow: "Genesis AI Employees",
  title: "AI employees that work your pipeline every day.",
  accent: "every day.",
  summary:
    "Hawk leads operations. Susan runs marketing. Darius works sales and prospecting. Ava covers the front desk and scheduling.",
  teamAction: "Meet the team",
  pricingAction: "See pricing",
} as const;

export const aiEmployeesTeam = {
  eyebrow: "The team",
  title: "Meet the team.",
  summary:
    "Each employee has daily work on the pipeline and the outcomes that work is there to produce.",
  dailyWorkLabel: "Daily work",
  outcomesLabel: "Outcomes",
} as const;

export type AiEmployeePersona = {
  id: "hawk" | "susan" | "darius" | "ava";
  name: string;
  role: string;
  dailyWork: string;
  outcomes: string;
};

export const aiEmployeePersonas: readonly AiEmployeePersona[] = [
  {
    id: "hawk",
    name: "Hawk",
    role: "Lead and ops AI employee",
    dailyWork:
      "Hawk watches the pipeline each day. New leads get a next step, stalled work comes back into view, and handoffs between marketing, sales, and the front desk stay visible.",
    outcomes:
      "The pipeline keeps moving. Every lead has an owner for the next action, and quiet work is visible before the day ends.",
  },
  {
    id: "susan",
    name: "Susan",
    role: "AI marketing employee",
    dailyWork:
      "Susan prepares the marketing work for the day. She drafts messages from facts you approve, lines up follow up, and keeps a record of what was sent and who replied.",
    outcomes:
      "Outreach goes out on a steady rhythm. Messages stay tied to the facts you supply, and the team can see which ones drew a reply.",
  },
  {
    id: "darius",
    name: "Darius",
    role: "AI sales and prospecting employee",
    dailyWork:
      "Darius works the prospect list you provide. He drafts first contact and follow up, logs replies, and marks the people who are ready for a person to call.",
    outcomes:
      "Prospecting continues every day. Conversations are prepared before someone on the team steps in, and contacted people stay in the pipeline.",
  },
  {
    id: "ava",
    name: "Ava",
    role: "Front desk and scheduling",
    dailyWork:
      "Ava covers the front desk. She answers common questions from approved information, offers open times, confirms appointments, and routes anything that needs a person.",
    outcomes:
      "The desk stays covered through the workday. Appointments are booked, moved, and reminded, and callers reach the right person.",
  },
];

export const aiEmployeesPricing = {
  eyebrow: "Pricing",
  title: "Three plans, and Done For You.",
  summary:
    "Single and Duo are the employees you choose. Full Fleet is Hawk, Susan, and Darius. Done For You sits under Enterprise.",
} as const;

export type CheckoutPlanId = "single" | "duo" | "fleet";

export type AiEmployeePlan = {
  id: CheckoutPlanId;
  name: string;
  priceDisplay: string;
  monthlyPriceUsd: number;
  cadence: string;
  summary: string;
  detail: string;
  action: string;
};

export const aiEmployeePlans: readonly AiEmployeePlan[] = [
  {
    id: "single",
    name: "Single",
    priceDisplay: "$697",
    monthlyPriceUsd: 697,
    cadence: "a month",
    summary: "One AI employee of your choice, working your pipeline every day.",
    detail: "Choose Hawk, Susan, Darius, or Ava.",
    action: "Choose Single",
  },
  {
    id: "duo",
    name: "Duo",
    priceDisplay: "$1,497",
    monthlyPriceUsd: 1497,
    cadence: "a month",
    summary: "Two AI employees of your choice, working your pipeline every day.",
    detail: "Pair any two, including Ava.",
    action: "Choose Duo",
  },
  {
    id: "fleet",
    name: "Full Fleet",
    priceDisplay: "$2,997",
    monthlyPriceUsd: 2997,
    cadence: "a month",
    summary: "Hawk, Susan, and Darius, working the pipeline together every day.",
    detail: "The lead, the marketing employee, and the sales employee.",
    action: "Choose Full Fleet",
  },
];

export const aiEmployeesEnterprise = {
  eyebrow: "Enterprise",
  name: "Done For You",
  priceLine: "$15,000 setup plus $2,500 a month.",
  setupDisplay: "$15,000",
  setupUsd: 15000,
  setupUnit: "setup",
  monthlyDisplay: "$2,500",
  monthlyPriceUsd: 2500,
  cadence: "a month",
  summary: "Genesis sets the employees up inside the operation and keeps them running.",
  formTitle: "Tell us about the operation.",
  nameLabel: "Name",
  emailLabel: "Email",
  phoneLabel: "Phone",
  companyLabel: "Company",
  messageLabel: "What should the employees cover",
  submit: "Send the inquiry",
  sending: "Sending",
} as const;

export const aiEmployeesExpert = {
  eyebrow: "The expert",
  name: "Reginald Benjamin",
  role: "Founder of Genesis",
  jobTitle: "Founder",
  body: "Reginald Benjamin founded Genesis. He works with real estate teams that want AI employees on the daily work of the pipeline, from the first lead through follow up, scheduling, and the handoff to a person.",
  phoneLabel: "Phone",
} as const;

export const aiEmployeesCta = {
  eyebrow: "Next step",
  title: "Put an AI employee on the pipeline.",
  line: "Choose a plan, or ask Genesis to set the employees up for you.",
  plansAction: "See the plans",
  enterpriseAction: "Request Done For You",
} as const;

export const aiEmployeesHome = {
  eyebrow: "AI Employees",
  title: "AI employees that work your pipeline every day.",
  accent: "every day.",
  summary:
    "Hawk, Susan, Darius, and Ava take the daily work of the pipeline: operations, marketing, sales, and the front desk.",
  action: "Meet the team",
} as const;

export const checkoutMessages = {
  success: "Checkout brought you back. Genesis confirms the plan after Stripe reports the payment.",
  closed: "Checkout closed before payment.",
  unavailable: "Checkout for this plan is not open yet.",
  error: "Checkout could not be opened. Email info@geai.us and we will help.",
} as const;

export const inquiryMessages = {
  sent: "Your inquiry is in. We will reply at the email you gave us.",
  invalid: "Check your name, email, and phone, then send the inquiry again.",
  unconfigured: "This inquiry form is not open yet. Email info@geai.us or call the number on this page.",
} as const;

export type CheckoutMessage = keyof typeof checkoutMessages;
export type InquiryMessage = keyof typeof inquiryMessages;

const copyRoots = [
  softwareDisclaimer,
  aiEmployeesHero,
  aiEmployeesTeam,
  aiEmployeePersonas,
  aiEmployeesPricing,
  aiEmployeePlans,
  aiEmployeesEnterprise,
  aiEmployeesExpert,
  aiEmployeesCta,
  aiEmployeesHome,
  checkoutMessages,
  inquiryMessages,
  expertPhone.display,
];

/** Visitor facing sentences. Paths, env names, and phone hrefs stay out. */
export function aiEmployeePublicCopy(): string[] {
  const sentences: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === "string") {
      sentences.push(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (value && typeof value === "object") {
      for (const [key, inner] of Object.entries(value)) {
        if (key === "id" || key === "href") continue;
        walk(inner);
      }
    }
  };
  copyRoots.forEach(walk);
  return sentences;
}
