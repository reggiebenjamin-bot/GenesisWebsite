import assert from "node:assert/strict";
import test from "node:test";
import {
  FIELD_CAP,
  intakeCard,
  intakeMessages,
  parseIntake,
  sendIntakeAlert,
  type IntakeInput,
} from "../lib/onboardingIntake.ts";

const good = {
  businessName: "Lovelace Realty",
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "682 647 5934",
  website: "https://lovelace.test",
  brandColorsOrLogo: "Navy and gold",
  aiPhone: "469 210 8466",
  inbox: "deals@lovelace.test",
  whatYouSell: "Residential listings",
  mainGoal: "Twenty booked showings",
  kickoffTimes: "Weekday mornings",
  session_id: "cs_test_123",
  website_url_hp: "",
};

test("intake accepts a complete submission", () => {
  const parsed = parseIntake(good);
  assert.equal(parsed.ok, true);
  if (parsed.ok && !parsed.honeypot) {
    assert.equal(parsed.intake.businessName, "Lovelace Realty");
    assert.equal(parsed.intake.sessionId, "cs_test_123");
    assert.equal(parsed.intake.inbox, "deals@lovelace.test");
  }
});

test("intake requires business name, name, email, phone and session id", () => {
  const base = { ...good, website_url_hp: "" };
  assert.equal(parseIntake({ ...base, businessName: "" }).ok, false);
  assert.equal(parseIntake({ ...base, name: "A" }).ok, false);
  assert.equal(parseIntake({ ...base, email: "not-an-email" }).ok, false);
  assert.equal(parseIntake({ ...base, phone: "123" }).ok, false);
  assert.equal(parseIntake({ ...base, session_id: "" }).ok, false);

  const invalid = parseIntake({ ...base, email: "bad" });
  assert.equal(invalid.ok, false);
  if (!invalid.ok) assert.equal(invalid.message, intakeMessages.invalid);
});

test("intake drops a filled honeypot without reading the rest", () => {
  const parsed = parseIntake({ ...good, website_url_hp: "http://spam.test" });
  assert.equal(parsed.ok && parsed.honeypot, true);
});

test("intake caps every field at the field cap", () => {
  const long = "x".repeat(FIELD_CAP + 500);
  const parsed = parseIntake({ ...good, businessName: `Realty ${long}`, whatYouSell: long });
  assert.equal(parsed.ok, true);
  if (parsed.ok && !parsed.honeypot) {
    assert.equal(parsed.intake.businessName.length, FIELD_CAP);
    assert.equal(parsed.intake.whatYouSell.length, FIELD_CAP);
  }
});

const intake: IntakeInput = {
  businessName: "Lovelace Realty",
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "682 647 5934",
  website: "https://lovelace.test",
  brandColorsOrLogo: "",
  aiPhone: "",
  inbox: "",
  whatYouSell: "Residential listings",
  mainGoal: "",
  kickoffTimes: "",
  sessionId: "cs_test_123",
};

test("card is an adaptive card titled for a received intake", () => {
  const card = intakeCard(intake, "fleet");
  assert.equal(card.attachments[0].contentType, "application/vnd.microsoft.card.adaptive");
  const json = JSON.stringify(card);
  assert.match(json, /AI Employees intake received/);
  assert.match(json, /fleet/);
  assert.match(json, /Lovelace Realty/);
  assert.match(json, /cs_test_123/);
});

type FactSet = { facts: { title: string; value: string }[] };

test("card lists required facts and only the optional ones that are present", () => {
  const facts = (intakeCard(intake, "fleet").attachments[0].content.body[1] as FactSet).facts;
  const titles = facts.map((fact) => fact.title);
  assert.deepEqual(titles, ["Plan", "Business", "Contact", "Email", "Phone", "Website", "What they sell", "Session"]);
  assert.equal(facts.find((fact) => fact.title === "Plan")?.value, "fleet");
  assert.equal(
    facts.some((fact) => fact.title === "Inbox to watch"),
    false,
  );
});

test("card falls back to unknown when no plan is on the session", () => {
  const facts = (intakeCard(intake, "").attachments[0].content.body[1] as FactSet).facts;
  assert.equal(facts.find((fact) => fact.title === "Plan")?.value, "unknown");
});

test("send posts the card with an injected fetch and reports failures", async () => {
  const quiet = console.error;
  console.error = () => {};
  try {
    assert.equal(await sendIntakeAlert(intake, "fleet", undefined), false);
    const boom = (async () => {
      throw new Error("down");
    }) as unknown as typeof fetch;
    assert.equal(await sendIntakeAlert(intake, "fleet", "https://x.test", boom), false);
    const bad = (async () => new Response("", { status: 500 })) as unknown as typeof fetch;
    assert.equal(await sendIntakeAlert(intake, "fleet", "https://x.test", bad), false);
  } finally {
    console.error = quiet;
  }

  let sent = "";
  const ok = (async (_url: unknown, init?: RequestInit) => {
    sent = String(init?.body);
    return new Response("", { status: 202 });
  }) as unknown as typeof fetch;
  assert.equal(await sendIntakeAlert(intake, "fleet", "https://x.test", ok), true);
  assert.match(sent, /AI Employees intake received/);
  assert.match(sent, /cs_test_123/);
});
