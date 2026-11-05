import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { lending, packs } from "../packs/index.ts";
import { offers } from "../packs/pricing.ts";
import {
  buildClientConfig,
  channelsFrom,
  ownerFirstName,
  validateBusinessCheck,
  validateSignup,
} from "../lib/platform/config.ts";
import { fundingDisclaimer, platformCopy } from "../lib/platform/copy.ts";
import { borrowerView, effectiveBrokerMode, lenderMatch } from "../lib/platform/desk.ts";

function walk(value: unknown, out: string[] = [], skipClientDesk = false): string[] {
  if (typeof value === "string") {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) walk(item, out, skipClientDesk);
    return out;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (skipClientDesk && key === "clientDesk") continue;
      walk(item, out, skipClientDesk);
    }
  }
  return out;
}

function hyphenOutsideUrls(value: string) {
  const stripped = value.replace(/https?:\/\/\S+/g, "").replace(/\/[A-Za-z0-9._~/-]+/g, "");
  return /[-–—]/.test(stripped);
}

const publicStrings = [
  ...walk(platformCopy),
  ...walk(offers),
  ...packs.flatMap((pack) => walk(pack, [], true)),
];

const clientDeskStrings = walk(lending.clientDesk);

test("three vertical packs share one registry", () => {
  assert.deepEqual(
    packs.map((pack) => pack.id),
    ["general", "real_estate", "lending"],
  );
  for (const pack of packs) {
    assert.ok(pack.questions.length >= 3);
    assert.equal(pack.kpis.length, 4);
    assert.ok(pack.stages.length >= 4);
    assert.ok(pack.benefits.length >= 3);
  }
});

test("prices are the full published amounts", () => {
  const byName = Object.fromEntries(offers.map((offer) => [offer.name, offer.levels.map((level) => level.price)]));
  assert.deepEqual(byName["Inbox Routing"], [
    { setup: "$500", monthly: "$297" },
    { setup: "$1,000", monthly: "$597" },
    { setup: "$1,500", monthly: "$997" },
  ]);
  assert.deepEqual(byName["Lead Flow"], [
    { setup: "$1,000", monthly: "$497" },
    { setup: "$2,000", monthly: "$997" },
    { setup: "$3,500", monthly: "$1,497" },
  ]);
  assert.deepEqual(byName["Agent Website"], [
    { setup: "$750", monthly: "$297" },
    { setup: "$1,500", monthly: "$597" },
    { setup: "$2,500", monthly: "$997" },
  ]);
});

test("lending stages are configurable and broker mode defaults on", () => {
  assert.equal(lending.broker_mode, true);
  assert.deepEqual(
    lending.stages.map((stage) => stage.label),
    ["Submitted", "In review", "Matched", "Terms ready", "Closing", "Funded"],
  );
  assert.equal(lending.fundingDisclaimer, fundingDisclaimer);
  assert.equal(effectiveBrokerMode(lending, null), true);
  assert.equal(effectiveBrokerMode(lending, false), false);
});

test("customer status never receives lender names", () => {
  const view = borrowerView();
  const encoded = JSON.stringify(view);
  assert.equal(encoded.includes("Sample Lender"), false);
  assert.equal(encoded.toLowerCase().includes("broker"), false);
  assert.deepEqual(
    view.stages.map((stage) => stage.label),
    ["Submitted", "In review", "Matched", "Terms ready", "Closing", "Funded"],
  );
  assert.equal(view.stages.find((stage) => stage.state === "current")?.label, "In review");
  assert.match(view.disclaimer, /We do not lend, place or arrange funding/);
});

test("lender match is private to broker mode", () => {
  const shown = lenderMatch(lending, true);
  const hidden = lenderMatch(lending, false);
  assert.equal(hidden, null);
  assert.deepEqual(shown?.lenders.map((lender) => lender.name), [
    "Sample Lender A",
    "Sample Lender B",
    "Sample Lender C",
  ]);
  assert.match(clientDeskStrings.join("\n"), /\bBroker mode\b/);
  assert.doesNotMatch(clientDeskStrings.join("\n"), /brokerage/i);
  assert.doesNotMatch(clientDeskStrings.join("\n"), /Genesis is a broker/i);
});

test("public copy does not call Genesis a lender or a broker", () => {
  const blob = publicStrings.join("\n");
  assert.doesNotMatch(blob, /\bbroker/i);
  assert.doesNotMatch(blob, /brokerage/i);
  assert.doesNotMatch(blob, /Genesis Lending/);
  assert.doesNotMatch(blob, /Genesis Capital/);
  assert.doesNotMatch(blob, /\bPLG\b/);
  assert.doesNotMatch(blob, /\bWRL\b/);
  assert.doesNotMatch(blob, /book a demo/i);
  assert.doesNotMatch(blob, /only for real estate/i);
  assert.doesNotMatch(blob, /lorem|ipsum/i);
  assert.match(blob, /Intelligent Infrastructure for Business Growth/);
  assert.match(blob, /Genesis is software\. We do not lend, place or arrange funding\./);
});

