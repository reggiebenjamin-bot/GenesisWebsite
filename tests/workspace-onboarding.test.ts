import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import Stripe from "stripe";
import { aiEmployeePlans } from "../lib/aiEmployees.ts";
import { genesisTools, managedPlans } from "../lib/offers.ts";
import {
  classifyCheckout,
  ownerMatches,
  rolloutAllows,
  tenantLoginUrl,
  workspaceCardCopy,
  workspaceDisclaimer,
  workspaceRollout,
} from "../lib/workspaceAccess.ts";
import { welcomeReadyCopy } from "../lib/welcomePath.ts";
import { acceptWorkspaceWebhook, openConfiguredStore, ownerWorkspaceView } from "../lib/workspaceProvision.ts";
import { openWorkspaceStore, workspaceStatePath, type WorkspaceStore } from "../lib/workspaceStore.ts";

const SECRET = "whsec_test_fixture_only";
const stripe = new Stripe("sk_test_fixture_only", { apiVersion: "2026-09-30.endive" });
const DASHES = ["-", "–", "—"];
const EMOJI = /\p{Extended_Pictographic}/u;
const BUYER = { userId: "user_buyer_a", email: "buyer-a@example.com" };
const OTHER = { userId: "user_other", email: "other@example.com" };

function tempStore(): { store: WorkspaceStore; path: string } {
  const path = join(mkdtempSync(join(tmpdir(), "genesis-ws-")), "state.sqlite");
  return { store: openWorkspaceStore(path), path };
}

function eventPayload(options: {
  id?: string;
  type?: string;
  livemode?: boolean;
  sessionId?: string;
  plan?: string;
  kind?: string;
  paymentStatus?: string;
  subscription?: string;
  email?: string;
  ownerUserId?: string;
}) {
  const livemode = options.livemode ?? false;
  return JSON.stringify({
    id: options.id ?? "evt_test_workspace",
    object: "event",
    api_version: "2026-09-30.endive",
    created: Math.floor(Date.now() / 1000),
    type: options.type ?? "checkout.session.completed",
    livemode,
    data: {
      object: {
        id: options.sessionId ?? "cs_test_buyerA",
        object: "checkout.session",
        status: "complete",
        payment_status: options.paymentStatus ?? "paid",
        mode: options.kind === "tool" ? "payment" : "subscription",
        livemode,
        metadata: { plan: options.plan ?? "managed-750", kind: options.kind ?? "managed" },
        subscription: options.subscription ?? "sub_test_buyerA",
        client_reference_id: options.ownerUserId ?? "",
        customer_details: { email: options.email ?? "buyer-a@example.com", name: "Buyer A" },
        amount_total: 75000,
        currency: "usd",
      },
    },
  });
}

function sign(payload: string, timestamp?: number) {
  return stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET, timestamp });
}

function accept(store: WorkspaceStore, payload: string, signature: string | null = sign(payload)) {
  return acceptWorkspaceWebhook({ payload, signature, secret: SECRET, store });
}

function statusFetch(body: { ready: boolean; login_url?: string }, calls: string[]): typeof fetch {
  return async (input) => {
    calls.push(String(input));
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
  };
}

test("public prices stay the published catalogs", () => {
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
  assert.equal(workspaceDisclaimer, "Genesis is software. We do not lend, place or arrange funding.");
});

test("tool purchases are not workspace entitlements and live rollout is a gate", () => {
  assert.equal(classifyCheckout("deal-architect", "tool"), "tool");
  assert.equal(classifyCheckout("managed-750", "managed"), "workspace");
  assert.equal(classifyCheckout("single", ""), "workspace");
  assert.equal(classifyCheckout("mystery", ""), "refused");
  assert.equal(workspaceRollout({}), "off");
  assert.equal(rolloutAllows(true, {}), false);
  assert.equal(rolloutAllows(false, { GENESIS_WORKSPACE_ROLLOUT: "test" }), true);
  assert.equal(rolloutAllows(true, { GENESIS_WORKSPACE_ROLLOUT: "test" }), false);
  assert.equal(rolloutAllows(true, { GENESIS_WORKSPACE_ROLLOUT: "live" }), true);
  assert.equal(workspaceStatePath({}), null);
  assert.equal(workspaceStatePath({ GENESIS_WORKSPACE_STATE_PATH: ":memory:" }), null);
  assert.equal(openConfiguredStore({}), null);
});

