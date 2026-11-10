/*
 * The Genesis Lending page: its copy, its two calls to action (the assessment, then Lending Edition pricing), and the shared
 * funding line in one place. The page and its tests read from here, so the
 * visitor copy and the CTA URLs cannot drift. Genesis sells software; this
 * file carries no funding, placement or lending language.
 */

import { FUNDING_LINE } from "./legal.ts";

export type LendingCta = {
  label: string;
  /** An internal route on geai.us. */
  href: string;
};

export const lendingPage = {
  eyebrow: "Genesis Lending",
  headline: "Software that helps lending teams move faster on every borrower inquiry.",
  lede:
    "Brokers and lender desks use Genesis to capture, qualify and follow up with borrower inquiries faster, so no inquiry sits waiting for a reply.",
  benefits: [
    "AI follow up that reaches every borrower inquiry quickly and keeps the conversation moving.",
    "Guided intake that gathers what each borrower inquiry needs in one clean pass.",
    "A pipeline organized so every borrower inquiry has a clear owner and a clear next step.",
  ],
  ctas: {
    primary: {
      label: "Assess my business",
      href: "/assessment",
    },
    secondary: {
      label: "See Lending Edition pricing",
      href: "/packs/lending/pricing",
    },
  },
  disclaimer: FUNDING_LINE,
} as const satisfies {
  eyebrow: string;
  headline: string;
  lede: string;
  benefits: readonly string[];
  ctas: { primary: LendingCta; secondary: LendingCta };
  disclaimer: string;
};
