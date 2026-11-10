import type Stripe from "stripe";
import { NEEDS_GHL_TAG, crmFromSession, needsGhl } from "./crm.ts";

/**
 * Writes the CRM answer onto the buyer's Stripe subscription metadata once the
 * checkout completes: crm=ghl|other|none, and needs_ghl plus the tag when the
 * buyer uses another CRM or none. Session metadata is fixed when the session is
 * created, before the buyer answers, so the subscription is where it lands.
 * Never throws: a failure here must not fail the webhook.
 */
export async function tagSubscriptionWithCrm(
  stripe: Pick<Stripe, "subscriptions"> | null,
  session: Record<string, unknown>,
): Promise<boolean> {
  const crm = crmFromSession(session);
  const subscription = typeof session.subscription === "string" ? session.subscription : "";
  if (!stripe || !crm || !subscription.startsWith("sub_")) return false;
  const metadata = (session.metadata ?? {}) as Record<string, unknown>;
  if (metadata.kind !== "managed") return false;
  try {
    await stripe.subscriptions.update(subscription, {
      metadata: {
        crm,
        ...(needsGhl(crm) ? { needs_ghl: "true", tag: NEEDS_GHL_TAG } : {}),
      },
    });
    return true;
  } catch (error) {
    console.error("CRM tag failed", error instanceof Error ? error.message : "unknown");
    return false;
  }
}
