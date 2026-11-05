/*
 * Site side of payment to workspace. Stripe is verified here. A private
 * workspace is recorded only for a paid subscription we already sell.
 *
 * The durable provisioner is not in this repository. When
 * WORKSPACE_PROVISIONER_URL is unset, a paid buyer stays pending. This process
 * remembers event ids so a replay does not start a second job. A multi
 * instance host still needs the companion service to treat the Checkout
 * Session id as the idempotency key.
 *
 * Companion contract, test mode only from this site:
 *   POST {WORKSPACE_PROVISIONER_URL}
 *   Authorization: Bearer {WORKSPACE_PROVISIONER_TOKEN}
 *   Idempotency-Key: the Checkout Session id
 *   {"session_id","plan","kind","livemode":false,"event_id"}
 *   Response: {"phase":"pending"|"failed"}
 *     or {"phase":"ready","login_url":"https://dedicated-host/..."}
 *   The login host must not be pod.genesisaisolutions.cloud.
 *   Later, POST /api/workspace/provision with the same bearer token may report
 *   ready or failed for a session this site already entitled. It cannot create
 *   a session that was never paid.
 */

import { timingSafeEqual } from "node:crypto";
import Stripe from "stripe";
import { resolvePlan } from "./checkoutPlans.ts";
import { alertFromSession, type PurchaseAlert } from "./purchaseAlert.ts";
import {
  classifyCheckout,
  isPaidCheckout,
  publicWorkspaceStatus,
  safeWorkspaceLogin,
  type PublicWorkspaceStatus,
  type WorkspacePhase,
  type WorkspaceReason,
} from "./workspaceAccess.ts";

export type ProvisionCommand = {
  sessionId: string;
  planId: string;
  kind: string;
  livemode: boolean;
  eventId: string;
};

export type ProvisionResult = {
  phase: "pending" | "ready" | "failed";
  loginUrl?: string;
};

export type WorkspaceRecord = {
  sessionId: string;
  eventId: string;
  planId: string;
  kind: string;
  livemode: boolean;
  paid: boolean;
  phase: WorkspacePhase;
  loginUrl: string | null;
  reason: WorkspaceReason;
  provisioned: boolean;
  subscriptionId: string | null;
};

type EventClaim = "inflight" | "done";

export class WorkspaceLedger {
  private events = new Map<string, EventClaim>();
  private sessions = new Map<string, WorkspaceRecord>();

  claim(eventKey: string): "new" | "duplicate" | "inflight" {
    const existing = this.events.get(eventKey);
    if (existing === "done") return "duplicate";
    if (existing === "inflight") return "inflight";
    this.events.set(eventKey, "inflight");
    return "new";
  }

  complete(eventKey: string) {
    this.events.set(eventKey, "done");
  }

  release(eventKey: string) {
    if (this.events.get(eventKey) === "inflight") this.events.delete(eventKey);
  }

  get(sessionId: string): WorkspaceRecord | null {
    return this.sessions.get(sessionId) ?? null;
  }

  list(): WorkspaceRecord[] {
    return [...this.sessions.values()];
  }

  /**
   * A ready login stays on the session that earned it. Pass replaceReady only
   * to revoke that login, never to point it at a different workspace.
   */
  save(record: WorkspaceRecord, options?: { replaceReady?: boolean }) {
    const current = this.sessions.get(record.sessionId);
    if (current?.phase === "ready" && current.loginUrl && !options?.replaceReady) return;
    this.sessions.set(record.sessionId, record);
  }
}

const ledgerGlobal = globalThis as typeof globalThis & { __genesisWorkspaceLedger?: WorkspaceLedger };
if (!ledgerGlobal.__genesisWorkspaceLedger) {
  ledgerGlobal.__genesisWorkspaceLedger = new WorkspaceLedger();
}
/** One ledger per process, shared by the page and the route bundles. */
export const workspaceLedger = ledgerGlobal.__genesisWorkspaceLedger;

export function bearerMatches(header: string, expected: string): boolean {
  if (!expected) return false;
  const presented = Buffer.from(header);
  const required = Buffer.from(`Bearer ${expected}`);
  if (presented.length !== required.length) return false;
  return timingSafeEqual(presented, required);
}

const stripeForSignatures = new Stripe("sk_test_webhook_verify_only", {
  apiVersion: "2026-09-30.endive",
});

