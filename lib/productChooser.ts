/*
 * Homepage chooser: Business, Real Estate, and Lending. Each edition opens
 * its page and the existing /start/750, /start/1750, and /start/4500 checkout
 * links. Prices come from managedPlans. No new Stripe products or prices.
 *
 * No path aliases in this file: tests import it directly under Node.
 */

import { editionPricing, type EditionKey } from "./editionPlans.ts";
import { editions } from "./editions.ts";
import { managedPlans } from "./offers.ts";

export const chooserEditionKeys: readonly EditionKey[] = ["business", "real_estate", "lending"];

export type ChooserLevel = {
  id: (typeof managedPlans)[number]["id"];
  step: string;
  priceDisplay: string;
  setupLine: string;
  /** Existing short checkout link, with the edition passed through. */
  href: string;
};

export type ChooserProduct = {
  key: EditionKey;
  label: "Business" | "Real Estate" | "Lending";
  href: string;
  summary: string;
  levels: readonly ChooserLevel[];
};

const LABELS = {
  business: "Business",
  real_estate: "Real Estate",
  lending: "Lending",
} as const;

export function chooserProducts(): readonly ChooserProduct[] {
  return chooserEditionKeys.map((key) => {
    const pricing = editionPricing[key];
    const edition = editions.find((candidate) => candidate.href === pricing.landingPath);
    return {
      key,
      label: LABELS[key],
      href: pricing.landingPath,
      summary: edition?.body ?? pricing.lede,
      levels: managedPlans.map((plan) => ({
        id: plan.id,
        step: plan.step,
        priceDisplay: plan.priceDisplay,
        setupLine: plan.setupLine,
        href: `/start/${plan.monthlyPriceUsd}?edition=${key}`,
      })),
    };
  });
}
