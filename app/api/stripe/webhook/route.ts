import { NextResponse } from "next/server";
import { stripeWebhookSecret } from "@/lib/aiEmployeesCheckout";
import { sendPurchaseAlert } from "@/lib/purchaseAlert";
import { acceptWorkspaceWebhook, postProvisionRequest, workspaceLedger } from "@/lib/workspaceProvision";

export const runtime = "nodejs";

/**
 * Verifies the Stripe signature, ignores replays, and records a workspace
 * entitlement only for a paid subscription. Live mode is acknowledged and not
 * provisioned. The purchase alert still sends only when its own URL is set.
 */
export async function POST(request: Request) {
  const secret = stripeWebhookSecret();
  if (!secret) {
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
  }

  const payload = await request.text();
  const result = await acceptWorkspaceWebhook({
    payload,
    signature: request.headers.get("stripe-signature"),
    secret,
    ledger: workspaceLedger,
    provision: (command) => postProvisionRequest(command),
  });

  if (result.alert && !result.duplicate) {
    await sendPurchaseAlert(result.alert);
  }

  return NextResponse.json(result.body, { status: result.status });
}
