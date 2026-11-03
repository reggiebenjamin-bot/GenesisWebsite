import assert from "node:assert/strict";
import test from "node:test";
import { realEstatePack } from "../lib/realEstatePack.ts";

/* The three dash characters that must never appear in visitor copy. */
const DASHES = ["-", "–", "—"];

/** Every string in the pack, paired with the key path that reached it. */
function strings(value: unknown, path = "realEstatePack"): { path: string; text: string }[] {
  if (typeof value === "string") return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => strings(item, `${path}[${index}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, inner]) => strings(inner, `${path}.${key}`));
  }
  return [];
}

test("the prices and setup fees are the configured numbers", () => {
  const [agent, team] = realEstatePack.tiers;

  assert.equal(agent.name, "Agent");
  assert.equal(agent.monthlyUsd, 497);
  assert.equal(agent.priceDisplay, "$497");
  assert.equal(agent.setupUsd, 500);
  assert.equal(agent.setupDisplay, "$500");
  assert.equal(agent.cadence, "per month");
  assert.equal(agent.setupLabel, "plus $500 setup");

  assert.equal(team.name, "Team");
  assert.equal(team.monthlyUsd, 997);
  assert.equal(team.priceDisplay, "$997");
  assert.equal(team.setupUsd, 1500);
  assert.equal(team.setupDisplay, "$1,500");
  assert.equal(team.cadence, "per month");
  assert.equal(team.setupLabel, "plus $1,500 setup");
});

test("each tier calls to action with the right onboarding URL", () => {
  for (const tier of realEstatePack.tiers) {
    assert.equal(tier.cta, "Request onboarding");
  }
  assert.equal(
    realEstatePack.tiers[0].href,
    "https://genesisaisolutions.cloud/packs/real_estate/signup?tier=Agent",
  );
  assert.equal(
    realEstatePack.tiers[1].href,
    "https://genesisaisolutions.cloud/packs/real_estate/signup?tier=Team",
  );
});

test("the required copy is present", () => {
  assert.equal(realEstatePack.eyebrow, "Real Estate Pros pricing");
  assert.equal(realEstatePack.headline, "One closed listing pays for the plan.");
  assert.equal(realEstatePack.footer, "Genesis is software. We do not buy, sell or list property.");
  assert.match(realEstatePack.lede, /captures and routes every buyer and seller lead/);
});

test("no copy string contains a dash of any kind, only the URLs may", () => {
  for (const { path, text } of strings(realEstatePack)) {
    const isUrl = text.startsWith("http://") || text.startsWith("https://");
    if (isUrl) continue;
    for (const dash of DASHES) {
      assert.equal(text.includes(dash), false, `${path} contains "${dash}": ${text}`);
    }
  }
});
