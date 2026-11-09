import type { ManagedPlanId } from "./offers.ts";
import { checkoutLineItems } from "./aiEmployeesCheckout.ts";

export { checkoutLineItems };

/**
 * Optional Company name box on the Stripe Checkout page. Key "company" is what
 * the workspace provisioner reads to name the buyer's workspace; a blank box
 * falls back to the buyer's mailbox name.
 */
export function companyNameField() {
  return [
    {
      key: "company",
      label: { type: "custom" as const, custom: "Company name" },
      type: "text" as const,
      optional: true,
      text: { maximum_length: 80 },
    },
  ];
}

/**
 * Stripe Checkout for the three Genesis Managed AI plans, built the same way as
 * the AI Employees checkout: a monthly recurring Price plus a one-time setup
 * Price on the same subscription Checkout Session.
 *
 * The monthly and setup Price IDs are live Stripe IDs, not secrets, so they
 * live here as defaults and the catalog works without any extra environment
 * configuration. An environment variable can still override either one.
 *
 * No path aliases in this file: tests import it directly under Node.
 */

/** Env names that can override the monthly Price IDs. */
export const monthlyPriceEnv: Record<ManagedPlanId, string> = {
  "managed-750": "STRIPE_PRICE_MANAGED_750",
  "managed-1750": "STRIPE_PRICE_MANAGED_1750",
  "managed-4500": "STRIPE_PRICE_MANAGED_4500",
};

/** Env names that can override the one-time setup Price IDs. */
export const setupPriceEnv: Record<ManagedPlanId, string> = {
  "managed-750": "STRIPE_PRICE_MANAGED_750_SETUP",
  "managed-1750": "STRIPE_PRICE_MANAGED_1750_SETUP",
  "managed-4500": "STRIPE_PRICE_MANAGED_4500_SETUP",
};

/**
 * Live recurring monthly Prices confirmed on the matching Stripe products on
 * Nov 3 2026 ($750, $1,750, $4,500 per month). Price IDs are not secrets.
 */
export const monthlyPriceDefaults: Record<ManagedPlanId, string> = {
  "managed-750": "price_1UXBvfFvlby2Ilp1MjEz1mb8",
  "managed-1750": "price_1UXBvhFvlby2Ilp1mcGy6QdZ",
  "managed-4500": "price_1UXBvjFvlby2Ilp1ZuBKAq3K",
};

/** Approved one-time setup Prices (Nov 3 2026): $500, $1,500, $5,000. */
export const setupPriceDefaults: Record<ManagedPlanId, string> = {
  "managed-750": "price_1UXrITFvlby2Ilp1Bv4gpd6F",
  "managed-1750": "price_1UXrIVFvlby2Ilp1aaxnnH3A",
  "managed-4500": "price_1UXrIRFvlby2Ilp1IZUIRx4p",
};

function resolvePrice(
  envName: string,
  fallback: string,
  env: Record<string, string | undefined>,
): string {
  const value = env[envName]?.trim() ?? "";
  if (value && !/placeholder/i.test(value) && value.startsWith("price_")) return value;
  return fallback;
}

export function monthlyPriceId(
  plan: ManagedPlanId,
  env: Record<string, string | undefined> = process.env,
): string {
  return resolvePrice(monthlyPriceEnv[plan], monthlyPriceDefaults[plan], env);
}

export function setupPriceId(
  plan: ManagedPlanId,
  env: Record<string, string | undefined> = process.env,
): string {
  return resolvePrice(setupPriceEnv[plan], setupPriceDefaults[plan], env);
}

/** Stable Checkout label. The last eight letters are the tracking suffix. */
export const MANAGED_CHECKOUT_INTEGRATION_ID = "genesis_managed_ai_qhtzjwbf";
