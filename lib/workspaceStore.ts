/*
 * Durable payment record for this site. The file survives a process restart
 * and is shared by workers that open the same path. `:memory:` is rejected.
 * This is not the VPS database. genesis-ws was not available here.
 */

import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { DatabaseSync } from "node:sqlite";

export type WorkspacePhase = "pending" | "ready" | "ended" | "not_eligible";

export type CheckoutRow = {
  sessionId: string;
  environment: "test" | "live";
  planId: string;
  kind: string;
  paid: boolean;
  customerEmail: string;
  ownerUserId: string;
  subscriptionId: string;
  loginUrl: string;
  phase: WorkspacePhase;
  reason: string;
};

export type WorkspaceStore = {
  claimEvent(environment: string, eventId: string): boolean;
  getCheckout(sessionId: string): CheckoutRow | null;
  saveCheckout(row: CheckoutRow): void;
  endSubscription(subscriptionId: string): void;
  close(): void;
};

const schema = `
CREATE TABLE IF NOT EXISTS webhook_events (
  environment TEXT NOT NULL,
  event_id TEXT NOT NULL,
  received_at TEXT NOT NULL,
  PRIMARY KEY (environment, event_id)
);
CREATE TABLE IF NOT EXISTS checkouts (
  session_id TEXT PRIMARY KEY,
  environment TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  paid INTEGER NOT NULL,
  customer_email TEXT NOT NULL,
  owner_user_id TEXT NOT NULL,
  subscription_id TEXT NOT NULL,
  login_url TEXT NOT NULL,
  phase TEXT NOT NULL,
  reason TEXT NOT NULL
);
`;

export function workspaceStatePath(env: Record<string, string | undefined> = process.env): string | null {
  const value = env.GENESIS_WORKSPACE_STATE_PATH?.trim() ?? "";
  if (!value || value === ":memory:") return null;
  return value;
}

export function openWorkspaceStore(path: string): WorkspaceStore {
  if (!path || path === ":memory:") {
    throw new Error("Workspace state requires a file path");
  }
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA busy_timeout = 3000;");
  db.exec(schema);

  const claim = db.prepare(
    "INSERT OR IGNORE INTO webhook_events (environment, event_id, received_at) VALUES (?, ?, ?)",
  );
  const read = db.prepare("SELECT * FROM checkouts WHERE session_id = ?");
  const write = db.prepare(`
    INSERT INTO checkouts (
      session_id, environment, plan_id, kind, paid, customer_email, owner_user_id,
      subscription_id, login_url, phase, reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(session_id) DO UPDATE SET
      paid = excluded.paid OR checkouts.paid,
      customer_email = CASE
        WHEN excluded.customer_email <> '' THEN excluded.customer_email
        ELSE checkouts.customer_email
      END,
      owner_user_id = CASE
        WHEN excluded.owner_user_id <> '' THEN excluded.owner_user_id
        ELSE checkouts.owner_user_id
      END,
      subscription_id = CASE
        WHEN excluded.subscription_id <> '' THEN excluded.subscription_id
        ELSE checkouts.subscription_id
      END,
      login_url = CASE
        WHEN excluded.login_url <> '' THEN excluded.login_url
        ELSE checkouts.login_url
      END,
      phase = excluded.phase,
      reason = excluded.reason
  `);
  const endSub = db.prepare(`
    UPDATE checkouts
    SET login_url = '', phase = 'ended', reason = 'subscription_ended'
    WHERE subscription_id = ? AND subscription_id <> ''
  `);

  return {
    claimEvent(environment, eventId) {
      const result = claim.run(environment, eventId, new Date().toISOString());
      return result.changes === 1;
    },
    getCheckout(sessionId) {
      const row = read.get(sessionId) as Record<string, unknown> | undefined;
      if (!row) return null;
      return {
        sessionId: String(row.session_id),
        environment: row.environment === "live" ? "live" : "test",
        planId: String(row.plan_id),
        kind: String(row.kind),
        paid: row.paid === 1,
        customerEmail: String(row.customer_email),
        ownerUserId: String(row.owner_user_id),
        subscriptionId: String(row.subscription_id),
        loginUrl: String(row.login_url),
        phase: row.phase as WorkspacePhase,
        reason: String(row.reason),
      };
    },
    saveCheckout(row) {
      write.run(
        row.sessionId,
        row.environment,
        row.planId,
        row.kind,
        row.paid ? 1 : 0,
        row.customerEmail,
        row.ownerUserId,
        row.subscriptionId,
        row.loginUrl,
        row.phase,
        row.reason,
      );
    },
    endSubscription(subscriptionId) {
      if (!subscriptionId) return;
      endSub.run(subscriptionId);
    },
    close() {
      db.close();
    },
  };
}
