import assert from "node:assert/strict";
import test from "node:test";
import { crmChoice, crmFromSession, needsGhl } from "../lib/crm.ts";
import { tagSubscriptionWithCrm } from "../lib/crmTag.ts";
import { assessmentQuestions } from "../lib/assessment.ts";

test("crmChoice reads keys and labels", () => {
  assert.equal(crmChoice("ghl"), "ghl");
  assert.equal(crmChoice("GoHighLevel"), "ghl");
  assert.equal(crmChoice("Another CRM"), "other");
  assert.equal(crmChoice("None"), "none");
  assert.equal(crmChoice("Salesforce"), "");
  assert.equal(crmChoice(undefined), "");
});

test("only another CRM or none needs GHL", () => {
  assert.equal(needsGhl("ghl"), false);
  assert.equal(needsGhl("other"), true);
  assert.equal(needsGhl("none"), true);
  assert.equal(needsGhl(""), false);
});

test("the assessment asks the same CRM question as a required single choice", () => {
  const question = assessmentQuestions.find((item) => item.id === "crm");
  assert.ok(question && question.kind === "single");
  assert.equal(question.label, "What CRM do you use today?");
  assert.deepEqual(
    question.options.map((option) => option.value),
    ["GoHighLevel", "Another CRM", "None"],
  );
});

test("crmFromSession reads the dropdown custom field", () => {
  assert.equal(
    crmFromSession({ custom_fields: [{ key: "crm", type: "dropdown", dropdown: { value: "none" } }] }),
    "none",
  );
  assert.equal(crmFromSession({ custom_fields: [] }), "");
  assert.equal(crmFromSession({}), "");
});

function fakeStripe() {
  const calls: unknown[][] = [];
  return {
    calls,
    client: { subscriptions: { update: async (...args: unknown[]) => { calls.push(args); return {}; } } },
  };
}

const sale = (value: string) => ({
  subscription: "sub_123",
  metadata: { plan: "managed-750", kind: "managed" },
  custom_fields: [{ key: "crm", type: "dropdown", dropdown: { value } }],
});

test("subscription metadata carries crm and the Needs GHL tag for other or none", async () => {
  const stripe = fakeStripe();
  assert.equal(await tagSubscriptionWithCrm(stripe.client as never, sale("other")), true);
  assert.deepEqual(stripe.calls[0], [
    "sub_123",
    { metadata: { crm: "other", needs_ghl: "true", tag: "Needs GHL" } },
  ]);
  await tagSubscriptionWithCrm(stripe.client as never, sale("ghl"));
  assert.deepEqual(stripe.calls[1], ["sub_123", { metadata: { crm: "ghl" } }]);
});

test("the tag skips tools, missing answers and Stripe errors", async () => {
  const stripe = fakeStripe();
  assert.equal(
    await tagSubscriptionWithCrm(stripe.client as never, { ...sale("none"), metadata: { plan: "deal-architect", kind: "tool" } }),
    false,
  );
  assert.equal(await tagSubscriptionWithCrm(stripe.client as never, { subscription: "sub_1", metadata: { kind: "managed" } }), false);
  assert.equal(stripe.calls.length, 0);
  const broken = { subscriptions: { update: async () => { throw new Error("denied"); } } };
  assert.equal(await tagSubscriptionWithCrm(broken as never, sale("none")), false);
});
