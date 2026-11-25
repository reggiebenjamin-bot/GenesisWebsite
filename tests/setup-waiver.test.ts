import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { managedPlans } from "../lib/offers.ts";
import {
  managedCheckoutLineItems,
  monthlyPriceDefaults,
  setupPriceDefaults,
} from "../lib/managedCheckout.ts";
import { SETUP_WAIVER_ENDS, SETUP_WAIVER_LINE, setupWaiverActive } from "../lib/setupWaiver.ts";

const BEFORE = new Date("2026-12-31T23:59:59-06:00");
const CUTOFF = new Date(SETUP_WAIVER_ENDS);
const AFTER = new Date("2027-01-01T00:00:01-06:00");

function chicagoParts(date: Date) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}

test("the waiver ends at midnight January 1 2027 in America/Chicago", () => {
  assert.equal(SETUP_WAIVER_ENDS, "2027-01-01T00:00:00-06:00");
  assert.deepEqual(chicagoParts(CUTOFF), {
    year: "2027",
    month: "01",
    day: "01",
    hour: "00",
    minute: "00",
    second: "00",
  });
  assert.equal(setupWaiverActive(BEFORE), true);
  assert.equal(setupWaiverActive(new Date(CUTOFF.getTime() - 1)), true);
  assert.equal(setupWaiverActive(CUTOFF), false);
  assert.equal(setupWaiverActive(AFTER), false);
});

test("checkout drops the setup price before the cutoff and restores it after", () => {
  for (const plan of managedPlans) {
    assert.equal(plan.monthlyPriceUsd, plan.id === "managed-750" ? 750 : plan.id === "managed-1750" ? 1750 : 4500);
    assert.deepEqual(managedCheckoutLineItems(plan.id, BEFORE, {}), [
      { price: monthlyPriceDefaults[plan.id], quantity: 1 },
    ]);
    assert.deepEqual(managedCheckoutLineItems(plan.id, AFTER, {}), [
      { price: monthlyPriceDefaults[plan.id], quantity: 1 },
      { price: setupPriceDefaults[plan.id], quantity: 1 },
    ]);
  }
  assert.deepEqual(
    managedPlans.map((plan) => plan.setupUsd),
    [500, 1500, 10000],
  );
});

test("the pricing page and the start cards show the waiver only as copy", () => {
  assert.equal(SETUP_WAIVER_LINE, "Black Friday: setup fee waived through Dec 31");
  assert.equal(SETUP_WAIVER_LINE.includes("—") || SETUP_WAIVER_LINE.includes("–"), false);
  const pricing = readFileSync(new URL("../app/(marketing)/pricing/page.tsx", import.meta.url), "utf8");
  const comparison = readFileSync(new URL("../components/offers/ManagedComparison.tsx", import.meta.url), "utf8");
  const cards = readFileSync(new URL("../components/home/PlanCards.tsx", import.meta.url), "utf8");
  const start = readFileSync(new URL("../lib/managedCheckoutStart.ts", import.meta.url), "utf8");
  assert.match(comparison, /SetupFeeNote/);
  assert.match(pricing, /ManagedComparison/);
  assert.match(cards, /SetupFeeNote/);
  assert.match(cards, /href=\{level\.href\}/);
  assert.match(start, /managedCheckoutLineItems\(plan\)/);
  assert.doesNotMatch(start, /checkoutLineItems\(monthlyPriceId/);
});
