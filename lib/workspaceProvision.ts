/*
 * Records a verified Stripe checkout in the durable file and, only for the
 * checkout owner, reads the existing workspace status route:
 *   GET /ws-status?session_id=
 *   { "ready": boolean, "login_url"?: string }
 * This site does not create the VPS. genesis-ws was not readable from this
 * account (no reggiebenjamin-bot/genesis-ws repository). Live status reads
 * stay off until GENESIS_WORKSPACE_ROLLOUT=live.
 */

import Stripe from "stripe";
import { alertFromSession, type PurchaseAlert } from "./purchaseAlert.ts";
import { resolvePlan } from "./checkoutPlans.ts";
import {
  classifyCheckout,
  isPaidCheckout,
  ownerMatches,
  readExistingWorkspaceStatus,
  rolloutAllows,
  tenantLoginUrl,
  viewWithoutLogin,
  workspaceStatusUrl,
  type OwnerPrincipal,
  type WorkspaceView,
} from "./workspaceAccess.ts";
import {
  openWorkspaceStore,
  workspaceStatePath,
  type CheckoutRow,
  type WorkspaceStore,
} from "./workspaceStore.ts";

const stripeForSignatures = new Stripe("sk_test_webhook_verify_only", {
  apiVersion: "2026-09-30.endive",
});

export function readSignedEvent(payload: string, signature: string | null, secret: string): Stripe.Event {
  if (!signature) throw new Error("Missing signature");
  return stripeForSignatures.webhooks.constructEvent(payload, signature, secret);
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export type WebhookAcceptance = {
  status: number;
  body: { received?: boolean; duplicate?: boolean; error?: string };
  duplicate: boolean;
  alert: PurchaseAlert | null;
};

export async function acceptWorkspaceWebhook(input: {
  payload: string;
  signature: string | null;
  secret: string;
  store: WorkspaceStore;
}): Promise<WebhookAcceptance> {
  let event: Stripe.Event;
  try {
    event = readSignedEvent(input.payload, input.signature, input.secret);
  } catch {
    return { status: 400, body: { error: "Invalid signature" }, duplicate: false, alert: null };
  }

  const environment = event.livemode ? "live" : "test";
  if (!input.store.claimEvent(environment, event.id)) {
    return { status: 200, body: { received: true, duplicate: true }, duplicate: true, alert: null };
  }

  const alert = applyEvent(event, input.store);
  return { status: 200, body: { received: true }, duplicate: false, alert };
}

function applyEvent(event: Stripe.Event, store: WorkspaceStore): PurchaseAlert | null {
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    store.endSubscription(text(subscription.id));
    return null;
  }
  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return null;
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const sessionId = text(session.id);
  if (!sessionId.startsWith("cs_")) return null;

  const planId = text(session.metadata?.plan);
  const kind = text(session.metadata?.kind);
  const paid = isPaidCheckout(text(session.status), text(session.payment_status));
  const checkoutClass = classifyCheckout(planId, kind);
  const details = session.customer_details;
  const email =
    (details && typeof details.email === "string" ? details.email : "") || text(session.customer_email);
  const ownerUserId = text(session.client_reference_id);
  const subscription = session.subscription;
  const subscriptionId = typeof subscription === "string" ? subscription : "";
  const environment = event.livemode ? "live" : "test";

  let phase: CheckoutRow["phase"] = "pending";
  let reason = paid ? "awaiting_status" : "unpaid";
  if (checkoutClass === "tool") {
    phase = "not_eligible";
    reason = "tool";
  } else if (checkoutClass === "refused") {
    phase = "not_eligible";
    reason = "unknown_plan";
  }

  store.saveCheckout({
    sessionId,
    environment,
    planId,
    kind,
    paid: paid && checkoutClass === "workspace",
    customerEmail: email,
    ownerUserId,
    subscriptionId,
    loginUrl: "",
    phase,
    reason,
  });

  return event.type === "checkout.session.completed"
    ? alertFromSession(session as unknown as Record<string, unknown>, !event.livemode)
    : null;
}

export async function ownerWorkspaceView(input: {
  store: WorkspaceStore;
  sessionId: string;
  principal: OwnerPrincipal | null;
  env?: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
}): Promise<WorkspaceView> {
  const row = input.store.getCheckout(input.sessionId);
  if (!row) return viewWithoutLogin("unconfirmed");

  const checkoutClass = classifyCheckout(row.planId, row.kind);
  if (checkoutClass !== "workspace") {
    return { ...viewWithoutLogin("not_eligible", row), planName: resolvePlan(row.planId)?.name ?? "" };
  }
  if (!row.paid) return viewWithoutLogin("unconfirmed", row);
  if (!ownerMatches(row, input.principal)) return viewWithoutLogin("sign_in", row);
  if (row.phase === "ended") return viewWithoutLogin("ended", row);

  const env = input.env ?? process.env;
  const planName = resolvePlan(row.planId)?.name ?? "";
  const cachedLogin = row.phase === "ready" ? tenantLoginUrl(row.loginUrl) : null;
  if (cachedLogin) {
    return { phase: "ready", loginUrl: cachedLogin, planId: row.planId, planName, paid: true };
  }
  if (!rolloutAllows(row.environment === "live", env) || !input.fetchImpl) {
    return { phase: "pending", loginUrl: null, planId: row.planId, planName, paid: true };
  }

  const status = await readExistingWorkspaceStatus(row.sessionId, {
    statusUrl: workspaceStatusUrl(env),
    fetchImpl: input.fetchImpl,
  });
  if (status.ready && status.loginUrl) {
    input.store.saveCheckout({ ...row, phase: "ready", reason: "ready", loginUrl: status.loginUrl });
    return { phase: "ready", loginUrl: status.loginUrl, planId: row.planId, planName, paid: true };
  }
  return { phase: "pending", loginUrl: null, planId: row.planId, planName, paid: true };
}

export function openConfiguredStore(env: Record<string, string | undefined> = process.env): WorkspaceStore | null {
  const path = workspaceStatePath(env);
  if (!path) return null;
  return openWorkspaceStore(path);
}
