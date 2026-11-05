import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import Stripe from "stripe";
import { genesisTools, managedPlans } from "../lib/offers.ts";
import { aiEmployeePlans } from "../lib/aiEmployees.ts";
import {
  classifyCheckout,
  safeWorkspaceLogin,
  welcomeDecision,
  workspaceCardCopy,
  workspaceDisclaimer,
} from "../lib/workspaceAccess.ts";
import { welcomeReadyCopy } from "../lib/welcomePath.ts";
import { stripeWebhookSecret } from "../lib/aiEmployeesCheckout.ts";
import {
  acceptWorkspaceWebhook,
  applyProvisionReport,
  bearerMatches,
  postProvisionRequest,
  statusForSession,
  WorkspaceLedger,
  type ProvisionCommand,
  type ProvisionResult,
} from "../lib/workspaceProvision.ts";

const SECRET = "whsec_test_fixture_only";
const stripe = new Stripe("sk_test_fixture_only", { apiVersion: "2026-09-30.endive" });

const DASHES = ["-", "–", "—"];
const EMOJI = /\p{Extended_Pictographic}/u;

function eventPayload(options: {
  id?: string;
  type?: string;
  livemode?: boolean;
  sessionId?: string;
  plan?: string;
  kind?: string;
  status?: string;
  paymentStatus?: string;
  subscription?: string;
  created?: number;
}) {
  const livemode = options.livemode ?? false;
  return JSON.stringify({
    id: options.id ?? "evt_test_workspace",
    object: "event",
    api_version: "2026-09-30.endive",
    created: options.created ?? Math.floor(Date.now() / 1000),
    type: options.type ?? "checkout.session.completed",
    livemode,
    data: {
      object: {
        id: options.sessionId ?? "cs_test_buyerA",
        object: "checkout.session",
        status: options.status ?? "complete",
        payment_status: options.paymentStatus ?? "paid",
        mode: options.kind === "tool" ? "payment" : "subscription",
        livemode,
        metadata: { plan: options.plan ?? "managed-750", kind: options.kind ?? "managed" },
        subscription: options.subscription ?? "sub_test_buyerA",
        amount_total: 75000,
        currency: "usd",
        customer_details: { email: "buyer-a@example.com", name: "Buyer A" },
      },
    },
  });
}

function sign(payload: string, timestamp?: number) {
  return stripe.webhooks.generateTestHeaderString({
    payload,
    secret: SECRET,
    timestamp,
  });
}

async function accept(
  ledger: WorkspaceLedger,
  payload: string,
  provision?: (command: ProvisionCommand) => Promise<ProvisionResult>,
  signature: string | null = sign(payload),
) {
  return acceptWorkspaceWebhook({
    payload,
    signature,
    secret: SECRET,
    ledger,
    provision,
  });
}

test("public prices stay the published tool and managed catalogs", () => {
  assert.deepEqual(
    genesisTools.map((tool) => [tool.id, tool.price.display, tool.price.amountUsd[0]]),
    [
      ["deal-architect", "$49", 49],
      ["deal-packager", "$99", 99],
      ["capital-advisor", "$79", 79],
    ],
  );
  assert.deepEqual(
    managedPlans.map((plan) => [plan.id, plan.monthlyPriceUsd]),
    [
      ["managed-750", 750],
      ["managed-1750", 1750],
      ["managed-4500", 4500],
    ],
  );
  assert.deepEqual(
    aiEmployeePlans.map((plan) => plan.monthlyPriceUsd),
    [697, 1497, 2997],
  );
});

test("tool purchases are not workspace entitlements", () => {
  assert.equal(classifyCheckout("deal-architect", "tool"), "tool");
  assert.equal(classifyCheckout("deal-packager", "tool"), "tool");
  assert.equal(classifyCheckout("capital-advisor", "tool"), "tool");
  assert.equal(classifyCheckout("managed-750", "managed"), "workspace");
  assert.equal(classifyCheckout("single", ""), "workspace");
  assert.equal(classifyCheckout("mystery", ""), "refused");
  assert.equal(classifyCheckout("deal-architect", "managed"), "tool");
  assert.equal(welcomeDecision({ confirmed: true, paid: false, planId: "managed-750", kind: "managed" }), "unpaid");
  assert.equal(workspaceDisclaimer, "Genesis is software. We do not lend, place or arrange funding.");
});

test("a shared pod login is never safe", () => {
  assert.equal(safeWorkspaceLogin("https://pod.genesisaisolutions.cloud/login"), null);
  assert.equal(safeWorkspaceLogin("http://buyer.example/login"), null);
  assert.equal(safeWorkspaceLogin("https://user:secret@buyer.example/login"), null);
  assert.equal(
    safeWorkspaceLogin("https://buyer-a.workspaces.test/login"),
    "https://buyer-a.workspaces.test/login",
  );
});