test("a tenant path on the shared host is allowed and the bare shared entry is not", () => {
  assert.equal(tenantLoginUrl("https://pod.genesisaisolutions.cloud"), null);
  assert.equal(tenantLoginUrl("https://pod.genesisaisolutions.cloud/"), null);
  assert.equal(
    tenantLoginUrl("https://pod.genesisaisolutions.cloud/t/buyerA/login"),
    "https://pod.genesisaisolutions.cloud/t/buyerA/login",
  );
  assert.equal(tenantLoginUrl("http://pod.genesisaisolutions.cloud/t/buyerA/login"), null);
  assert.equal(ownerMatches({ customerEmail: "Buyer-A@example.com", ownerUserId: "" }, BUYER), true);
  assert.equal(ownerMatches({ customerEmail: "buyer-a@example.com", ownerUserId: "user_buyer_a" }, OTHER), false);
  assert.equal(ownerMatches({ customerEmail: "", ownerUserId: "" }, BUYER), false);
});

test("welcome copy has no dash or emoji and ready is only the owner login state", () => {
  for (const [key, text] of Object.entries(welcomeReadyCopy)) {
    for (const dash of DASHES) assert.equal(text.includes(dash), false, key);
    assert.equal(EMOJI.test(text), false, key);
  }
  assert.equal(workspaceCardCopy("pending").showSignIn, false);
  assert.equal(workspaceCardCopy("sign_in").showSignIn, false);
  assert.notEqual(workspaceCardCopy("sign_in").heading, welcomeReadyCopy.accountReadyHeading);
  assert.equal(workspaceCardCopy("ready").showSignIn, true);
});

test("webhook signature, durable replay, and restart", async () => {
  const { store, path } = tempStore();
  const payload = eventPayload({ id: "evt_test_replay", sessionId: "cs_test_replayA" });
  assert.equal((await accept(store, payload, "t=1,v1=bad")).status, 400);
  assert.equal(
    (await accept(store, payload, sign(payload, Math.floor(Date.now() / 1000) - 600))).status,
    400,
  );
  assert.equal(store.getCheckout("cs_test_replayA"), null);

  const first = await accept(store, payload);
  const second = await accept(store, payload);
  assert.equal(first.status, 200);
  assert.equal(first.duplicate, false);
  assert.equal(second.duplicate, true);
  assert.equal(store.getCheckout("cs_test_replayA")?.customerEmail, "buyer-a@example.com");
  store.close();

  const reopened = openWorkspaceStore(path);
  assert.equal((await accept(reopened, payload)).duplicate, true);
  assert.equal(reopened.getCheckout("cs_test_replayA")?.paid, true);
  const hidden = await ownerWorkspaceView({ store: reopened, sessionId: "cs_test_replayA", principal: null });
  assert.equal(hidden.phase, "sign_in");
  assert.equal(hidden.loginUrl, null);
  reopened.close();
});

