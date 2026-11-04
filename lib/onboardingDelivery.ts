/**
 * Delivery on the post checkout welcome page: the plainly written welcome
 * email text shown to every customer, the day 1 deliverables for each plan,
 * the onboarding checklist, and the Teams onboarding card posted after intake.
 *
 * The card builder and the plan lookups take no network, so they are unit
 * tested on their own. The posting helper is modelled on lib/purchaseAlert.ts.
 *
 * No path aliases in this file: tests import it directly under Node.
 */

import type { IntakeInput } from "./onboardingIntake.ts";
import { resolvePlan } from "./checkoutPlans.ts";

/** The welcome email, written so the same words can be shown on the page. */
export const welcomeEmail = {
  subject: "Welcome to Genesis",
  intro: "Thank you for choosing Genesis. Here is what happens next.",
  sections: [
    {
      title: "Complete your intake",
      body: "Fill out the short intake form on this page so we have what we need to begin. The more you share, the faster we can start.",
    },
    {
      title: "Book your kickoff",
      body: "Pick a time for a short kickoff call. We confirm your goals, your tools, and the plan for the first week.",
    },
    {
      title: "Day 1 deliverables",
      body: "Within one business day we put the first pieces of your setup in place, so you see progress right away.",
    },
    {
      title: "Seven day check in",
      body: "One week in we review what is working, answer your questions, and set the next steps together.",
    },
  ],
  closing: "If you have a question at any point, reach us from the contact page.",
} as const;

/** The onboarding checklist tracked for every new customer. */
export const onboardingChecklist = [
  "Intake received and reviewed",
  "Kickoff call booked",
  "Accounts and access confirmed",
  "Day 1 deliverables prepared",
  "Seven day check in scheduled",
] as const;

const DEFAULT_DELIVERABLES = [
  "Your Genesis workspace set up",
  "The first work in place",
  "A short plan for the first week",
] as const;

/** Day 1 deliverables for each plan, by the plan id carried in session metadata. */
const DAY_ONE: Readonly<Record<string, readonly string[]>> = {
  single: [
    "Your chosen AI employee set up and connected",
    "First drafts prepared from facts you approve",
    "A short summary of the day on your pipeline",
  ],
  duo: [
    "Your two AI employees set up and connected",
    "First drafts prepared across both roles from facts you approve",
    "A short summary of the day on your pipeline",
  ],
  fleet: [
    "Hawk, Susan, and Darius set up and working together",
    "First operations, marketing, and sales drafts from facts you approve",
    "A short summary of the day on your pipeline",
  ],
  "managed-750": [
    "Your managed workspace set up",
    "The first focused workflow connected",
    "A short plan for the first week",
  ],
  "managed-1750": [
    "Your managed workspace set up",
    "The first cross workflow automation connected",
    "A short plan for the first week",
  ],
  "managed-4500": [
    "Your managed workspace set up",
    "The first business wide workflows connected",
    "A short plan for the first week",
  ],
};

export function dayOneDeliverablesFor(planId: string): readonly string[] {
  return DAY_ONE[planId] ?? DEFAULT_DELIVERABLES;
}

/** The number of days until the check in task is due. */
export const CHECK_IN_DAYS = 7;

/** The check in due date, as an ISO date (YYYY-MM-DD), `days` out from `from`. */
export function checkInDueDate(from: Date = new Date(), days: number = CHECK_IN_DAYS): string {
  const due = new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
  return due.toISOString().slice(0, 10);
}

function bulleted(items: readonly string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

/**
 * The adaptive card posted to the Sales channel once a customer submits their
 * intake: the plan, the onboarding checklist, the day 1 deliverables for that
 * plan, and the seven day check in task with its due date.
 */
export function onboardingCard(intake: IntakeInput, planId: string, dueDate: string) {
  const plan = resolvePlan(planId);
  const planName = plan?.name ?? (planId || "unknown");
  const deliverables = dayOneDeliverablesFor(planId);

  return {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            { type: "TextBlock", size: "Large", weight: "Bolder", text: "Onboarding checklist started" },
            {
              type: "FactSet",
              facts: [
                { title: "Plan", value: planName },
                { title: "Business", value: intake.businessName },
                { title: "Contact", value: intake.name },
                { title: "Email", value: intake.email },
                { title: "Seven day check in due", value: dueDate },
                { title: "Session", value: intake.sessionId },
              ],
            },
            { type: "TextBlock", weight: "Bolder", text: "Onboarding checklist" },
            { type: "TextBlock", wrap: true, text: bulleted(onboardingChecklist) },
            { type: "TextBlock", weight: "Bolder", text: "Day 1 deliverables" },
            { type: "TextBlock", wrap: true, text: bulleted(deliverables) },
            {
              type: "TextBlock",
              wrap: true,
              text: `Task: complete the seven day check in call by ${dueDate}.`,
            },
          ],
        },
      },
    ],
  };
}

/** Posts the onboarding card. Never throws; failures are logged so the caller can still answer the visitor. */
export async function sendOnboardingAlert(
  intake: IntakeInput,
  planId: string,
  now: Date = new Date(),
  url: string | undefined = process.env.TEAMS_ALERT_WEBHOOK_URL,
  doFetch: typeof fetch = fetch,
): Promise<boolean> {
  if (!url || !url.startsWith("https://")) {
    console.error("Onboarding alert skipped: TEAMS_ALERT_WEBHOOK_URL not set");
    return false;
  }
  try {
    const response = await doFetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(onboardingCard(intake, planId, checkInDueDate(now))),
    });
    if (!response.ok) {
      console.error("Onboarding alert failed", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Onboarding alert failed", error instanceof Error ? error.message : "unknown");
    return false;
  }
}

/** The kickoff booking URL when one is configured; hidden otherwise. */
export function kickoffBookingUrl(
  env: Record<string, string | undefined> = process.env,
): string | null {
  const value = env.KICKOFF_BOOKING_URL?.trim() ?? "";
  if (!value || !value.startsWith("https://")) return null;
  return value;
}
