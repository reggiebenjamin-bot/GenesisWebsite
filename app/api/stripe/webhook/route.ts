import { NextResponse } from "next/server";
import {
  stripeEventsHandled,
  stripeWebhookSecret,
  subscriptionReference,
} from "@/lib/aiEmployeesCheckout";
import { stripeServer } from "@/lib/stripeServer";

const handled = new Set<string>(stripeEventsHandled);

/**
 * Verifies Stripe signatures and accepts the subscription, checkout, invoice,
 * dispute, refund, and fraud events. Stripe keeps the subscription record
 * until this site has a customer store of its own.
 */
export async function POST(request: Request) {
  const secret = stripeWebhookSecret();
  const stripe = stripeServer();
  if (!secret || !stripe) {
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const object =
    event.data.object && typeof event.data.object === "object"
      ? (event.data.object as unknown as Record<string, unknown>)
      : {};

  if (handled.has(event.type)) {
    console.info(
      JSON.stringify({
        source: "ai-employees-stripe",
        type: event.type,
        id: event.id,
        subscription: subscriptionReference(event.type, object),
      }),
    );
  }

  return NextResponse.json({ received: true });
}
