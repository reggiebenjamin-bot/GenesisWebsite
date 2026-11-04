import assert from "node:assert/strict";
import test from "node:test";
import { alertFromSession, formatAmount, purchaseAlertCard, sendPurchaseAlert } from "../lib/purchaseAlert.ts";

const session = {
  id: "cs_test_123",
  amount_total: 49900,
  currency: "usd",
  metadata: { plan: "duo" },
  customer_details: { name: "Pat Doe", email: "pat@example.com" },
};

test("alert reads plan, product, amount, customer and session", () => {
  const alert = alertFromSession(session);
  assert.deepEqual(alert, {
    plan: "duo", product: "AI Employees Duo", amount: "499.00 USD", customerName: "Pat Doe",
    customerEmail: "pat@example.com", sessionId: "cs_test_123", test: false,
  });
  assert.equal(formatAmount(undefined, "usd"), "unknown");
});

test("card is an adaptive card attachment and says onboard by hand", () => {
  const card = purchaseAlertCard(alertFromSession(session));
  assert.equal(card.attachments[0].contentType, "application/vnd.microsoft.card.adaptive");
  assert.match(JSON.stringify(card), /Onboard by hand/);
  assert.match(JSON.stringify(purchaseAlertCard(alertFromSession(session, true))), /TEST New/);
});

function titleOf(card: ReturnType<typeof purchaseAlertCard>): string {
  const body = card.attachments[0].content.body as Array<{ text?: string }>;
  return body[0].text ?? "";
}

test("title names the actual product bought", () => {
  assert.equal(
    titleOf(purchaseAlertCard(alertFromSession({ ...session, metadata: { plan: "duo" } }))),
    "New purchase: AI Employees Duo",
  );
  assert.equal(
    titleOf(purchaseAlertCard(alertFromSession({
      ...session, metadata: { plan: "managed-750", kind: "managed" },
    }))),
    "New purchase: Genesis Business Recover",
  );
  assert.equal(
    titleOf(purchaseAlertCard(alertFromSession({
      ...session, metadata: { plan: "deal-architect", kind: "tool" },
    }))),
    "New purchase: Deal Architect",
  );
});

test("title and plan fact fall back when the plan id is unknown", () => {
  const alert = alertFromSession({ ...session, metadata: { plan: "mystery" } });
  const card = purchaseAlertCard(alert);
  assert.equal(titleOf(card), "New purchase");
  const facts = card.attachments[0].content.body[1].facts as Array<{ title: string; value: string }>;
  assert.equal(facts.find((fact) => fact.title === "Plan")?.value, "mystery");
  assert.equal(titleOf(purchaseAlertCard(alertFromSession({ ...session, metadata: {} }, true))),
    "TEST New purchase");
});

test("send never throws and reports failures", async () => {
  const quiet = console.error; console.error = () => {};
  try {
    assert.equal(await sendPurchaseAlert(alertFromSession(session), undefined), false);
    const boom = (async () => { throw new Error("down"); }) as unknown as typeof fetch;
    assert.equal(await sendPurchaseAlert(alertFromSession(session), "https://x.test", boom), false);
    const bad = (async () => new Response("", { status: 500 })) as unknown as typeof fetch;
    assert.equal(await sendPurchaseAlert(alertFromSession(session), "https://x.test", bad), false);
  } finally { console.error = quiet; }
  let sent = "";
  const ok = (async (_u: unknown, init?: RequestInit) => { sent = String(init?.body); return new Response("", { status: 202 }); }) as unknown as typeof fetch;
  assert.equal(await sendPurchaseAlert(alertFromSession(session), "https://x.test", ok), true);
  assert.match(sent, /cs_test_123/);
});
