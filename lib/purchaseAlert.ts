import { purchaseProductName } from "./checkoutPlans.ts";
import { NEEDS_GHL_TAG, crmFromSession, crmLabel, needsGhl } from "./crm.ts";

/** Purchase alert posted to the Genesis Sales Teams channel. */
export type PurchaseAlert = {
  /** The raw plan id from the Checkout Session metadata, kept for support. */
  plan: string;
  /** Human product name for the title, for example "AI Employees Duo". */
  product: string;
  amount: string;
  customerName: string;
  customerEmail: string;
  sessionId: string;
  test?: boolean;
  /** The buyer's CRM answer, when the checkout asked it. */
  crm?: string;
  /** True when the buyer uses another CRM or none, so the sale is tagged Needs GHL. */
  needsGhl?: boolean;
};

type SessionLike = Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "unknown";
}

export function formatAmount(total: unknown, currency: unknown): string {
  if (typeof total !== "number") return "unknown";
  const code = typeof currency === "string" ? currency.toUpperCase() : "USD";
  return `${(total / 100).toFixed(2)} ${code}`;
}

export function alertFromSession(session: SessionLike, test = false): PurchaseAlert {
  const metadata = (session.metadata ?? {}) as Record<string, unknown>;
  const details = (session.customer_details ?? {}) as Record<string, unknown>;
  const planId = typeof metadata.plan === "string" ? metadata.plan.trim() : "";
  const crm = crmFromSession(session);
  return {
    plan: text(metadata.plan),
    product: purchaseProductName(planId),
    amount: formatAmount(session.amount_total, session.currency),
    customerName: text(details.name),
    customerEmail: text(details.email ?? session.customer_email),
    sessionId: text(session.id),
    test,
    ...(crm ? { crm: crmLabel(crm), needsGhl: needsGhl(crm) } : {}),
  };
}

export function purchaseAlertCard(alert: PurchaseAlert) {
  const named = alert.product ? `New purchase: ${alert.product}` : "New purchase";
  const title = `${alert.test ? "TEST " : ""}${named}`;
  return {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            { type: "TextBlock", size: "Large", weight: "Bolder", text: title },
            {
              type: "FactSet",
              facts: [
                { title: "Plan", value: alert.product || alert.plan },
                { title: "Amount", value: alert.amount },
                { title: "Customer", value: alert.customerName },
                { title: "Email", value: alert.customerEmail },
                { title: "Session", value: alert.sessionId },
                ...(alert.crm ? [{ title: "CRM", value: alert.crm }] : []),
                ...(alert.needsGhl ? [{ title: "Tag", value: NEEDS_GHL_TAG }] : []),
              ],
            },
            {
              type: "TextBlock",
              wrap: true,
              text: alert.test
                ? "TEST only. No payment was made."
                : "Onboard by hand: reach out to this customer today.",
            },
          ],
        },
      },
    ],
  };
}

/** Posts the card. Never throws; failures are logged so Stripe still gets a 200. */
export async function sendPurchaseAlert(
  alert: PurchaseAlert,
  url: string | undefined = process.env.TEAMS_ALERT_WEBHOOK_URL,
  doFetch: typeof fetch = fetch,
): Promise<boolean> {
  if (!url || !url.startsWith("https://")) {
    console.error("Purchase alert skipped: TEAMS_ALERT_WEBHOOK_URL not set");
    return false;
  }
  try {
    const response = await doFetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(purchaseAlertCard(alert)),
    });
    if (!response.ok) {
      console.error("Purchase alert failed", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Purchase alert failed", error instanceof Error ? error.message : "unknown");
    return false;
  }
}
