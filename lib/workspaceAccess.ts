/*
 * Who may receive a private workspace, and which login link is safe to show.
 * Tool purchases stay on the tool they bought. The shared pod is never a
 * buyer login. No path aliases: tests import this file directly under Node.
 */

import { aiEmployeePlans } from "./aiEmployees.ts";
import { FUNDING_LINE } from "./legal.ts";
import { isManagedPlanId } from "./offers.ts";
import { isWorkspaceToolId } from "./toolWorkspace.ts";
import { welcomeReadyCopy } from "./welcomePath.ts";

/** The one shared workspace. A buyer login must never use this host. */
export const SHARED_WORKSPACE_HOST = "pod.genesisaisolutions.cloud";

export type CheckoutClass = "workspace" | "tool" | "refused";

export type WorkspacePhase = "pending" | "ready" | "failed" | "not_eligible";

export type WorkspaceReason =
  | "unknown_session"
  | "unpaid"
  | "tool"
  | "unknown_plan"
  | "awaiting_provision"
  | "provision_failed"
  | "unsafe_login"
  | "ready"
  | "live_deferred"
  | "subscription_ended";

export type PublicWorkspaceStatus = {
  phase: WorkspacePhase;
  loginUrl: string | null;
  reason: WorkspaceReason;
};

export function isAiEmployeePlanId(value: string): boolean {
  return aiEmployeePlans.some((plan) => plan.id === value);
}

/**
 * Paid workspace subscriptions are the managed plans and the AI Employees
 * plans already sold on this site. A one time tool is never a workspace.
 * An empty or unknown plan is refused so we do not invent an entitlement.
 */
export function classifyCheckout(planId: string, kind: string): CheckoutClass {
  const toolId = isWorkspaceToolId(planId);
  const managedId = isManagedPlanId(planId);
  const employeeId = isAiEmployeePlanId(planId);

  if (kind === "tool") {
    return toolId && !managedId && !employeeId ? "tool" : "refused";
  }
  if (toolId) return "tool";
  if (kind === "managed") return managedId ? "workspace" : "refused";
  if (managedId || employeeId) return "workspace";
  return "refused";
}

export function isPaidCheckout(status: string, paymentStatus: string): boolean {
  return status === "complete" && paymentStatus === "paid";
}

/**
 * Accept only an https login for a host that is not the shared pod.
 * Localhost and credentialed URLs are rejected.
 */
export function safeWorkspaceLogin(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  if (url.hostname === SHARED_WORKSPACE_HOST) return null;
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return null;
  return url.toString();
}

export function publicWorkspaceStatus(record: {
  phase: WorkspacePhase;
  loginUrl: string | null;
  reason: WorkspaceReason;
  livemode: boolean;
} | null): PublicWorkspaceStatus {
  if (!record) {
    return { phase: "pending", loginUrl: null, reason: "unknown_session" };
  }
  if (record.livemode) {
    return { phase: "pending", loginUrl: null, reason: "live_deferred" };
  }
  if (record.phase === "ready") {
    const loginUrl = safeWorkspaceLogin(record.loginUrl);
    if (!loginUrl) {
      return { phase: "failed", loginUrl: null, reason: "unsafe_login" };
    }
    return { phase: "ready", loginUrl, reason: "ready" };
  }
  if (record.phase === "not_eligible") {
    return { phase: "not_eligible", loginUrl: null, reason: record.reason };
  }
  if (record.phase === "failed") {
    return { phase: "failed", loginUrl: null, reason: record.reason };
  }
  return { phase: "pending", loginUrl: null, reason: record.reason };
}

export type WelcomeDecision = "bare" | "unconfirmed" | "unpaid" | "tool" | "workspace" | "refused";

export function welcomeDecision(input: {
  confirmed: boolean;
  paid: boolean;
  planId: string;
  kind: string;
}): WelcomeDecision {
  if (!input.confirmed) return "unconfirmed";
  if (!input.paid) return "unpaid";
  const checkoutClass = classifyCheckout(input.planId, input.kind);
  if (checkoutClass === "tool") return "tool";
  if (checkoutClass === "workspace") return "workspace";
  return "refused";
}

/** Visitor copy for the workspace card. Ready is only the provisioned state. */
export function workspaceCardCopy(phase: WorkspacePhase): {
  heading: string;
  note: string;
  showSignIn: boolean;
} {
  if (phase === "ready") {
    return { heading: welcomeReadyCopy.accountReadyHeading, note: "", showSignIn: true };
  }
  if (phase === "failed") {
    return {
      heading: welcomeReadyCopy.failedHeading,
      note: welcomeReadyCopy.failedNote,
      showSignIn: false,
    };
  }
  if (phase === "not_eligible") {
    return {
      heading: welcomeReadyCopy.toolHeading,
      note: welcomeReadyCopy.toolBody,
      showSignIn: false,
    };
  }
  return {
    heading: welcomeReadyCopy.pendingHeading,
    note: welcomeReadyCopy.workspaceNote,
    showSignIn: false,
  };
}

export const workspaceDisclaimer = FUNDING_LINE;
