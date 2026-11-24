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
      { label: "Assess My Business", href: "/assessment?persona=lending" },
      { label: "See Lending Edition Pricing", href: editionPricing.lending.pricingPath },
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
      { label: "Assess My Business", href: "/assessment?persona=real-estate" },
      { label: "See Real Estate Edition Pricing", href: editionPricing.real_estate.pricingPath },
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
      { label: "Assess My Business", href: "/assessment?persona=business" },
      { label: "See Pricing", href: "/pricing#custom-infrastructure" },
      { label: "Talk to Us", href: "/contact" },
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
      { label: "Assess My Business", href: "/assessment?persona=business" },
      { label: "See Pricing", href: "/pricing" },
      { label: "Talk to Us", href: "/contact" },
    ],
    disclaimer: FUNDING_LINE,
  },
] as const;

/*
 * Edition 05, Genesis Ministry, for churches of roughly 100 to 1,000 people.
 *
 * Kept out of `editions` because those four share business rules Ministry
 * does not: the funding line, the assessment as the first step and the
 * business Levels. It is still a first class edition: `allEditions` below
 * adds it as the fifth card on the homepage, in the navigation and in the
 * footer, and the assessment recommends it to churches.
 *
 * Software for churches, not funding: it carries its own disclaimer instead
 * of FUNDING_LINE. The rest of the page copy lives in lib/ministryPage.ts.
 */
export const ministryEdition: Edition = {
  no: "05",
  href: "/ministry",
  name: "Genesis Ministry",
  eyebrow: "Genesis Ministry",
  headline: "Welcome every guest. Care for every person.",
  body: "Software for churches of about 100 to 1,000 people: a website in your own look, Hope, the assistant that answers guests on it, and a platform where no first time guest falls through the cracks.",
  points: ["Every guest followed up", "Prayer kept with your pastors", "A person approves every draft"],
  ctas: [
    { label: "Book a Call", href: "/contact?topic=ministry" },
    { label: "Take the Guided Demo", href: "/ministry-demo/platform/index.html?tour=1&church=bold-dark" },
  ],
  disclaimer: "Genesis is software. It supports your pastors and care teams and never replaces them.",
};

/** All five Genesis OS editions in order, Ministry last: the homepage cards, the navigation and the footer. */
export const allEditions: readonly Edition[] = [...editions, ministryEdition];

export function editionByPath(path: string): Edition | undefined {
  return editions.find((edition) => edition.href === path);
}
