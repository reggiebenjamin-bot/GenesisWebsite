/*
 * Vercel has no durable shared disk, so the sqlite payment record from
 * workspaceStore.ts cannot be the only source of truth there. When
 * GENESIS_WORKSPACE_STATE_PATH is not set, the welcome page and the status
 * route read the Checkout Session from Stripe instead, server side, with the
 * site's own secret key. Stripe is the payment record of truth.
 */

import type Stripe from "stripe";
import { classifyCheckout, isPaidCheckout } from "./workspaceAccess.ts";
import type { CheckoutRow, WorkspaceStore } from "./workspaceStore.ts";

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Same row the signed webhook would write, built from a retrieved session. */
export function rowFromSession(session: Record<string, unknown>): CheckoutRow | null {
  const sessionId = text(session.id);
  if (!sessionId.startsWith("cs_")) return null;
  const metadata = (session.metadata && typeof session.metadata === "object" ? session.metadata : {}) as Record<
    string,
    unknown
  >;
  const planId = text(metadata.plan);
  const kind = text(metadata.kind);
  const paid = isPaidCheckout(text(session.status), text(session.payment_status));
  const checkoutClass = classifyCheckout(planId, kind);
  const details = (session.customer_details && typeof session.customer_details === "object"
    ? session.customer_details
    : {}) as Record<string, unknown>;
  const email = text(details.email) || text(session.customer_email);
  const subscription = session.subscription;
  const subscriptionId =
    typeof subscription === "string"
      ? subscription
      : subscription && typeof subscription === "object"
        ? text((subscription as Record<string, unknown>).id)
        : "";
  const subscriptionStatus =
    subscription && typeof subscription === "object" ? text((subscription as Record<string, unknown>).status) : "";

  let phase: CheckoutRow["phase"] = "pending";
  let reason = paid ? "awaiting_status" : "unpaid";
  if (checkoutClass === "tool") {
    phase = "not_eligible";
    reason = "tool";
  } else if (checkoutClass === "refused") {
    phase = "not_eligible";
    reason = "unknown_plan";
  } else if (subscriptionStatus === "canceled" || subscriptionStatus === "incomplete_expired") {
    phase = "ended";
    reason = "subscription_ended";
  }

  return {
    sessionId,
    environment: session.livemode === true ? "live" : "test",
    planId,
    kind,
    paid: paid && checkoutClass === "workspace",
    customerEmail: email,
    ownerUserId: text(session.client_reference_id),
    subscriptionId,
    loginUrl: "",
    phase,
    reason,
  };
}

/** A one request store holding the row Stripe returned. Writes stay in memory. */
export function memoryStore(row: CheckoutRow | null): WorkspaceStore {
  let current = row;
  return {
    claimEvent: () => true,
    getCheckout: (sessionId) => (current && current.sessionId === sessionId ? current : null),
    saveCheckout: (next) => {
      current = next;
    },
    endSubscription: () => {},
    close: () => {},
  };
}

/** Reads the session from Stripe. Returns an empty store when it cannot be read. */
export async function stripeBackedStore(stripe: Stripe | null, sessionId: string): Promise<WorkspaceStore> {
  if (!stripe || !/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId)) return memoryStore(null);
  try {
    // No expand: the site key may not read subscriptions. The pod stops
    // advertising login_url when the subscription ends.
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return memoryStore(rowFromSession(session as unknown as Record<string, unknown>));
  } catch {
    return memoryStore(null);
  }
}
