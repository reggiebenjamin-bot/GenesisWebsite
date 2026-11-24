import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { FUNDING_LINE } from "../lib/legal.ts";
import { editionPricing } from "../lib/editionPlans.ts";
import { managedPlans } from "../lib/offers.ts";

const DASHES = ["-", "–", "—"];
const EMOJI = /\p{Extended_Pictographic}/u;

test("the homepage shows the three Levels once, sends each edition to its own Levels, and links no checkout", () => {
  const story = readFileSync(new URL("../components/home/story/StorySections.tsx", import.meta.url), "utf8");
  const offers = story.slice(story.indexOf("export function StoryOffers"), story.indexOf("export function StoryClose"));
  assert.match(offers, /managedPlans\.map/);
  assert.equal((offers.match(/managedPlans\.map/g) ?? []).length, 1, "the Levels are listed once");
  assert.doesNotMatch(story, /\/start\//, "no checkout link on the homepage, so nothing prefetches one");
  for (const key of ["lending", "real_estate", "business"] as const) {
    assert.match(editionPricing[key].pricingPath, /#levels$/);
  }
  assert.equal(managedPlans.length, 3);
  for (const plan of managedPlans) {
    for (const dash of DASHES) assert.equal(plan.day.includes(dash), false, plan.day);
    assert.equal(EMOJI.test(plan.day), false);
  }
  assert.equal(FUNDING_LINE, "Genesis is software. We do not lend, place or arrange funding.");
});

test("the workspace catalog no longer lists tool prices, and tool routes stay", () => {
  const home = readFileSync(new URL("../components/workspace/WorkspaceShell.tsx", import.meta.url), "utf8");
  const catalog = home.slice(home.indexOf("export function WorkspaceHome"), home.indexOf("export function WorkspaceShell"));
  assert.equal(catalog.includes("$49"), false);
  assert.equal(catalog.includes("$79"), false);
  assert.equal(catalog.includes("$99"), false);
  assert.equal(catalog.includes("workspaceTools"), false);
  assert.match(catalog, /href="\/pricing"/);

  const toolPage = readFileSync(new URL("../app/workspace/[tool]/page.tsx", import.meta.url), "utf8");
  assert.match(toolPage, /WorkspaceShell/);
  assert.equal(toolPage.includes("redirect"), false);

  const redirects = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(redirects, /source: "\/tools"/);
  assert.match(redirects, /destination: "\/pricing"/);
  assert.equal(redirects.includes('source: "/workspace/:tool"'), false);
  assert.equal(redirects.includes('source: "/workspace/:path*"'), false);
});
