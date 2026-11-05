/*
 * Who may see a workspace login. The existing status route is
 * GET {pod}/ws-status?session_id= and it returns { ready, login_url }.
 * A Checkout Session id by itself is not permission to receive that login.
 * The shared pod host can still host a tenant. Only the bare shared entry,
 * the URL this site used for every visitor, is refused.
 */

import { aiEmployeePlans } from "./aiEmployees.ts";
import { FUNDING_LINE } from "./legal.ts";
import { isManagedPlanId } from "./offers.ts";
import { isWorkspaceToolId } from "./toolWorkspace.ts";
import { POD_URL, welcomeReadyCopy } from "./welcomePath.ts";
import type { CheckoutRow } from "./workspaceStore.ts";

export type CheckoutClass = "workspace" | "tool" | "refused";

export type OwnerPrincipal = {
  userId: string;
  email: string;
};

export type WorkspaceViewPhase = "unconfirmed" | "sign_in" | "pending" | "ready" | "ended" | "not_eligible";

export type WorkspaceView = {
  phase: WorkspaceViewPhase;
  loginUrl: string | null;
  planId: string;
  planName: string;
  paid: boolean;
};

export function isAiEmployeePlanId(value: string): boolean {
  return aiEmployeePlans.some((plan) => plan.id === value);
}

/** Existing paid subscriptions. A one time tool is never a workspace. */
export function classifyCheckout(planId: string, kind: string): CheckoutClass {
  const toolId = isWorkspaceToolId(planId);
  const managedId = isManagedPlanId(planId);
  const employeeId = isAiEmployeePlanId(planId);
  if (kind === "tool") return toolId && !managedId && !employeeId ? "tool" : "refused";
  if (toolId) return "tool";
  if (kind === "managed") return managedId ? "workspace" : "refused";
  if (managedId || employeeId) return "workspace";
  return "refused";
}

export function isPaidCheckout(status: string, paymentStatus: string): boolean {
  return status === "complete" && paymentStatus === "paid";
}

/**
 * Rollout gate. Unset or off does not call the status route.
 * `test` allows paid test mode. `live` allows paid test and paid live.
 */
export function workspaceRollout(env: Record<string, string | undefined> = process.env): "off" | "test" | "live" {
  const value = env.GENESIS_WORKSPACE_ROLLOUT?.trim().toLowerCase() ?? "";
  if (value === "live" || value === "test") return value;
  return "off";
}

export function rolloutAllows(livemode: boolean, env: Record<string, string | undefined> = process.env): boolean {
  const gate = workspaceRollout(env);
  if (gate === "live") return true;
  if (gate === "test") return !livemode;
  return false;
}

/** Existing workspace status route. Tests pass their own URL. */
export function workspaceStatusUrl(env: Record<string, string | undefined> = process.env): string {
  const configured = env.GENESIS_WORKSPACE_STATUS_URL?.trim() ?? "";
  if (configured) return configured;
  return `${POD_URL}/ws-status`;
}

/**
 * Accept the login the existing status route returned, including one on the
 * shared pod host. Refuse the bare shared entry this site previously gave
 * to every visitor.
 */
export function tenantLoginUrl(value: unknown, sharedRoot = POD_URL): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  let shared: URL;
  try {
    shared = new URL(sharedRoot);
  } catch {
    return url.toString();
  }
  const barePath = url.pathname === "" || url.pathname === "/";
  if (url.origin === shared.origin && barePath && !url.search && !url.hash) return null;
  return url.toString();
}

export function ownerMatches(row: Pick<CheckoutRow, "customerEmail" | "ownerUserId">, principal: OwnerPrincipal | null): boolean {
  if (!principal) return false;
  const email = principal.email.trim().toLowerCase();
  const ownerEmail = row.customerEmail.trim().toLowerCase();
  const userId = principal.userId.trim();
  const ownerId = row.ownerUserId.trim();
  if (ownerId && userId && ownerId === userId) return true;
  if (ownerEmail && email && ownerEmail === email) return true;
  return false;
}

export type StatusBody = { ready?: unknown; login_url?: unknown };

/** Reads the committed { ready, login_url } status. Does not create a workspace. */
export async function readExistingWorkspaceStatus(
  sessionId: string,
  options: { statusUrl: string; fetchImpl: typeof fetch },
): Promise<{ ready: boolean; loginUrl: string | null }> {
  const url = new URL(options.statusUrl);
  url.searchParams.set("session_id", sessionId);
  const response = await options.fetchImpl(url, { method: "GET", cache: "no-store" });
  if (!response.ok) return { ready: false, loginUrl: null };
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return { ready: false, loginUrl: null };
  }
  if (!data || typeof data !== "object") return { ready: false, loginUrl: null };
  const body = data as StatusBody;
  if (body.ready !== true) return { ready: false, loginUrl: null };
  return { ready: true, loginUrl: tenantLoginUrl(body.login_url) };
}

export function viewWithoutLogin(phase: WorkspaceViewPhase, row?: CheckoutRow | null): WorkspaceView {
  return {
    phase,
    loginUrl: null,
    planId: row?.planId ?? "",
    planName: "",
    paid: row?.paid ?? false,
  };
}

export const workspaceDisclaimer = FUNDING_LINE;

export function workspaceCardCopy(phase: WorkspaceViewPhase): { heading: string; note: string; showSignIn: boolean } {
  if (phase === "ready") {
    return { heading: welcomeReadyCopy.accountReadyHeading, note: "", showSignIn: true };
  }
  if (phase === "ended") {
    return { heading: welcomeReadyCopy.failedHeading, note: welcomeReadyCopy.failedNote, showSignIn: false };
  }
  if (phase === "sign_in") {
    return { heading: welcomeReadyCopy.signInGateHeading, note: welcomeReadyCopy.signInGateNote, showSignIn: false };
  }
  if (phase === "not_eligible") {
    return { heading: welcomeReadyCopy.toolHeading, note: welcomeReadyCopy.toolBody, showSignIn: false };
  }
  return { heading: welcomeReadyCopy.pendingHeading, note: welcomeReadyCopy.workspaceNote, showSignIn: false };
}
