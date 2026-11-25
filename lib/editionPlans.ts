/*
 * The editions of the three Genesis Levels: Business, Real Estate, and
 * Lending. Every price, setup fee and user limit comes from managedPlans in
 * offers.ts, so an edition can never show a number the Levels do not. Only
 * the edition bullets live here, drawn from the existing Business, Real
 * Estate Pros, and Lending copy. Every buy button posts to the managed
 * checkout for that Level with the edition passed along. The same three
 * Stripe prices are reused. No new products or prices.
 *
 * No path aliases in this file: tests import it directly under Node.
 */

import { FUNDING_LINE } from "./legal.ts";
import { managedPlans, type ManagedPlan, type ManagedPlanId } from "./offers.ts";
import { CHURCH_PERSONA, personaEdition } from "./personas.ts";

export type EditionKey = "business" | "real_estate" | "lending";

export const editionKeys: readonly EditionKey[] = ["business", "real_estate", "lending"];

export function isEditionKey(value: unknown): value is EditionKey {
  return typeof value === "string" && (editionKeys as readonly string[]).includes(value);
}

export type EditionPricing = {
  key: EditionKey;
  /** The edition name as it reads on a button and a card. */
  name: string;
  /** The edition landing page. */
  landingPath: string;
  /** The edition pricing page. */
  pricingPath: string;
  eyebrow: string;
  headline: string;
  lede: string;
  /** The line under the cards. */
  footer: string;
  /** Edition bullets for each Level. */
  bullets: Record<ManagedPlanId, readonly string[]>;
  /**
   * What each Level brings, as the end of one plain sentence for the "What
   * changes between the Levels?" answer. Written by hand, with every bullet
   * of that Level in it, so the answer reads as sentences, not a joined list.
   */
  faq: Record<ManagedPlanId, string>;
};

export const editionPricing: Record<EditionKey, EditionPricing> = {
  business: {
    key: "business",
    name: "Business Edition",
    landingPath: "/business",
    pricingPath: "/business#levels",
    eyebrow: "Business Edition pricing",
    headline: "Software that answers the call and follows up for your business.",
    lede:
      "For any service business: contractors, clinics, law offices, home services and agencies. Calls answered, quotes followed up, appointments confirmed. Pick the Level that fits your team.",
    footer: FUNDING_LINE,
    bullets: {
      "managed-750": ["Calls answered", "Quotes followed up", "Appointments confirmed"],
      /* Each Level adds only what that Level is (lib/offers.ts): team routing and
         automation across workflows at Level 02, business wide infrastructure,
         all four AI employees working together and priority onboarding at Level 03. */
      "managed-1750": [
        "Everything in Level 01",
        "Team roles and routing rules",
        "Automation across workflows and handoffs",
      ],
      "managed-4500": [
        "Everything in Level 02",
        "Priority onboarding and configuration",
        "Genesis working across your connected systems",
        "All four AI employees working together",
      ],
    },
    faq: {
      "managed-750": "calls answered, quotes followed up and appointments confirmed",
      "managed-1750": "team roles and routing rules, plus automation across workflows and handoffs",
      "managed-4500":
        "priority onboarding and configuration, with Genesis working across your connected systems and all four AI employees working together",
    },
  },
  real_estate: {
    key: "real_estate",
    name: "Real Estate Edition",
    landingPath: "/real-estate",
    pricingPath: "/real-estate#levels",
    eyebrow: "Real Estate Edition pricing",
    headline: "One closed listing pays for the plan.",
    lede:
      "You run the deals. Genesis captures and routes every buyer and seller lead the moment it lands, so speed to lead is on your side. Pick the Level that fits your team.",
    footer: "Genesis is software. We do not buy, sell or list property.",
    bullets: {
      "managed-750": [
        "Every buyer and seller lead captured",
        "Guided first touch and follow up",
        "Same day lead response",
      ],
      "managed-1750": [
        "Everything in Level 01",
        "Clean buyer and seller lanes",
        "Call scripts for every stage",
        "Team roles and routing rules",
      ],
      "managed-4500": [
        "Everything in Level 02",
        "Priority onboarding and configuration",
        "Showings booked",
        "Live deal board",
      ],
    },
    faq: {
      "managed-750": "every buyer and seller lead captured, a guided first touch and follow up, and same day lead response",
      "managed-1750": "clean buyer and seller lanes, call scripts for every stage, and team roles and routing rules",
      "managed-4500": "priority onboarding and configuration, showings booked and a live deal board",
    },
  },
  lending: {
    key: "lending",
    name: "Lending Edition",
    landingPath: "/lending",
    pricingPath: "/lending#levels",
    eyebrow: "Lending Edition pricing",
    headline: "Software that helps lending teams move faster on every borrower inquiry.",
    lede:
      "Brokers and lender desks use Genesis to capture, qualify and follow up with borrower inquiries faster, so no inquiry sits waiting for a reply. Pick the Level that fits your desk.",
    footer: "Genesis is software. We do not lend, place or arrange funding.",
    bullets: {
      "managed-750": [
        "Instant first reply",
        "Guided intake for every borrower inquiry",
      ],
      "managed-1750": [
        "Everything in Level 01",
        "Document follow up",
        "Every borrower inquiry has a clear owner and a clear next step",
      ],
      "managed-4500": [
        "Everything in Level 02",
        "File status in one view",
        "AI follow up that keeps every borrower conversation moving",
      ],
    },
    faq: {
      "managed-750": "an instant first reply and guided intake for every borrower inquiry",
      "managed-1750": "document follow up, so every borrower inquiry has a clear owner and a clear next step",
      "managed-4500": "file status in one view and AI follow up that keeps every borrower conversation moving",
    },
  },
};

export type EditionLevel = {
  plan: ManagedPlan;
  bullets: readonly string[];
};

/** The three Levels of one edition, in order. */
export function editionLevels(key: EditionKey): readonly EditionLevel[] {
  return managedPlans.map((plan) => ({ plan, bullets: editionPricing[key].bullets[plan.id] }));
}

/** The edition's Levels that match an assessment persona: its own page, at #levels. */
export function pricingPathForPersona(persona: string | undefined): string {
  /* Churches get the three Ministry plans, not the business Levels. */
  if (persona === CHURCH_PERSONA) return "/ministry#levels";
  return editionPricing[personaEdition(persona) ?? "business"].pricingPath;
}

/**
 * "What changes between the Levels?" in one edition's own words, from its
 * handwritten faq lines, so a lender reads about borrower inquiries and
 * documents, never about quotes and appointments, and names like Genesis and
 * AI keep their capitals.
 */
export function levelsFaqAnswer(key: EditionKey): string {
  const { faq } = editionPricing[key];
  const [one, two, three] = managedPlans.map((plan) => ({ plan, adds: faq[plan.id] }));
  return [
    `Level 01 is one user, with ${one.adds}.`,
    `Level 02 covers ${two.plan.userLimit.toLowerCase()} and adds ${two.adds}.`,
    `Level 03 covers ${three.plan.userLimit.toLowerCase()} and adds ${three.adds}.`,
    "More than 25 users is Genesis Enterprise.",
  ].join(" ");
}