test("visible pack and product copy avoids dashes, emoji, and first person", () => {
  for (const value of [...publicStrings, ...clientDeskStrings]) {
    assert.equal(hyphenOutsideUrls(value), false, value);
    assert.equal(/\p{Extended_Pictographic}/u.test(value), false, value);
    assert.doesNotMatch(value, /\bI(?:'m|'ll|'ve|'d)?\b/u, value);
  }
});

test("signup stub builds the provisioning contract", () => {
  assert.equal(ownerFirstName("Reginald Benjamin"), "Reginald");
  const rejected = validateSignup({
    name: "Sample Owner",
    email: "not-an-email",
    business_name: "Sample Desk",
    vertical: "lending",
    trade: "Lending",
    city: "Austin",
    consent: true,
  });
  assert.equal(rejected.ok, false);

  const missingConsent = validateSignup({
    name: "Sample Owner",
    email: "owner@example.com",
    business_name: "Sample Desk",
    vertical: "lending",
    trade: "Lending",
    city: "Austin",
    consent: false,
  });
  assert.equal(missingConsent.ok, false);

  const accepted = validateSignup({
    name: "Sample Owner",
    email: "owner@example.com",
    business_name: "Sample Desk",
    vertical: "lending",
    trade: "Lending",
    city: "Austin",
    consent: true,
  });
  assert.equal(accepted.ok, true);
  if (!accepted.ok) return;

  const answers = { loan_types: ["Purchase"], states: "Texas", intake_channel: "Email" };
  assert.deepEqual(channelsFrom(lending, answers), ["Email"]);
  const config = buildClientConfig(accepted.value, "stub_test", answers, true);
  assert.equal(config.client_id, "stub_test");
  assert.equal(config.business_name, "Sample Desk");
  assert.equal(config.vertical, "lending");
  assert.equal(config.market, "Austin");
  assert.equal(config.owner_first_name, "Sample");
  assert.deepEqual(config.channels, ["Email"]);
  assert.deepEqual(config.hours, {
    days: "Mon to Sat",
    email: "6 AM to 8 PM CT",
    text: "9 AM to 8 PM CT",
  });
  assert.equal(config.sms_live, false);
  assert.equal(config.caps, 0);
  assert.equal(config.dry_run, true);
  assert.equal(config.storage, "none");
  assert.equal(config.broker_mode, true);
  assert.deepEqual(config.notices, [fundingDisclaimer]);

  const general = validateSignup({
    name: "Sample Owner",
    email: "owner@example.com",
    business_name: "Sample Co",
    vertical: "general",
    trade: "Services",
    city: "Dallas",
    consent: true,
  });
  assert.equal(general.ok, true);
  if (!general.ok) return;
  const generalConfig = buildClientConfig(general.value, "stub_general");
  assert.equal(generalConfig.broker_mode, undefined);
  assert.deepEqual(generalConfig.notices, []);
});

test("business check stub does not claim a live filing", () => {
  const bad = validateBusinessCheck({ business_name: "", city: "Austin", email: "a@b.co" });
  assert.equal(bad.ok, false);
  const good = validateBusinessCheck({
    business_name: "Sample Desk",
    city: "Austin",
    email: "owner@example.com",
    note: "Hours",
  });
  assert.equal(good.ok, true);
});

test("signup route is a stub with no outbound call", () => {
  const source = readFileSync(new URL("../app/api/platform/signup/route.ts", import.meta.url), "utf8");
  assert.match(source, /STUB/);
  assert.doesNotMatch(source, /fetch\(/);
  assert.doesNotMatch(source, /WEBHOOK/);
  const check = readFileSync(new URL("../app/api/platform/business-check/route.ts", import.meta.url), "utf8");
  assert.match(check, /not_run/);
  assert.doesNotMatch(check, /fetch\(/);
});

test("customer page source does not render lender names or broker", () => {
  const status = readFileSync(new URL("../components/platform/BorrowerStatus.tsx", import.meta.url), "utf8");
  const landing = readFileSync(new URL("../components/platform/Landing.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(status, /broker/i);
  assert.doesNotMatch(status, /Sample Lender/);
  assert.doesNotMatch(status, /clientDesk/);
  assert.doesNotMatch(landing, /broker/i);
  assert.doesNotMatch(landing, /Sample Lender/);
});