test("welcome copy has no dash or emoji and ready is a separate state", () => {
  for (const [key, text] of Object.entries(welcomeReadyCopy)) {
    for (const dash of DASHES) {
      assert.equal(text.includes(dash), false, `${key} contains ${dash}`);
    }
    assert.equal(EMOJI.test(text), false, key);
  }
  assert.equal(workspaceCardCopy("pending").showSignIn, false);
  assert.equal(workspaceCardCopy("failed").showSignIn, false);
  assert.notEqual(workspaceCardCopy("pending").heading, welcomeReadyCopy.accountReadyHeading);
  assert.notEqual(workspaceCardCopy("failed").heading, welcomeReadyCopy.accountReadyHeading);
  assert.equal(workspaceCardCopy("ready").heading, welcomeReadyCopy.accountReadyHeading);
});

test("the welcome screen does not link buyers to the shared pod", () => {
  const files = [
    "app/(marketing)/welcome/page.tsx",
    "app/(marketing)/welcome/AccountReady.tsx",
    "app/(marketing)/welcome/SignInCard.tsx",
  ];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    assert.equal(source.includes("pod.genesisaisolutions.cloud"), false, file);
    assert.equal(source.includes("POD_URL"), false, file);
    assert.equal(source.includes("/ws-status"), false, file);
  }
});

test("webhook signature, replay, and stale signature", async () => {
  const ledger = new WorkspaceLedger();
  const calls: ProvisionCommand[] = [];
  const payload = eventPayload({ id: "evt_test_replay", sessionId: "cs_test_replayA" });
  const provision = async (command: ProvisionCommand) => {
    calls.push(command);
    return { phase: "ready" as const, loginUrl: "https://replay-a.workspaces.test/login" };
  };

  const bad = await accept(ledger, payload, provision, "t=1,v1=bad");
  assert.equal(bad.status, 400);
  assert.equal(calls.length, 0);

  const missing = await acceptWorkspaceWebhook({
    payload,
    signature: null,
    secret: SECRET,
    ledger,
    provision,
  });
  assert.equal(missing.status, 400);

  const stale = await accept(
    ledger,
    payload,
    provision,
    sign(payload, Math.floor(Date.now() / 1000) - 600),
  );
  assert.equal(stale.status, 400);
  assert.equal(calls.length, 0);

  const first = await accept(ledger, payload, provision);
  const second = await accept(ledger, payload, provision);
  assert.equal(first.status, 200);
  assert.equal(first.duplicate, false);
  assert.equal(second.status, 200);
  assert.equal(second.duplicate, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].livemode, false);
  assert.equal(calls[0].sessionId, "cs_test_replayA");
  assert.equal(statusForSession(ledger, "cs_test_replayA").loginUrl, "https://replay-a.workspaces.test/login");
});

test("a thrown provision can be retried and a second event does not reprovision", async () => {
  const ledger = new WorkspaceLedger();
  let attempts = 0;
  const payload = eventPayload({ id: "evt_test_retry", sessionId: "cs_test_retryA" });
  const provision = async () => {
    attempts += 1;
    if (attempts === 1) throw new Error("temporary");
    return { phase: "pending" as const };
  };
  const failed = await accept(ledger, payload, provision);
  assert.equal(failed.status, 500);
  const retried = await accept(ledger, payload, provision);
  assert.equal(retried.status, 200);
  assert.equal(attempts, 2);

  const again = eventPayload({ id: "evt_test_retry_2", sessionId: "cs_test_retryA" });
  await accept(ledger, again, provision);
  assert.equal(attempts, 2);
  assert.equal(statusForSession(ledger, "cs_test_retryA").phase, "pending");
});

