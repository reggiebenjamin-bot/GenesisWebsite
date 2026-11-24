import assert from "node:assert/strict";
import test from "node:test";
import { editionKeys, editionLevels, editionPricing, pricingPathForPersona } from "../lib/editionPlans.ts";
import { managedPlans } from "../lib/offers.ts";

const DASHES = ["-", "–", "—"];
const EMOJI = /\p{Extended_Pictographic}/u;

test("both editions show the three Levels at the same price, setup and user limit", () => {
  for (const key of editionKeys) {
    const levels = editionLevels(key);
    assert.equal(levels.length, 3);
    levels.forEach((level, index) => {
      assert.equal(level.plan, managedPlans[index]);
      assert.ok(level.bullets.length >= 2);
    });
  }
  assert.deepEqual(
    managedPlans.map((plan) => [plan.priceDisplay, plan.setupLine, plan.userLimit]),
    [
      ["$750", "plus $500 setup", "1 user"],
      ["$1,750", "plus $1,500 setup", "Up to 5 users"],
      ["$4,500", "plus $10,000 setup", "Up to 25 users"],
    ],
  );
});

test("edition copy has no dashes, emoji or old pack prices", () => {
  const values: string[] = [];
  const walk = (value: unknown, key = "") => {
    if (typeof value === "string") {
      if (!["key", "landingPath", "pricingPath"].includes(key)) values.push(value);
    } else if (Array.isArray(value)) value.forEach((item) => walk(item, key));
    else if (value && typeof value === "object") {
      for (const [inner, item] of Object.entries(value)) walk(item, inner);
    }
  };
  walk(editionPricing);
  const text = values.join("\n");
  for (const dash of DASHES) assert.equal(text.includes(dash), false, `dash ${dash}`);
  assert.equal(EMOJI.test(text), false);
  for (const old of ["$497", "$997", "$297", "$697", "$2,500"]) assert.equal(text.includes(old), false, old);
});

test("editions keep their disclaimers", () => {
  assert.equal(editionPricing.business.footer, "Genesis is software. We do not lend, place or arrange funding.");
  assert.equal(editionPricing.business.landingPath, "/business");
  assert.equal(editionPricing.real_estate.footer, "Genesis is software. We do not buy, sell or list property.");
  assert.equal(editionPricing.lending.footer, "Genesis is software. We do not lend, place or arrange funding.");
});

test("an assessment persona maps to the matching edition pricing page", () => {
  /* Each edition's own Levels, on its own page: never the all-edition /pricing. */
  assert.equal(pricingPathForPersona("Lender or loan officer"), "/lending#levels");
  assert.equal(pricingPathForPersona("Brokerage"), "/real-estate#levels");
  assert.equal(pricingPathForPersona("Other"), "/business#levels");
  assert.equal(pricingPathForPersona(undefined), "/business#levels");
});

test("no Level repeats a bullet from a lower Level, so each Level says what it adds", () => {
  for (const key of editionKeys) {
    const levels = editionLevels(key).map((level) => level.bullets.filter((bullet) => !bullet.startsWith("Everything in")));
    for (let index = 1; index < levels.length; index += 1) {
      for (const bullet of levels[index]) {
        for (const lower of levels.slice(0, index)) {
          assert.equal(lower.includes(bullet), false, `${key} Level 0${index + 1} repeats "${bullet}"`);
        }
      }
      assert.ok(levels[index].length > 0, `${key} Level 0${index + 1} adds something`);
    }
  }
});
