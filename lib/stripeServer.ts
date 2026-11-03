import Stripe from "stripe";
import { stripeSecretKey } from "./aiEmployeesCheckout.ts";

/** A Stripe client when a real secret key is configured. Placeholder keys stay closed. */
export function stripeServer(
  env: Record<string, string | undefined> = process.env,
): Stripe | null {
  const key = stripeSecretKey(env);
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-09-30.endive" });
}