test("tenant isolation keeps each buyer on their own login", async () => {
  const ledger = new WorkspaceLedger();
  const urls: Record<string, string> = {
    cs_test_tenantA: "https://tenant-a.workspaces.test/login",
    cs_test_tenantB: "https://tenant-b.workspaces.test/login",
  };
  const provision = async (command: ProvisionCommand) => ({
    phase: "ready" as const,
    loginUrl: urls[command.sessionId],
  });
  await accept(
    ledger,
    eventPayload({
      id: "evt_test_tenantA",
      sessionId: "cs_test_tenantA",
      plan: "single",
      kind: "",
      subscription: "sub_test_tenantA",
    }),
    provision,
  );
  await accept(
    ledger,
    eventPayload({
      id: "evt_test_tenantB",
      sessionId: "cs_test_tenantB",
      plan: "managed-1750",
      kind: "managed",
      subscription: "sub_test_tenantB",
    }),
    provision,
  );

  const statusA = statusForSession(ledger, "cs_test_tenantA");
  const statusB = statusForSession(ledger, "cs_test_tenantB");
  assert.equal(statusA.loginUrl, urls.cs_test_tenantA);
  assert.equal(statusB.loginUrl, urls.cs_test_tenantB);
  assert.equal(JSON.stringify(statusA).includes("tenant-b"), false);
  assert.equal(JSON.stringify(statusB).includes("tenant-a"), false);
  assert.equal(JSON.stringify(statusA).includes("buyer-a@example.com"), false);

  const ended = eventPayload({
    id: "evt_test_endB",
    type: "customer.subscription.deleted",
    sessionId: "sub_test_tenantB",
  });
  const deleted = JSON.parse(ended) as { data: { object: Record<string, unknown> } };
  deleted.data.object = { id: "sub_test_tenantB", object: "subscription" };
  const deletedPayload = JSON.stringify(deleted);
  await accept(ledger, deletedPayload, provision);
  assert.equal(statusForSession(ledger, "cs_test_tenantA").loginUrl, urls.cs_test_tenantA);
  assert.equal(statusForSession(ledger, "cs_test_tenantB").loginUrl, null);
  assert.equal(statusForSession(ledger, "cs_test_tenantB").phase, "failed");
});

test("wrong entitlement does not provision a workspace", async () => {
  const ledger = new WorkspaceLedger();
  let calls = 0;
  const provision = async () => {
    calls += 1;
    return { phase: "ready" as const, loginUrl: "https://should-not.example/login" };
  };
  const cases = [
    { id: "evt_test_tool", sessionId: "cs_test_toolA", plan: "deal-architect", kind: "tool" },
    { id: "evt_test_packager", sessionId: "cs_test_toolB", plan: "deal-packager", kind: "tool" },
    { id: "evt_test_capital", sessionId: "cs_test_toolC", plan: "capital-advisor", kind: "tool" },
    { id: "evt_test_unknown", sessionId: "cs_test_unknownA", plan: "mystery", kind: "" },
  ];
  for (const entry of cases) {
    const result = await accept(ledger, eventPayload(entry), provision);
    assert.equal(result.status, 200);
    const status = statusForSession(ledger, entry.sessionId);
    assert.equal(status.phase, "not_eligible");
    assert.equal(status.loginUrl, null);
  }
  assert.equal(calls, 0);
  assert.equal(workspaceCardCopy("not_eligible").heading, welcomeReadyCopy.toolHeading);
});

test("unpaid and live sessions are not provisioned", async () => {
  const ledger = new WorkspaceLedger();
  let calls = 0;
  const provision = async () => {
    calls += 1;
    return { phase: "ready" as const, loginUrl: "https://nope.example/login" };
  };
  await accept(
    ledger,
    eventPayload({ id: "evt_test_unpaid", sessionId: "cs_test_unpaidA", paymentStatus: "unpaid" }),
    provision,
  );
  await accept(
    ledger,
    eventPayload({
      id: "evt_test_free",
      sessionId: "cs_test_freeA",
      paymentStatus: "no_payment_required",
    }),
    provision,
  );
  await accept(
    ledger,
    eventPayload({ id: "evt_test_live", sessionId: "cs_live_buyerA", livemode: true }),
    provision,
  );
  assert.equal(calls, 0);
  assert.equal(statusForSession(ledger, "cs_test_unpaidA").reason, "unpaid");
  assert.equal(statusForSession(ledger, "cs_live_buyerA").loginUrl, null);
  assert.equal(statusForSession(ledger, "cs_live_buyerA").phase, "pending");
  assert.notEqual(workspaceCardCopy("pending").heading, welcomeReadyCopy.accountReadyHeading);
});

test("provision failure and a shared pod URL do not show ready", async () => {
  const ledger = new WorkspaceLedger();
  await accept(
    ledger,
    eventPayload({ id: "evt_test_fail", sessionId: "cs_test_failA" }),
    async () => ({ phase: "failed" }),
  );
  await accept(
    ledger,
    eventPayload({ id: "evt_test_pod", sessionId: "cs_test_podA" }),
    async () => ({ phase: "ready", loginUrl: "https://pod.genesisaisolutions.cloud/login" }),
  );
  const failed = statusForSession(ledger, "cs_test_failA");
  const unsafe = statusForSession(ledger, "cs_test_podA");
  assert.equal(failed.phase, "failed");
  assert.equal(failed.loginUrl, null);
  assert.equal(unsafe.phase, "failed");
  assert.equal(unsafe.loginUrl, null);
  assert.equal(unsafe.reason, "unsafe_login");
  assert.notEqual(workspaceCardCopy(failed.phase).heading, welcomeReadyCopy.accountReadyHeading);
});