test("a session id alone does not reveal another tenant login", async () => {
  const { store } = tempStore();
  await accept(store, eventPayload({ id: "evt_test_tenantA", sessionId: "cs_test_tenantA", email: "buyer-a@example.com", subscription: "sub_test_tenantA" }));
  await accept(store, eventPayload({
    id: "evt_test_tenantB",
    sessionId: "cs_test_tenantB",
    email: "buyer-b@example.com",
    plan: "managed-1750",
    subscription: "sub_test_tenantB",
    ownerUserId: "user_buyer_b",
  }));
  store.saveCheckout({
    ...store.getCheckout("cs_test_tenantA")!,
    phase: "ready",
    loginUrl: "https://pod.genesisaisolutions.cloud/t/tenantA/login",
    reason: "ready",
  });
  store.saveCheckout({
    ...store.getCheckout("cs_test_tenantB")!,
    phase: "ready",
    loginUrl: "https://pod.genesisaisolutions.cloud/t/tenantB/login",
    reason: "ready",
  });

  const calls: string[] = [];
  const asStranger = await ownerWorkspaceView({
    store,
    sessionId: "cs_test_tenantA",
    principal: null,
    env: { GENESIS_WORKSPACE_ROLLOUT: "live" },
    fetchImpl: statusFetch({ ready: true, login_url: "https://pod.genesisaisolutions.cloud/t/stolen/login" }, calls),
  });
  const asOther = await ownerWorkspaceView({
    store,
    sessionId: "cs_test_tenantA",
    principal: OTHER,
    env: { GENESIS_WORKSPACE_ROLLOUT: "live" },
    fetchImpl: statusFetch({ ready: true, login_url: "https://pod.genesisaisolutions.cloud/t/stolen/login" }, calls),
  });
  const asOwner = await ownerWorkspaceView({
    store,
    sessionId: "cs_test_tenantA",
    principal: BUYER,
    env: { GENESIS_WORKSPACE_ROLLOUT: "off" },
    fetchImpl: statusFetch({ ready: true, login_url: "https://pod.genesisaisolutions.cloud/t/stolen/login" }, calls),
  });
  assert.equal(asStranger.loginUrl, null);
  assert.equal(asStranger.phase, "sign_in");
  assert.equal(asOther.loginUrl, null);
  assert.equal(JSON.stringify(asOther).includes("tenantB"), false);
  assert.equal(JSON.stringify(asStranger).includes("tenantA"), false);
  assert.equal(asOwner.loginUrl, "https://pod.genesisaisolutions.cloud/t/tenantA/login");
  assert.equal(calls.length, 0);

  const ended = JSON.parse(eventPayload({ id: "evt_test_endB", type: "customer.subscription.deleted" })) as {
    data: { object: Record<string, unknown> };
  };
  ended.data.object = { id: "sub_test_tenantB", object: "subscription" };
  const endedPayload = JSON.stringify(ended);
  await accept(store, endedPayload);
  const ownerB = await ownerWorkspaceView({
    store,
    sessionId: "cs_test_tenantB",
    principal: { userId: "user_buyer_b", email: "buyer-b@example.com" },
  });
  assert.equal(ownerB.phase, "ended");
  assert.equal(ownerB.loginUrl, null);
  assert.equal(
    (await ownerWorkspaceView({ store, sessionId: "cs_test_tenantA", principal: BUYER })).loginUrl,
    "https://pod.genesisaisolutions.cloud/t/tenantA/login",
  );
  store.close();
});

