/**
 * AI Employees onboarding intake: pure validation and the Teams card builder,
 * plus a posting helper modelled on lib/purchaseAlert.ts. The card builder and
 * parser take no network, so they are safe to unit test on their own.
 */

export const intakeMessages = {
  sent: "Your intake is in. We will reach out at the email you gave us.",
  invalid: "Check your business name, your name, email, and phone, then send the intake again.",
  error: "We could not confirm this checkout. Email info@geai.us and we will help.",
  unconfigured: "The intake form is not open yet. Email info@geai.us and we will help.",
} as const;

export type IntakeInput = {
  businessName: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  brandColorsOrLogo: string;
  aiPhone: string;
  inbox: string;
  whatYouSell: string;
  mainGoal: string;
  kickoffTimes: string;
  sessionId: string;
};

export type IntakeParse =
  | { ok: true; honeypot: true }
  | { ok: true; honeypot: false; intake: IntakeInput }
  | { ok: false; message: (typeof intakeMessages)["invalid"] };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Every field is capped at this length before it is used or sent on. */
export const FIELD_CAP = 2000;

const field = (value: unknown) =>
  (typeof value === "string" ? value.trim() : "").slice(0, FIELD_CAP);

export function parseIntake(data: Record<string, unknown>): IntakeParse {
  if (field(data.website_url_hp)) return { ok: true, honeypot: true };

  const businessName = field(data.businessName);
  const name = field(data.name);
  const email = field(data.email);
  const phone = field(data.phone);
  const sessionId = field(data.session_id);
  const digits = phone.replace(/\D/g, "");

  if (
    businessName.length < 2 ||
    name.length < 2 ||
    !emailPattern.test(email) ||
    digits.length < 7 ||
    digits.length > 15 ||
    !sessionId
  ) {
    return { ok: false, message: intakeMessages.invalid };
  }

  return {
    ok: true,
    honeypot: false,
    intake: {
      businessName,
      name,
      email,
      phone,
      website: field(data.website),
      brandColorsOrLogo: field(data.brandColorsOrLogo),
      aiPhone: field(data.aiPhone),
      inbox: field(data.inbox),
      whatYouSell: field(data.whatYouSell),
      mainGoal: field(data.mainGoal),
      kickoffTimes: field(data.kickoffTimes),
      sessionId,
    },
  };
}

function cardText(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "unknown";
}

/** The adaptive card for a received intake. Required facts first, then any optional ones. */
export function intakeCard(intake: IntakeInput, plan: string) {
  const facts: { title: string; value: string }[] = [
    { title: "Plan", value: cardText(plan) },
    { title: "Business", value: intake.businessName },
    { title: "Contact", value: intake.name },
    { title: "Email", value: intake.email },
    { title: "Phone", value: intake.phone },
  ];

  const optional: readonly [string, string][] = [
    ["Website", intake.website],
    ["Brand colors or logo", intake.brandColorsOrLogo],
    ["AI employee phone", intake.aiPhone],
    ["Inbox to watch", intake.inbox],
    ["What they sell", intake.whatYouSell],
    ["Goal for 30 days", intake.mainGoal],
    ["Kickoff times", intake.kickoffTimes],
  ];
  for (const [title, value] of optional) {
    if (value) facts.push({ title, value });
  }

  facts.push({ title: "Session", value: intake.sessionId });

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
            { type: "TextBlock", size: "Large", weight: "Bolder", text: "AI Employees intake received" },
            { type: "FactSet", facts },
            {
              type: "TextBlock",
              wrap: true,
              text: "Start onboarding: provision within 1 business day and book the kickoff call.",
            },
          ],
        },
      },
    ],
  };
}

/** Posts the card. Never throws; failures are logged so the caller can still answer the visitor. */
export async function sendIntakeAlert(
  intake: IntakeInput,
  plan: string,
  url: string | undefined = process.env.TEAMS_ALERT_WEBHOOK_URL,
  doFetch: typeof fetch = fetch,
): Promise<boolean> {
  if (!url || !url.startsWith("https://")) {
    console.error("Intake alert skipped: TEAMS_ALERT_WEBHOOK_URL not set");
    return false;
  }
  try {
    const response = await doFetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(intakeCard(intake, plan)),
    });
    if (!response.ok) {
      console.error("Intake alert failed", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Intake alert failed", error instanceof Error ? error.message : "unknown");
    return false;
  }
}