test("a provision report cannot cross tenants or invent an entitlement", async () => {
  const ledger = new WorkspaceLedger();
  await accept(
    ledger,
    eventPayload({ id: "evt_test_reportA", sessionId: "cs_test_reportA", plan: "fleet", kind: "" }),
    async () => ({ phase: "pending" }),
  );
  await accept(
    ledger,
    eventPayload({ id: "evt_test_reportTool", sessionId: "cs_test_reportTool", plan: "deal-architect", kind: "tool" }),
    async () => ({ phase: "ready", loginUrl: "https://tool.example/login" }),
  );

  const missing = applyProvisionReport(ledger, {
    sessionId: "cs_test_missingA",
    phase: "ready",
    loginUrl: "https://missing.workspaces.test/login",
  });
  assert.equal(missing.status, 404);
  assert.equal(statusForSession(ledger, "cs_test_missingA").reason, "unknown_session");

  const tool = applyProvisionReport(ledger, {
    sessionId: "cs_test_reportTool",
    phase: "ready",
    loginUrl: "https://tool.workspaces.test/login",
  });
  assert.equal(tool.status, 409);
  assert.equal(statusForSession(ledger, "cs_test_reportTool").loginUrl, null);

  const ready = applyProvisionReport(ledger, {
    sessionId: "cs_test_reportA",
    phase: "ready",
    loginUrl: "https://report-a.workspaces.test/login",
  });
  assert.equal(ready.status, 200);
  assert.equal(statusForSession(ledger, "cs_test_reportA").loginUrl, "https://report-a.workspaces.test/login");

  const swapped = applyProvisionReport(ledger, {
    sessionId: "cs_test_reportA",
    phase: "ready",
    loginUrl: "https://report-b.workspaces.test/login",
  });
  assert.equal(swapped.status, 200);
  assert.equal(statusForSession(ledger, "cs_test_reportA").loginUrl, "https://report-a.workspaces.test/login");

  const shared = applyProvisionReport(ledger, {
    sessionId: "cs_test_reportB",
    phase: "ready",
    loginUrl: "https://pod.genesisaisolutions.cloud",
  });
  assert.equal(shared.status, 404);
});

test("provisioner client stays local to the fixture and skips live and the shared pod", async () => {
  const calls: { url: string; idempotency: string | null; body: string }[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    calls.push({
      url: String(input),
      idempotency: new Headers(init?.headers).get("idempotency-key"),
      body: String(init?.body ?? ""),
    });
    return new Response(JSON.stringify({ phase: "pending" }), { status: 200 });
  };
  const command: ProvisionCommand = {
    sessionId: "cs_test_clientA",
    planId: "managed-4500",
    kind: "managed",
    livemode: false,
    eventId: "evt_test_client",
  };

  const closed = await postProvisionRequest(command, { env: {}, fetchImpl });
  assert.equal(closed.phase, "pending");
  assert.equal(calls.length, 0);

  const live = await postProvisionRequest(
    { ...command, livemode: true },
    { env: { WORKSPACE_PROVISIONER_URL: "https://provisioner.test/v1/workspaces" }, fetchImpl },
  );
  assert.equal(live.phase, "pending");
  assert.equal(calls.length, 0);

  const pod = await postProvisionRequest(command, {
    env: { WORKSPACE_PROVISIONER_URL: "https://pod.genesisaisolutions.cloud/ws-status" },
    fetchImpl,
  });
  assert.equal(pod.phase, "pending");
  assert.equal(calls.length, 0);

  const sent = await postProvisionRequest(command, {
    env: {
      WORKSPACE_PROVISIONER_URL: "https://provisioner.test/v1/workspaces",
      WORKSPACE_PROVISIONER_TOKEN: "fixture-token",
    },
    fetchImpl,
  });
  assert.equal(sent.phase, "pending");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://provisioner.test/v1/workspaces");
  assert.equal(calls[0].idempotency, "cs_test_clientA");
  assert.equal(JSON.parse(calls[0].body).livemode, false);
  assert.equal(calls[0].url.includes("api.stripe.com"), false);
});

test("webhook secret and provision callback token stay closed without fixtures", () => {
  assert.equal(stripeWebhookSecret({}), null);
  assert.equal(stripeWebhookSecret({ STRIPE_WEBHOOK_SECRET: "placeholder" }), null);
  assert.equal(stripeWebhookSecret({ STRIPE_WEBHOOK_SECRET: "sk_live_example" }), null);
  assert.equal(stripeWebhookSecret({ STRIPE_WEBHOOK_SECRET: SECRET }), SECRET);
  assert.equal(bearerMatches("Bearer fixture-token", ""), false);
  assert.equal(bearerMatches("Bearer wrong", "fixture-token"), false);
  assert.equal(bearerMatches("Bearer fixture-token", "fixture-token"), true);
});