test("wrong entitlement, unpaid, and live rollout do not invent a login", async () => {
  const { store } = tempStore();
  const calls: string[] = [];
  const fetchImpl = statusFetch({ ready: true, login_url: "https://pod.genesisaisolutions.cloud/t/nope/login" }, calls);
  for (const entry of [
    { id: "evt_test_tool", sessionId: "cs_test_toolA", plan: "deal-architect", kind: "tool" },
    { id: "evt_test_unknown", sessionId: "cs_test_unknownA", plan: "mystery", kind: "" },
  ]) {
    await accept(store, eventPayload(entry));
    const view = await ownerWorkspaceView({ store, sessionId: entry.sessionId, principal: BUYER, fetchImpl });
    assert.equal(view.loginUrl, null);
    assert.equal(view.phase, "not_eligible");
  }
  await accept(store, eventPayload({ id: "evt_test_unpaid", sessionId: "cs_test_unpaidA", paymentStatus: "unpaid" }));
  await accept(store, eventPayload({ id: "evt_test_free", sessionId: "cs_test_freeA", paymentStatus: "no_payment_required" }));
  await accept(store, eventPayload({ id: "evt_test_live", sessionId: "cs_live_buyerA", livemode: true }));
  assert.equal((await ownerWorkspaceView({ store, sessionId: "cs_test_unpaidA", principal: BUYER, fetchImpl })).loginUrl, null);
  const liveOff = await ownerWorkspaceView({
    store,
    sessionId: "cs_live_buyerA",
    principal: BUYER,
    env: {},
    fetchImpl,
  });
  assert.equal(liveOff.phase, "pending");
  assert.equal(liveOff.loginUrl, null);
  assert.notEqual(workspaceCardCopy(liveOff.phase).heading, welcomeReadyCopy.accountReadyHeading);
  assert.equal(calls.length, 0);

  const liveOnCalls: string[] = [];
  const liveOn = await ownerWorkspaceView({
    store,
    sessionId: "cs_live_buyerA",
    principal: BUYER,
    env: {
      GENESIS_WORKSPACE_ROLLOUT: "live",
      GENESIS_WORKSPACE_STATUS_URL: "https://pod.genesisaisolutions.cloud/ws-status",
    },
    fetchImpl: statusFetch({ ready: true, login_url: "https://pod.genesisaisolutions.cloud/t/liveBuyer/login" }, liveOnCalls),
  });
  assert.equal(liveOn.phase, "ready");
  assert.equal(liveOn.loginUrl, "https://pod.genesisaisolutions.cloud/t/liveBuyer/login");
  assert.equal(liveOnCalls.length, 1);
  assert.match(liveOnCalls[0], /\/ws-status\?session_id=cs_live_buyerA$/);
  assert.equal(liveOnCalls[0].includes("api.stripe.com"), false);
  store.close();
});

test("status ready false stays pending and the bare shared entry is not a login", async () => {
  const { store } = tempStore();
  await accept(store, eventPayload({ id: "evt_test_wait", sessionId: "cs_test_waitA" }));
  await accept(store, eventPayload({ id: "evt_test_bare", sessionId: "cs_test_bareA" }));
  const waiting = await ownerWorkspaceView({
    store,
    sessionId: "cs_test_waitA",
    principal: BUYER,
    env: { GENESIS_WORKSPACE_ROLLOUT: "test", GENESIS_WORKSPACE_STATUS_URL: "https://pod.genesisaisolutions.cloud/ws-status" },
    fetchImpl: statusFetch({ ready: false }, []),
  });
  const bare = await ownerWorkspaceView({
    store,
    sessionId: "cs_test_bareA",
    principal: BUYER,
    env: { GENESIS_WORKSPACE_ROLLOUT: "test", GENESIS_WORKSPACE_STATUS_URL: "https://pod.genesisaisolutions.cloud/ws-status" },
    fetchImpl: statusFetch({ ready: true, login_url: "https://pod.genesisaisolutions.cloud/" }, []),
  });
  assert.equal(waiting.phase, "pending");
  assert.equal(waiting.loginUrl, null);
  assert.equal(bare.phase, "pending");
  assert.equal(bare.loginUrl, null);
  assert.notEqual(workspaceCardCopy("pending").heading, welcomeReadyCopy.accountReadyHeading);
  store.close();
});

test("two workers cannot both claim one event", async () => {
  const path = join(mkdtempSync(join(tmpdir(), "genesis-ws-race-")), "state.sqlite");
  const setup = openWorkspaceStore(path);
  setup.close();
  const run = () =>
    new Promise<string>((resolve, reject) => {
      const child = spawn(process.execPath, [
        "--experimental-strip-types",
        "--disable-warning=ExperimentalWarning",
        "tests/workspace-store-claim.ts",
        path,
        "test",
        "evt_race",
      ], { cwd: process.cwd() });
      let out = "";
      let err = "";
      child.stdout.on("data", (chunk) => {
        out += chunk;
      });
      child.stderr.on("data", (chunk) => {
        err += chunk;
      });
      child.on("exit", (code) => (code === 0 ? resolve(out.trim()) : reject(new Error(err || out))));
    });
  const results = await Promise.all([run(), run()]);
  assert.deepEqual(results.sort(), ["lost", "won"]);
  const check = openWorkspaceStore(path);
  assert.equal(check.claimEvent("test", "evt_race"), false);
  check.close();
});
