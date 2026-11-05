/*
 * The Real Estate Pros pack: its copy, its two tiers, and every price and
 * setup fee in one place. A change to a monthly price or a setup fee is one
 * edit here, and the page, the metadata and the tests all read from it, so
 * they cannot drift. Checkout and signup live on the signup app the CTAs
 * point at; this file carries no Stripe or payment code.
 */

export type RealEstatePackTier = {
  id: "agent" | "team";
  name: string;
  tagline: string;
  /** The monthly price, as a number and as it reads on the page. */
  monthlyUsd: number;
  priceDisplay: string;
  cadence: string;
  /** The one-time setup fee, as a number and as it reads on the page. */
  setupUsd: number;
  setupDisplay: string;
  setupLabel: string;
  features: readonly string[];
  cta: string;
  /** The external checkout URL for this tier. */
  href: string;
};

export const realEstatePack = {
  eyebrow: "Real Estate Pros pricing",
  headline: "One closed listing pays for the plan.",
  lede:
    "You run the deals. Genesis captures and routes every buyer and seller lead the moment it lands, so speed to lead is on your side.",
  footer: "Genesis is software. We do not buy, sell or list property.",
  tiers: [
    {
      id: "agent",
      name: "Agent",
      tagline: "For the agent who wants every lead answered fast.",
      monthlyUsd: 497,
      priceDisplay: "$497",
      cadence: "per month",
      setupUsd: 500,
      setupDisplay: "$500",
      setupLabel: "plus $500 setup",
      features: [
        "Every buyer and seller lead captured",
        "Guided first touch and follow up",
        "Clean buyer and seller lanes",
        "Sample board with fictional data",
      ],
      cta: "Start checkout",
      href: "https://genesisaisolutions.cloud/packs/real_estate/checkout?tier=Agent",
    },
    {
      id: "team",
      name: "Team",
      tagline: "For the team running buyer and seller lanes at volume.",
      monthlyUsd: 997,
      priceDisplay: "$997",
      cadence: "per month",
      setupUsd: 1500,
      setupDisplay: "$1,500",
      setupLabel: "plus $1,500 setup",
      features: [
        "Everything in Agent",
        "Call scripts for every stage",
        "Team roles and routing rules",
        "Priority onboarding and configuration",
      ],
      cta: "Start checkout",
      href: "https://genesisaisolutions.cloud/packs/real_estate/checkout?tier=Team",
    },
  ],
} as const satisfies {
  eyebrow: string;
  headline: string;
  lede: string;
  footer: string;
  tiers: readonly RealEstatePackTier[];
};
