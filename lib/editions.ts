/*
 * The Genesis OS editions: the homepage chapter three cards and the four
 * edition landing pages read from here, so the card copy and the landing copy
 * cannot drift. Genesis sells software; this file carries no funding, buying,
 * selling or listing language.
 *
 * Lending keeps its own page (app/(marketing)/lending) and its own CTAs in
 * lib/lendingPage.ts. The other three editions build their pages from the
 * landing fields below. CTA URLs are internal routes only: every edition
 * points to the assessment, then to its pricing page.
 *
 * No path aliases in this file: tests import it directly under Node.
 */

import { FUNDING_LINE } from "./legal.ts";
import { editionPricing } from "./editionPlans.ts";

export type EditionCta = {
  label: string;
  /** An internal route or an existing external destination. */
  href: string;
};

export type Edition = {
  no: string;
  /** The homepage card destination and, for the three built here, the page path. */
  href: string;
  name: string;
  /** The landing page eyebrow and the homepage card label. */
  eyebrow: string;
  /** The landing page headline. */
  headline: string;
  /** The homepage card body and the landing page lede. */
  body: string;
  points: readonly [string, string, string];
  /** The landing page calls to action. */
  ctas: readonly EditionCta[];
  disclaimer: string;
};

export const editions: readonly Edition[] = [
  {
    no: "01",
    href: "/lending",
    name: "Genesis Lending",
    eyebrow: "Genesis Lending",
    headline: "Software that helps lending teams move faster on every borrower inquiry.",
    body: "For loan officers and capital matchers. Every inquiry gets a fast first reply, document requests are tracked, and files never stall quietly.",
    points: ["Instant first reply", "Document follow up", "File status in one view"],
    ctas: [
      { label: "Assess my business", href: "/assessment" },
      { label: "See Lending Edition pricing", href: editionPricing.lending.pricingPath },
    ],
    disclaimer: FUNDING_LINE,
  },
  {
    no: "02",
    href: "/real-estate",
    name: "Genesis Real Estate Pros",
    eyebrow: "Genesis Real Estate Pros",
    headline: "Software that works every buyer and seller lead the same day.",
    body: "For agents, investors and teams. Seller and buyer leads get worked the same day, showings get booked, and the deal board stays current.",
    points: ["Same day lead response", "Showings booked", "Live deal board"],
    ctas: [
      { label: "Assess my business", href: "/assessment" },
      { label: "See Real Estate Edition pricing", href: editionPricing.real_estate.pricingPath },
    ],
    disclaimer: FUNDING_LINE,
  },
  {
    no: "03",
    href: "/business",
    name: "Genesis Business",
    eyebrow: "Genesis Business",
    headline: "Software that answers the call and follows up for your business.",
    body: "For any service business: contractors, clinics, law offices, home services and agencies. Calls answered, quotes followed up, appointments confirmed.",
    points: ["Calls answered", "Quotes followed up", "Appointments confirmed"],
    ctas: [
      { label: "Assess my business", href: "/assessment" },
      { label: "See pricing", href: "/pricing#custom-infrastructure" },
      { label: "Talk to us", href: "/contact" },
    ],
    disclaimer: FUNDING_LINE,
  },
  {
    no: "04",
    href: "/enterprise",
    name: "Genesis Enterprise",
    eyebrow: "Genesis Enterprise",
    headline: "Software that connects your operation across every location.",
    body: "For multi location operations. Your systems connected, custom workflows, access controls and a managed build that keeps running.",
    points: ["Custom workflows", "Systems connected", "Managed every month"],
    ctas: [
      { label: "Assess my business", href: "/assessment" },
      { label: "See pricing", href: "/pricing" },
      { label: "Talk to us", href: "/contact" },
    ],
    disclaimer: FUNDING_LINE,
  },
] as const;

export function editionByPath(path: string): Edition | undefined {
  return editions.find((edition) => edition.href === path);
}
