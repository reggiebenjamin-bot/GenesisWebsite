import assert from "node:assert/strict";
import test from "node:test";
import {
  aiEmployeePersonas,
  aiEmployeePlans,
  aiEmployeePublicCopy,
  aiEmployeesEnterprise,
  aiEmployeesExpert,
  expertPhone,
  softwareDisclaimer,
} from "../lib/aiEmployees.ts";
import {
  AI_EMPLOYEES_CHECKOUT_INTEGRATION_ID,
  checkoutPriceEnv,
  checkoutPriceId,
  stripeSecretKey,
  subscriptionReference,
} from "../lib/aiEmployeesCheckout.ts";
import { parseInquiry } from "../lib/aiEmployeesInquiry.ts";
import { contact } from "../lib/content.ts";
import { priceNumber, aiEmployeesServiceSchema, organizationSchema, reginaldBenjaminSchema } from "../lib/schema.ts";
import { seoPage } from "../lib/seo.ts";

const banned =
  /\b(broker|discount|cheaper|cheap|bargain)\b|starting at|no hidden|cancel anytime|risk free|% off|only \$|was \$|free trial|limited time/i;

test("AI employee copy stays plain", () => {
  const copy = aiEmployeePublicCopy();
  assert.ok(copy.length > 20);
  for (const sentence of copy) {
    assert.equal(sentence.includes("-"), false, sentence);
    assert.equal(sentence.includes("—"), false, sentence);
    assert.equal(sentence.includes("–"), false, sentence);
    assert.doesNotMatch(sentence, banned, sentence);
    assert.doesNotMatch(sentence, /\p{Extended_Pictographic}/u, sentence);
  }
  assert.equal(softwareDisclaimer, "Genesis is software. We do not lend, place or arrange funding.");
  assert.equal(aiEmployeesExpert.jobTitle, "Founder");
  assert.equal(aiEmployeesExpert.role, "Founder of Genesis");
});

test("the expert phone is the configured constant", () => {
  assert.equal(expertPhone.display, contact.phoneDisplay);
  assert.equal(expertPhone.href, contact.phoneHref);
  assert.equal(expertPhone.display.includes("-"), false);
});

test("persona cards name the daily work and the outcomes", () => {
  assert.deepEqual(
    aiEmployeePersonas.map((persona) => persona.name),
    ["Hawk", "Susan", "Darius", "Ava"],
  );
  for (const persona of aiEmployeePersonas) {
    assert.ok(persona.dailyWork.length > 40, persona.name);
    assert.ok(persona.outcomes.length > 40, persona.name);
  }
});

test("plan prices match the page and the Stripe price env names", () => {
  assert.deepEqual(
    aiEmployeePlans.map((plan) => [plan.name, plan.monthlyPriceUsd]),
    [
      ["Single", 697],
      ["Duo", 1497],
      ["Full Fleet", 2997],
    ],
  );
  assert.equal(aiEmployeesEnterprise.setupUsd, 15000);
  assert.equal(aiEmployeesEnterprise.monthlyPriceUsd, 2500);
  assert.match(aiEmployeesEnterprise.priceLine, /\$15,000 setup plus \$2,500 a month/);
  assert.match(aiEmployeePlans[2].summary, /Hawk, Susan, and Darius/);

  for (const plan of aiEmployeePlans) {
    assert.equal(priceNumber(plan.priceDisplay), plan.monthlyPriceUsd);
    assert.equal(checkoutPriceEnv[plan.id].startsWith("STRIPE_PRICE_AI_EMPLOYEES_"), true);
  }
});

test("checkout reads a real price id and ignores placeholders", () => {
  assert.equal(checkoutPriceId("single", { STRIPE_PRICE_AI_EMPLOYEES_SINGLE: "price_placeholder_single" }), null);
  assert.equal(checkoutPriceId("duo", {}), null);
  assert.equal(
    checkoutPriceId("fleet", { STRIPE_PRICE_AI_EMPLOYEES_FLEET: "price_123" }),
    "price_123",
  );
  assert.equal(stripeSecretKey({ STRIPE_SECRET_KEY: "rk_placeholder" }), null);
  assert.equal(stripeSecretKey({ STRIPE_SECRET_KEY: "rk_live_example" }), "rk_live_example");
  assert.match(AI_EMPLOYEES_CHECKOUT_INTEGRATION_ID, /[a-z]{8}$/);
});

test("subscription events resolve the subscription on the object", () => {
  assert.equal(
    subscriptionReference("customer.subscription.updated", { id: "sub_123" }),
    "sub_123",
  );
  assert.equal(
    subscriptionReference("checkout.session.completed", { subscription: "sub_456" }),
    "sub_456",
  );
  assert.equal(subscriptionReference("charge.refunded", { id: "ch_1" }), null);
});

test("the inquiry form accepts a real request and drops a honeypot", () => {
  const parsed = parseInquiry({
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "682 647 5934",
    company: "Genesis",
    message: "Full desk",
    website: "",
  });
  assert.equal(parsed.ok, true);
  if (parsed.ok && !parsed.honeypot) assert.equal(parsed.inquiry.name, "Ada Lovelace");

  assert.equal(parseInquiry({ name: "A", email: "ada@example.com", phone: "6826475934" }).ok, false);
  const honeypot = parseInquiry({
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "6826475934",
    website: "http://spam.test",
  });
  assert.equal(honeypot.ok && honeypot.honeypot, true);
});

test("the person record ties Reginald Benjamin to Genesis", () => {
  const person = reginaldBenjaminSchema();
  const organization = organizationSchema();
  assert.equal(person.name, "Reginald Benjamin");
  assert.equal(person["@id"], organization.founder["@id"]);
  assert.equal(person.worksFor["@id"], organization["@id"]);
  assert.equal(person.worksFor.name, "Genesis");
  assert.equal(person.telephone, expertPhone.href);
  assert.equal(person.jobTitle, "Founder");
  assert.doesNotMatch(JSON.stringify(person), /broker/i);

  const offers = aiEmployeesServiceSchema().hasOfferCatalog.itemListElement;
  assert.deepEqual(
    offers.map((offer) => offer.price),
    [697, 1497, 2997, 2500],
  );
  assert.equal(seoPage("/ai-employees").label, "AI Employees");
});