export function readSignedEvent(payload: string, signature: string | null, secret: string): Stripe.Event {
  if (!signature) {
    throw new Error("Missing signature");
  }
  return stripeForSignatures.webhooks.constructEvent(payload, signature, secret);
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function subscriptionIdOf(session: Stripe.Checkout.Session): string | null {
  const value = session.subscription;
  if (typeof value === "string" && value.startsWith("sub_")) return value;
  return null;
}

function settle(result: ProvisionResult): Pick<WorkspaceRecord, "phase" | "loginUrl" | "reason"> {
  if (result.phase === "failed") {
    return { phase: "failed", loginUrl: null, reason: "provision_failed" };
  }
  if (result.phase === "ready") {
    const loginUrl = safeWorkspaceLogin(result.loginUrl);
    if (!loginUrl) return { phase: "failed", loginUrl: null, reason: "unsafe_login" };
    return { phase: "ready", loginUrl, reason: "ready" };
  }
  return { phase: "pending", loginUrl: null, reason: "awaiting_provision" };
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
  ledger: WorkspaceLedger;
  provision?: (command: ProvisionCommand) => Promise<ProvisionResult>;
}): Promise<WebhookAcceptance> {
  const provision = input.provision ?? (async () => ({ phase: "pending" as const }));
  let event: Stripe.Event;
  try {
    event = readSignedEvent(input.payload, input.signature, input.secret);
  } catch {
    return { status: 400, body: { error: "Invalid signature" }, duplicate: false, alert: null };
  }

  const eventKey = `${event.livemode ? "live" : "test"}:${event.id}`;
  const claim = input.ledger.claim(eventKey);
  if (claim === "duplicate") {
    return { status: 200, body: { received: true, duplicate: true }, duplicate: true, alert: null };
  }
  if (claim === "inflight") {
    return { status: 500, body: { error: "Event is already running" }, duplicate: true, alert: null };
  }

  try {
    const alert = await applyEvent(event, input.ledger, provision);
    input.ledger.complete(eventKey);
    return { status: 200, body: { received: true }, duplicate: false, alert };
  } catch {
    input.ledger.release(eventKey);
    return { status: 500, body: { error: "Provision failed" }, duplicate: false, alert: null };
  }
}

async function applyEvent(
  event: Stripe.Event,
  ledger: WorkspaceLedger,
  provision: (command: ProvisionCommand) => Promise<ProvisionResult>,
): Promise<PurchaseAlert | null> {
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    endSubscription(ledger, subscription.id);
    return null;
  }

  if (!event.type.startsWith("checkout.session.")) return null;

  const session = event.data.object as Stripe.Checkout.Session;
  const sessionId = text(session.id);
  if (!sessionId.startsWith("cs_")) return null;

  const planId = text(session.metadata?.plan);
  const kind = text(session.metadata?.kind);
  const paid = isPaidCheckout(text(session.status), text(session.payment_status));
  const checkoutClass = classifyCheckout(planId, kind);
  const existing = ledger.get(sessionId);

  if (event.type === "checkout.session.async_payment_failed") {
    if (checkoutClass === "workspace") {
      ledger.save({
        sessionId,
        eventId: event.id,
        planId,
        kind,
        livemode: event.livemode,
        paid: false,
        phase: "failed",
        loginUrl: null,
        reason: "provision_failed",
        provisioned: existing?.provisioned ?? false,
        subscriptionId: subscriptionIdOf(session),
      });
    }
    return null;
  }

  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return null;
  }

  const alert =
    event.type === "checkout.session.completed"
      ? alertFromSession(session as unknown as Record<string, unknown>, !event.livemode)
      : null;

  if (checkoutClass !== "workspace") {
    ledger.save({
      sessionId,
      eventId: event.id,
      planId,
      kind,
      livemode: event.livemode,
      paid,
      phase: "not_eligible",
      loginUrl: null,
      reason: checkoutClass === "tool" ? "tool" : "unknown_plan",
      provisioned: false,
      subscriptionId: subscriptionIdOf(session),
    });
    return alert;
  }

  if (!paid || event.livemode) {
    ledger.save({
      sessionId,
      eventId: event.id,
      planId,
      kind,
      livemode: event.livemode,
      paid,
      phase: "pending",
      loginUrl: null,
      reason: event.livemode ? "live_deferred" : "unpaid",
      provisioned: false,
      subscriptionId: subscriptionIdOf(session),
    });
    return alert;
  }

  if (existing?.provisioned) return alert;

  const settled = settle(
    await provision({
      sessionId,
      planId,
      kind,
      livemode: false,
      eventId: event.id,
    }),
  );

  ledger.save({
    sessionId,
    eventId: event.id,
    planId,
    kind,
    livemode: false,
    paid: true,
    phase: settled.phase,
    loginUrl: settled.loginUrl,
    reason: settled.reason,
    provisioned: true,
    subscriptionId: subscriptionIdOf(session),
  });
  return alert;
}

