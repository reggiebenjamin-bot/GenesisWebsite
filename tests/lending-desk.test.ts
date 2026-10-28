import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fundingDisclaimer } from "../lib/platform/copy.ts";
import { publicDeal, sampleDeals } from "../lib/platform/lending/model.ts";
import { isPublicDesk, resolveDesk } from "../lib/platform/lending/routes.ts";
import { matchSources, sampleSources } from "../lib/platform/lending/sources.ts";

test("borrower facing deals omit source names", () => {
  const encoded = JSON.stringify(sampleDeals.map(publicDeal));
  assert.equal(encoded.includes("Sample Lender"), false);
  assert.equal(encoded.toLowerCase().includes("broker"), false);
  assert.match(sampleDeals.map((deal) => publicDeal(deal).stage).join(","), /Submitted/);
});

test("match uses the client list and does not invent a placement", () => {
  const deal = sampleDeals[0];
  assert.ok(deal);
  const cards = matchSources(deal, sampleSources);
  assert.ok(cards.length > 0);
  assert.ok(cards.some((card) => card.group === "strong" || card.group === "possible"));
  for (const card of cards) {
    assert.match(card.sourceName, /^Sample Lender/);
    assert.ok(card.reasons.length >= 3);
  }
});

test("desk routes cover the lending screens and keep the portal public", () => {
  assert.equal(resolveDesk(undefined)?.name, "submission");
  assert.equal(resolveDesk(["pipeline", "board"])?.name, "pipeline");
  assert.equal(resolveDesk(["deals", "sample_purchase", "match"])?.name, "match");
  assert.equal(resolveDesk(["portal", "options"])?.name, "options");
  assert.equal(resolveDesk(["nope"]), null);
  const portal = resolveDesk(["portal"]);
  assert.ok(portal && isPublicDesk(portal));
  const desk = resolveDesk([]);
  assert.ok(desk && !isPublicDesk(desk));
});

test("borrower pages do not mention a sample lender", () => {
  const portal = readFileSync(new URL("../components/platform/lending/PublicViews.tsx", import.meta.url), "utf8");
  const status = readFileSync(new URL("../components/platform/BorrowerStatus.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(portal, /Sample Lender/);
  assert.doesNotMatch(portal, /sampleSources/);
  assert.doesNotMatch(status, /Sample Lender/);
  assert.match(portal, /fundingDisclaimer/);
  assert.equal(fundingDisclaimer.includes("We do not lend, place or arrange funding."), true);
});
