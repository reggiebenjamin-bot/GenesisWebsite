import assert from "node:assert/strict";
import test from "node:test";
import { faqs, navigation, processSteps } from "../lib/content.ts";
import {
  DEFAULT_OFFER_PATH,
  genesisTools,
  isOfferPathId,
  managedOverview,
  managedPlans,
  numbersHandled,
  offerPathFromHash,
  offerPathHomeHref,
  offerPathPageKind,
  offerPaths,
  pathHeroes,
  toolJourney,
  toolPriceLabel,
} from "../lib/offers.ts";

const wordCount = (text: string) => text.trim().split(/\s+/).length;

test("the navigation toggle switches in place only where both paths are shown", () => {
  assert.deepEqual(offerPathPageKind("/"), { kind: "switch" });
  assert.deepEqual(offerPathPageKind("/pricing"), { kind: "switch" });
  assert.deepEqual(offerPathPageKind("/mini"), { kind: "page", path: "agent" });
  assert.deepEqual(offerPathPageKind("/solutions"), { kind: "page", path: "custom-infrastructure" });
  assert.deepEqual(offerPathPageKind("/about"), { kind: "neutral" });
  assert.deepEqual(
    offerPaths.map((path) => [path.id, path.href]),
    [
      ["agent", "/mini"],
      ["custom-infrastructure", "/solutions"],
    ],
  );
});

test("current and previous URL hashes select a path; unrelated hashes do not", () => {
  assert.equal(offerPathFromHash("#agent"), "agent");
  assert.equal(offerPathFromHash("#custom-infrastructure"), "custom-infrastructure");
  assert.equal(offerPathFromHash("#mini"), "agent");
  assert.equal(offerPathFromHash("#infrastructure"), "custom-infrastructure");
  assert.equal(offerPathFromHash("#offers"), null);
  assert.equal(offerPathFromHash(""), null);
});

test("from other pages the toggle leads to each path's homepage", () => {
  for (const path of offerPaths) {
    const href = offerPathHomeHref(path.id);
    assert.equal(href, `/#${path.id}`);
    assert.equal(offerPathFromHash(href.slice(1)), path.id);
  }
});

test("each path opens the homepage with its own title; Custom Infrastructure keeps the approved one", () => {
  const title = (path: keyof typeof pathHeroes) =>
    `${pathHeroes[path].title} ${pathHeroes[path].accent}`;
  assert.equal(title("custom-infrastructure"), "Stop holding every deal together.");
  assert.notEqual(title("agent"), title("custom-infrastructure"));
});

test("each homepage path asks its own questions, and both ask how the offers differ", () => {
  for (const path of offerPaths) {
    const questions = faqs.filter((faq) => faq.paths.includes(path.id));
    assert.ok(questions.length >= 3, `${path.label} needs its own questions`);
    assert.ok(questions.some((faq) => faq.question.startsWith("What is the difference")));
  }
});

test("the Agent path is first and selected by default", () => {
  assert.equal(DEFAULT_OFFER_PATH, "agent");
  assert.equal(offerPaths[0]?.id, DEFAULT_OFFER_PATH);
  assert.deepEqual(
    offerPaths.map((path) => [path.id, path.label, path.product]),
    [
      ["agent", "Agent", "Genesis Tools"],
      ["custom-infrastructure", "Custom Infrastructure", "Genesis Managed AI"],
    ],
  );
  assert.equal(isOfferPathId("custom-infrastructure"), true);
  assert.equal(isOfferPathId("offers"), false);
});

test("Genesis Tools carry the reviewed prices and units", () => {
  assert.deepEqual(
    genesisTools.map((tool) => [tool.name, toolPriceLabel(tool.price)]),
    [
      ["Deal Architect", "$49 / analysis"],
      ["Funding Ready", "$99 / package"],
      ["Deal Desk", "$49 / month"],
    ],
  );
  assert.deepEqual(
    genesisTools.map((tool) => tool.price.amountUsd),
    [
      [49, 49],
      [99, 99],
      [29, 49],
    ],
  );
});

test("Genesis Managed AI carries the reviewed monthly plans in ascending order", () => {
  assert.deepEqual(
    managedPlans.map((plan) => [plan.monthlyPriceUsd, plan.priceDisplay]),
    [
      [750, "$750"],
      [1750, "$1,750"],
      [4500, "$4,500"],
    ],
  );
  assert.deepEqual(
    managedPlans.map((plan) => plan.ladder),
    [
      "Genesis assists the operator.",
      "Genesis connects and assists the team.",
      "Genesis helps orchestrate the operation.",
    ],
  );
});

test("undefined plan entitlements stay null until a plan matrix is approved", () => {
  for (const plan of managedPlans) {
    assert.equal(plan.includedUsers, null);
    assert.equal(plan.additionalUserPriceUsd, null);
    assert.equal(plan.includedAiAgents, null);
    assert.equal(plan.connectedAccounts, null);
    assert.equal(plan.integrations, null);
    assert.equal(plan.includedUsage, null);
    assert.equal(plan.implementationLevel, null);
    assert.equal(plan.supportLevel, null);
  }
});

test("no self-service tool is priced into managed-plan territory", () => {
  const lowestManaged = Math.min(...managedPlans.map((plan) => plan.monthlyPriceUsd));
  for (const tool of genesisTools) {
    assert.ok(
      tool.price.amountUsd[1] < lowestManaged,
      `${tool.name} must stay a tool-scale price`,
    );
  }
});

test("card copy stays scannable: one short line and points of a few words", () => {
  for (const tool of genesisTools) {
    assert.ok(wordCount(tool.tagline) <= 8, `${tool.name} tagline is too long`);
    assert.equal(tool.keyPoints.length, 3);
    for (const point of tool.keyPoints) {
      assert.ok(wordCount(point) <= 5, `${tool.name}: "${point}" is too long`);
    }
  }

  const shortPoints = [
    ...managedPlans.flatMap((plan) => plan.points),
    ...managedOverview.points,
    ...numbersHandled.points,
    ...processSteps.map((step) => step.summary),
  ];
  for (const point of shortPoints) {
    assert.ok(wordCount(point) <= 5, `"${point}" is too long`);
  }

  for (const step of toolJourney) {
    assert.ok(wordCount(step.cue) <= 4, `"${step.cue}" is too long`);
  }
});

test("navigation dropdowns describe a destination in a few words", () => {
  for (const entry of navigation) {
    if (!("items" in entry)) continue;
    for (const item of entry.items) {
      if (!item.description) continue;
      assert.ok(
        wordCount(item.description) <= 4,
        `${item.label}: "${item.description}" is too long for a menu`,
      );
    }
  }
});
