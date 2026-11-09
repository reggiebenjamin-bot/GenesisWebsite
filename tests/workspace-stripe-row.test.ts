import assert from "node:assert/strict";
import test from "node:test";
import { memoryStore, rowFromSession } from "../lib/stripeCheckoutRow.ts";
import { siteHasOwnSignIn } from "../lib/workspaceAccess.ts";
import { ownerWorkspaceView } from "../lib/workspaceProvision.ts";

function session(over: Record<string, unknown> = {}) {
  return {
    id: "cs_test_rowA",
    status: "complete",
    payment_status: "paid",
    livemode: false,
    metadata: { plan: "managed-750", kind: "managed" },
    customer_details: { email: "buyer@example.com" },
    subscription: "sub_test_1",
    client_reference_id: null,
    ...over,
  };
}

const okStatus = (login: string) =>
  (async () => new Response(JSON.stringify({ ready: true, login_url: login }), { status: 200 })) as typeof fetch;

test("paid managed session becomes a paid pending row", () => {
  const row = rowFromSession(session());
  assert.ok(row);
  assert.equal(row.paid, true);
  assert.equal(row.phase, "pending");
  assert.equal(row.environment, "test");
  assert.equal(row.customerEmail, "buyer@example.com");
  assert.equal(row.subscriptionId, "sub_test_1");
});

test("unpaid, free, tool and unknown plans are not paid workspaces", () => {
  assert.equal(rowFromSession(session({ payment_status: "unpaid" }))?.paid, false);
  assert.equal(rowFromSession(session({ payment_status: "no_payment_required" }))?.paid, false);
  assert.equal(rowFromSession(session({ status: "open" }))?.paid, false);
  assert.equal(rowFromSession(session({ metadata: { plan: "deal-architect", kind: "tool" } }))?.phase, "not_eligible");
  assert.equal(rowFromSession(session({ metadata: { plan: "nope" } }))?.phase, "not_eligible");
  assert.equal(rowFromSession(session({ id: "pi_123" })), null);
});

test("canceled expanded subscription is ended", () => {
  const row = rowFromSession(session({ subscription: { id: "sub_x", status: "canceled" } }));
  assert.equal(row?.phase, "ended");
  assert.equal(row?.subscriptionId, "sub_x");
});

test("site sign in is detected only with both Clerk keys", () => {
  assert.equal(siteHasOwnSignIn({}), false);
  assert.equal(siteHasOwnSignIn({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk", CLERK_SECRET_KEY: "" }), false);
  assert.equal(siteHasOwnSignIn({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk", CLERK_SECRET_KEY: "sk" }), true);
});

test("session holder gets the tenant login only when the gate allows and the pod is ready", async () => {
  const row = rowFromSession(session())!;
  const login = "https://pod.genesisaisolutions.cloud/w/buyera";
  const off = await ownerWorkspaceView({
    store: memoryStore(row), sessionId: row.sessionId, principal: null, sessionHolderIsOwner: true,
    env: {}, fetchImpl: okStatus(login),
  });
  assert.equal(off.phase, "pending");
  assert.equal(off.loginUrl, null);
  const on = await ownerWorkspaceView({
    store: memoryStore(row), sessionId: row.sessionId, principal: null, sessionHolderIsOwner: true,
    env: { GENESIS_WORKSPACE_ROLLOUT: "test", GENESIS_WORKSPACE_STATUS_URL: "https://pod.example/ws-status" },
    fetchImpl: okStatus(login),
  });
  assert.equal(on.phase, "ready");
  assert.equal(on.loginUrl, login);
});

test("without session holder ownership a stranger still gets sign_in", async () => {
  const row = rowFromSession(session())!;
  const view = await ownerWorkspaceView({
    store: memoryStore(row), sessionId: row.sessionId, principal: null,
    env: { GENESIS_WORKSPACE_ROLLOUT: "live" }, fetchImpl: okStatus("https://pod.genesisaisolutions.cloud/w/a"),
  });
  assert.equal(view.phase, "sign_in");
  assert.equal(view.loginUrl, null);
});

test("bare shared pod entry is never shown as a login", async () => {
  const row = rowFromSession(session())!;
  const view = await ownerWorkspaceView({
    store: memoryStore(row), sessionId: row.sessionId, principal: null, sessionHolderIsOwner: true,
    env: { GENESIS_WORKSPACE_ROLLOUT: "live" }, fetchImpl: okStatus("https://pod.genesisaisolutions.cloud/"),
  });
  assert.equal(view.loginUrl, null);
});

test("live session waits while the gate is test only", async () => {
  const row = rowFromSession(session({ id: "cs_live_rowB", livemode: true }))!;
  const view = await ownerWorkspaceView({
    store: memoryStore(row), sessionId: row.sessionId, principal: null, sessionHolderIsOwner: true,
    env: { GENESIS_WORKSPACE_ROLLOUT: "test" }, fetchImpl: okStatus("https://pod.genesisaisolutions.cloud/w/b"),
  });
  assert.equal(view.phase, "pending");
});
