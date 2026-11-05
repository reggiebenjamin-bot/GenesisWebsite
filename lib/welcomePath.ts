/*
 * The post checkout welcome page serves two audiences. Managed plans keep the
 * guided onboarding intake. Everything else (the AI Employees plans, the tools,
 * the packs, an unknown plan id, or a visit with no confirmed session) is a
 * self serve account, so it sees the sign in card instead of the intake.
 *
 * This is the one place that decides which path a visitor is on, and the one
 * place the ready path copy lives, so the page and its tests cannot drift.
 *
 * No path aliases in this file: tests import it directly under Node.
 */

import { isManagedPlanId } from "./offers.ts";
import { FUNDING_LINE } from "./legal.ts";

/** The default Clerk workspace for a new Genesis account. */
export const POD_URL = "https://pod.genesisaisolutions.cloud";

/**
 * True for the managed onboarding experience: a checkout whose metadata names
 * the managed kind, or whose plan id is one of the Genesis Managed AI plans.
 * Everything else is the self serve ready path.
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
  body: "Sign in with your Genesis email. To set or reset your password, choose Forgot password on the sign in screen and follow the code we email you.",
  button: "Sign in to Genesis",
  workspaceNote: "A new workspace can take about a minute.",
  disclaimer: FUNDING_LINE,
} as const;
