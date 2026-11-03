import type { CheckoutPlanId } from "./aiEmployees.ts";

/** Placeholder Stripe Price IDs. Real `price_` values replace these in the environment. */
export const checkoutPriceEnv: Record<CheckoutPlanId, string> = {
  single: "STRIPE_PRICE_AI_EMPLOYEES_SINGLE",
  duo: "STRIPE_PRICE_AI_EMPLOYEES_DUO",
  fleet: "STRIPE_PRICE_AI_EMPLOYEES_FLEET",
};

/** Env names that can override the one-time setup Price IDs. */
export const setupPriceEnv: Record<CheckoutPlanId, string> = {
  single: "STRIPE_PRICE_AI_EMPLOYEES_SINGLE_SETUP",
  duo: "STRIPE_PRICE_AI_EMPLOYEES_DUO_SETUP",
  fleet: "STRIPE_PRICE_AI_EMPLOYEES_FLEET_SETUP",
};

/** Approved one-time setup Prices (Nov 3 2026). Price IDs are not secrets. */
export const setupPriceDefaults: Record<CheckoutPlanId, string> = {
  single: "price_1UXrIGFvlby2Ilp1ZxVFRUoL",
  duo: "price_1UXrIKFvlby2Ilp1Exa0uVt3",
  fleet: "price_1UXrINFvlby2Ilp1LwtOruDi",
};

export function setupPriceId(
  plan: CheckoutPlanId,
  env: Record<string, string | undefined> = process.env,
): string {
  const value = env[setupPriceEnv[plan]]?.trim() ?? "";
  if (value && !/placeholder/i.test(value) && value.startsWith("price_")) return value;
  return setupPriceDefaults[plan];
}

/** Checkout line items: the monthly Price plus the one-time setup Price. */
export function checkoutLineItems(monthlyPrice: string, setupPrice: string) {
  return [
    { price: monthlyPrice, quantity: 1 },
    { price: setupPrice, quantity: 1 },
  ];
}

/** Stable Checkout label. The last eight letters are the tracking suffix. */
export const AI_EMPLOYEES_CHECKOUT_INTEGRATION_ID = "genesis_ai_employees_krmxwqpl";

const placeholder = /placeholder/i;

export function checkoutPriceId(
  plan: CheckoutPlanId,
  env: Record<string, string | undefined> = process.env,
): string | null {
  const value = env[checkoutPriceEnv[plan]]?.trim() ?? "";
  if (!value || placeholder.test(value) || !value.startsWith("price_")) return null;
  return value;
}

export function stripeSecretKey(
  env: Record<string, string | undefined> = process.env,
): string | null {
  const value = env.STRIPE_SECRET_KEY?.trim() ?? "";
  if (!value || placeholder.test(value)) return null;
  if (!value.startsWith("rk_") && !value.startsWith("sk_")) return null;
  return value;
}

export function stripeWebhookSecret(
  env: Record<string, string | undefined> = process.env,
): string | null {
  const value = env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  if (!value || placeholder.test(value) || !value.startsWith("whsec_")) return null;
  return value;
}

/**
 * Subscription id carried on the event object itself. Dispute, refund, and
 * fraud events often omit it; those stay acknowledged without a second lookup.
 */
export function subscriptionReference(
  type: string,
  object: Record<string, unknown>,
): string | null {
  if (type.startsWith("customer.subscription.") && typeof object.id === "string") {
    return object.id;
  }

  const direct = object.subscription;
  if (typeof direct === "string" && direct.startsWith("sub_")) return direct;
  if (direct && typeof direct === "object" && "id" in direct && typeof direct.id === "string") {
    return direct.id;
  }

  const parent = object.parent;
  if (parent && typeof parent === "object" && "subscription_details" in parent) {
    const details = (parent as { subscription_details?: { subscription?: unknown } })
      .subscription_details;
    if (typeof details?.subscription === "string") return details.subscription;
  }

  return null;
}

export const stripeEventsHandled = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "invoice.paid",
  "invoice.payment_failed",
  "charge.dispute.created",
  "charge.refunded",
  "radar.early_fraud_warning.created",
] as const;