function endSubscription(ledger: WorkspaceLedger, subscriptionId: string) {
  if (!subscriptionId) return;
  for (const record of ledgerSessions(ledger)) {
    if (record.subscriptionId !== subscriptionId) continue;
    if (record.livemode) continue;
    ledger.save(
      {
        ...record,
        phase: "failed",
        loginUrl: null,
        reason: "subscription_ended",
        provisioned: true,
      },
      { replaceReady: true },
    );
  }
}

function ledgerSessions(ledger: WorkspaceLedger): WorkspaceRecord[] {
  return ledger.list();
}

export function statusForSession(ledger: WorkspaceLedger, sessionId: string): PublicWorkspaceStatus {
  if (!/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId)) {
    return { phase: "pending", loginUrl: null, reason: "unknown_session" };
  }
  return publicWorkspaceStatus(ledger.get(sessionId));
}

export function applyProvisionReport(
  ledger: WorkspaceLedger,
  input: { sessionId: string; phase: "pending" | "ready" | "failed"; loginUrl?: string },
): { status: number; body: PublicWorkspaceStatus | { error: string } } {
  const current = ledger.get(input.sessionId);
  if (!current) return { status: 404, body: { error: "Unknown session" } };
  if (current.livemode) {
    return { status: 409, body: publicWorkspaceStatus(current) };
  }
  if (current.phase === "not_eligible" || !current.paid || current.reason === "subscription_ended") {
    return { status: 409, body: publicWorkspaceStatus(current) };
  }
  if (current.phase === "ready" && current.loginUrl) {
    return { status: 200, body: publicWorkspaceStatus(current) };
  }

  const settled = settle(
    input.phase === "ready"
      ? { phase: "ready", loginUrl: input.loginUrl }
      : { phase: input.phase },
  );
  const next: WorkspaceRecord = {
    ...current,
    phase: settled.phase,
    loginUrl: settled.loginUrl,
    reason: settled.reason,
    provisioned: true,
  };
  ledger.save(next);
  return { status: 200, body: publicWorkspaceStatus(ledger.get(input.sessionId)) };
}

/**
 * Calls the companion provisioner when a URL is configured. Live mode and the
 * shared pod are never called. With no URL, the buyer stays pending.
 */
export async function postProvisionRequest(
  command: ProvisionCommand,
  options: {
    env?: Record<string, string | undefined>;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<ProvisionResult> {
  if (command.livemode) return { phase: "pending" };
  const env = options.env ?? process.env;
  const rawUrl = env.WORKSPACE_PROVISIONER_URL?.trim() ?? "";
  if (!rawUrl) return { phase: "pending" };

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return { phase: "failed" };
  }

  const local = target.hostname === "127.0.0.1" || target.hostname === "localhost";
  const https = target.protocol === "https:";
  const localHttp = target.protocol === "http:" && local;
  if (!https && !localHttp) return { phase: "failed" };
  if (target.hostname === "pod.genesisaisolutions.cloud") return { phase: "pending" };

  const fetchImpl = options.fetchImpl ?? fetch;
  const token = env.WORKSPACE_PROVISIONER_TOKEN?.trim() ?? "";
  let response: Response;
  try {
    response = await fetchImpl(target, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": command.sessionId,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        session_id: command.sessionId,
        plan: command.planId,
        kind: command.kind,
        livemode: false,
        event_id: command.eventId,
      }),
    });
  } catch {
    return { phase: "failed" };
  }
  if (!response.ok) return { phase: "failed" };

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return { phase: "failed" };
  }
  if (!data || typeof data !== "object") return { phase: "failed" };
  const body = data as { phase?: unknown; login_url?: unknown };
  if (body.phase === "failed") return { phase: "failed" };
  if (body.phase === "ready" && typeof body.login_url === "string") {
    return { phase: "ready", loginUrl: body.login_url };
  }
  return { phase: "pending" };
}

export function welcomeCheckoutFromLedger(ledger: WorkspaceLedger, sessionId: string): {
  planId: string;
  kind: string;
  paid: boolean;
  planName: string;
  livemode: boolean;
} | null {
  const record = ledger.get(sessionId);
  if (!record) return null;
  return {
    planId: record.planId,
    kind: record.kind,
    paid: record.paid,
    planName: resolvePlan(record.planId)?.name ?? "",
    livemode: record.livemode,
  };
}
