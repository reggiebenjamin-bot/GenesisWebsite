/*
 * Managed plans keep the guided onboarding intake. Other plans do not.
 * A private workspace login is decided in workspaceAccess.ts. This file only
 * keeps the shared pod host (never a buyer login) and the welcome copy.
 *
 * No path aliases in this file: tests import it directly under Node.
 */

import { isManagedPlanId } from "./offers.ts";
import { FUNDING_LINE } from "./legal.ts";

/** Shared workspace host. Never use this as a buyer sign in link. */
export const POD_URL = "https://pod.genesisaisolutions.cloud";

/**
 * True for the managed onboarding experience: a checkout whose metadata names
 * the managed kind, or whose plan id is one of the Genesis Managed AI plans.
 * Tool purchases and AI Employees plans do not take this intake.
 */
export function isManagedWelcome(planId: string, kind?: string): boolean {
  if (kind === "managed") return true;
  return isManagedPlanId(planId);
}

/** The ready path copy, in one place, so the page and the tests read the same strings. */
export const welcomeReadyCopy = {
  accountReadyHeading: "Your account is ready.",
  signInHeading: "Sign in to Genesis.",
  welcomeHeading: "Welcome to Genesis.",
  pendingHeading: "Your workspace is being prepared.",
  failedHeading: "Your workspace is not ready.",
  failedNote: "We could not finish a private workspace. We will not send you to a shared one.",
  toolHeading: "Your tool purchase is confirmed.",
  toolBody: "This purchase is for one finished result. It does not open a private workspace.",
  unconfirmedHeading: "We could not confirm that checkout.",
  unpaidHeading: "Payment is not complete.",
  refusedHeading: "This purchase does not include a workspace.",
  bareNote: "A private workspace sign in link appears here only after your paid workspace is ready.",
  body: "Sign in with your Genesis email. To set or reset your password, choose Forgot password on the sign in screen and follow the code we email you.",
  button: "Sign in to Genesis",
  workspaceNote: "A new workspace can take about a minute.",
  disclaimer: FUNDING_LINE,
} as const;
