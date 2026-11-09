import { NextResponse } from "next/server";
import { stripeEventsHandled, stripeWebhookSecret, subscriptionReference } from "@/lib/aiEmployeesCheckout";
import type Stripe from "stripe";
import { alertFromSession, sendPurchaseAlert } from "@/lib/purchaseAlert";
import { acceptWorkspaceWebhook, openConfiguredStore, readSignedEvent } from "@/lib/workspaceProvision";

export const runtime = "nodejs";

/**
 * Verifies the Stripe signature and records the checkout in the durable file.
 * A replayed event id is ignored. The workspace login is not chosen here.
 */
export async function POST(request: Request) {
  const secret = stripeWebhookSecret();
  if (!secret) {
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
  }
  const store = openConfiguredStore();
  if (!store) {
    // No durable disk (Vercel). Verify and alert as before; Stripe stays the
    // payment record and the VPS provisioner reads paid sessions from Stripe.
    let event: Stripe.Event;
    try {
      event = readSignedEvent(await request.text(), request.headers.get("stripe-signature"), secret);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    const object = (event.data.object ?? {}) as unknown as Record<string, unknown>;
    if ((stripeEventsHandled as readonly string[]).includes(event.type)) {
      console.info(
        JSON.stringify({
          source: "ai-employees-stripe",
          type: event.type,
          id: event.id,
          subscription: subscriptionReference(event.type, object),
        }),
      );
    }
    if (event.type === "checkout.session.completed") {
      await sendPurchaseAlert(alertFromSession(object, !event.livemode));
    }
    return NextResponse.json({ received: true });
  }

  try {
    const result = await acceptWorkspaceWebhook({
      payload: await request.text(),
      signature: request.headers.get("stripe-signature"),
      secret,
      store,
    });
    if (result.alert && !result.duplicate) await sendPurchaseAlert(result.alert);
    return NextResponse.json(result.body, { status: result.status });
  } finally {
    store.close();
  }
}
