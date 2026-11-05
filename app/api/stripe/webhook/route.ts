import { NextResponse } from "next/server";
import { stripeWebhookSecret } from "@/lib/aiEmployeesCheckout";
import { sendPurchaseAlert } from "@/lib/purchaseAlert";
import { acceptWorkspaceWebhook, openConfiguredStore } from "@/lib/workspaceProvision";

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
    return NextResponse.json({ error: "Workspace state is not configured" }, { status: 503 });
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
