import assert from "node:assert/strict";
import test from "node:test";
import type { IntakeInput } from "../lib/onboardingIntake.ts";
import {
  CHECK_IN_DAYS,
  checkInDueDate,
  dayOneDeliverablesFor,
  kickoffBookingUrl,
  onboardingCard,
  onboardingChecklist,
  sendOnboardingAlert,
  welcomeEmail,
} from "../lib/onboardingDelivery.ts";

const intake: IntakeInput = {
  businessName: "Acme Realty",
  name: "Pat Doe",
  email: "pat@example.com",
  phone: "682 647 5934",
  website: "",
  brandColorsOrLogo: "",
  aiPhone: "",
  inbox: "",
  whatYouSell: "",
  mainGoal: "",
  kickoffTimes: "",
  sessionId: "cs_test_123",
};

test("the welcome email covers intake, kickoff, day 1, and the seven day check in", () => {
  const titles = welcomeEmail.sections.map((section) => section.title);
  assert.deepEqual(titles, [
    "Complete your intake",
    "Book your kickoff",
    "Day 1 deliverables",
    "Seven day check in",
  ]);
});

test("day 1 deliverables are defined per plan with a safe default", () => {
  assert.equal(dayOneDeliverablesFor("fleet")[0], "Hawk, Susan, and Darius set up and working together");
  assert.equal(dayOneDeliverablesFor("managed-4500").length, 3);
  assert.deepEqual(dayOneDeliverablesFor("unknown-plan"), [
    "Your Genesis workspace set up",
    "The first work in place",
    "A short plan for the first week",
  ]);
});

test("the check in due date is seven days out as an ISO date", () => {
  assert.equal(CHECK_IN_DAYS, 7);
  assert.equal(checkInDueDate(new Date("2026-11-03T12:00:00Z")), "2026-11-10");
  assert.equal(checkInDueDate(new Date("2026-12-31T00:00:00Z")), "2027-01-07");
});

test("the onboarding card carries the checklist, day 1 deliverables and the check in due date", () => {
  const card = onboardingCard(intake, "managed-1750", "2026-11-10");
  const json = JSON.stringify(card);
  assert.equal(card.attachments[0].contentType, "application/vnd.microsoft.card.adaptive");
  assert.match(json, /Onboarding checklist started/);
  assert.match(json, /Business Grow/);
  for (const item of onboardingChecklist) assert.match(json, new RegExp(item));
  for (const item of dayOneDeliverablesFor("managed-1750")) assert.match(json, new RegExp(item));
  assert.match(json, /seven day check in call by 2026-11-10/);
  assert.match(json, /cs_test_123/);
});

test("send never throws and reports failures", async () => {
  const quiet = console.error;
  console.error = () => {};
  try {
    assert.equal(await sendOnboardingAlert(intake, "duo", new Date(), undefined), false);
    const boom = (async () => {
      throw new Error("down");
    }) as unknown as typeof fetch;
    assert.equal(await sendOnboardingAlert(intake, "duo", new Date(), "https://x.test", boom), false);
  } finally {
    console.error = quiet;
  }
  let sent = "";
  const ok = (async (_u: unknown, init?: RequestInit) => {
    sent = String(init?.body);
    return new Response("", { status: 202 });
  }) as unknown as typeof fetch;
  assert.equal(
    await sendOnboardingAlert(intake, "single", new Date("2026-11-03T12:00:00Z"), "https://x.test", ok),
    true,
  );
  assert.match(sent, /2026-11-10/);
  assert.match(sent, /Acme Realty/);
});

test("the kickoff url shows only when a valid https url is set", () => {
  assert.equal(kickoffBookingUrl({}), null);
  assert.equal(kickoffBookingUrl({ KICKOFF_BOOKING_URL: "" }), null);
  assert.equal(kickoffBookingUrl({ KICKOFF_BOOKING_URL: "ftp://x" }), null);
  assert.equal(
    kickoffBookingUrl({ KICKOFF_BOOKING_URL: "https://cal.example.com/genesis" }),
    "https://cal.example.com/genesis",
  );
});
