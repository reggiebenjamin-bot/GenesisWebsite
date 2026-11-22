import assert from "node:assert/strict";
import test from "node:test";
import { softwareDisclaimer } from "../lib/aiEmployees.ts";
import {
  leadWorkflowApps,
  leadWorkflowGraph,
  leadWorkflowIntro,
  leadWorkflowPublicCopy,
} from "../lib/leadWorkflow.ts";

const thirdParties = /\b(n8n|slack|sheets|google|microsoft|teams)\b/i;
const lenders = /\b(lender|backer|broker|funding partner)\b/i;

test("the lead diagram is an illustration with no dashes, emoji, stats, or outside brands", () => {
  assert.equal(leadWorkflowIntro.disclaimer, softwareDisclaimer);
  assert.equal(softwareDisclaimer, "Genesis is software. We do not lend, place or arrange funding.");

  const copy = leadWorkflowPublicCopy();
  assert.ok(copy.length > 12);
  for (const sentence of copy) {
    assert.equal(sentence.includes("-"), false, sentence);
    assert.equal(sentence.includes("—"), false, sentence);
    assert.equal(sentence.includes("–"), false, sentence);
    assert.doesNotMatch(sentence, /\p{Extended_Pictographic}/u, sentence);
    assert.doesNotMatch(sentence, /%|\$\d|\b\d{2,}\b/, sentence);
    assert.doesNotMatch(sentence, thirdParties, sentence);
    assert.doesNotMatch(sentence, lenders, sentence);
  }

  const blob = copy.join(" ");
  for (const name of ["Hawk", "Ava", "Susan", "Darius"]) {
    assert.match(blob, new RegExp(name));
  }
  assert.match(blob, /first contact/);
  assert.match(blob, /follow up/);
});

test("employee portraits are local headshots and the path runs from the lead to follow up", () => {
  const logos = [
    ...leadWorkflowGraph.nodes.map((node) => node.data.logo),
    ...leadWorkflowApps.map((app) => app.logo),
  ].filter((logo): logo is string => Boolean(logo));

  assert.ok(logos.length >= 8);
  for (const logo of logos) {
    assert.equal(logo.startsWith("/brand/"), true, logo);
    assert.equal(logo.startsWith("http"), false, logo);
  }

  const byId = Object.fromEntries(leadWorkflowGraph.nodes.map((node) => [node.id, node.data]));
  assert.deepEqual(
    [byId.ava, byId.hawk, byId.darius, byId.susan].map((step) => [step.logo, step.logoAlt]),
    [
      ["/brand/workflow/ava.webp", "Ava, Speed to Lead"],
      ["/brand/workflow/hawk.webp", "Hawk, operations"],
      ["/brand/workflow/darius.webp", "Darius, sales and prospecting"],
      ["/brand/workflow/susan.webp", "Susan, marketing"],
    ],
  );
  assert.equal(byId.lead.logoAlt, undefined);
  assert.equal(byId.approve.logo, undefined);
  for (const app of leadWorkflowApps) {
    assert.equal(app.logo?.endsWith(".webp"), true, app.name);
    assert.ok(app.logoAlt?.startsWith(app.name), app.name);
  }
  const serialized = JSON.stringify({ leadWorkflowGraph, leadWorkflowApps });
  assert.equal(serialized.includes("shannon"), false);
  for (const logo of logos) {
    if (logo.includes("/workflow/")) assert.equal(logo.endsWith(".webp"), true, logo);
  }

  assert.deepEqual(
    leadWorkflowGraph.edges.map((edge) => [edge.source, edge.target]),
    [
      ["lead", "ava"],
      ["ava", "hawk"],
      ["hawk", "darius"],
      ["darius", "approve"],
      ["approve", "susan"],
    ],
  );
  assert.deepEqual(
    leadWorkflowApps.map((app) => app.name),
    ["Hawk", "Ava", "Susan", "Darius"],
  );
});
