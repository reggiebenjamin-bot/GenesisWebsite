import assert from "node:assert/strict";
import test from "node:test";
import { editions, editionByPath } from "../lib/editions.ts";
import { FUNDING_LINE } from "../lib/legal.ts";
import { realEstatePack } from "../lib/realEstatePack.ts";

/* The three dash characters that must never appear in visitor copy. */
const DASHES = ["-", "–", "—"];
/* Any emoji or pictographic character is banned from visitor copy. */
const EMOJI = /\p{Extended_Pictographic}/u;

/** Every string on an edition, paired with the key path that reached it. */
function strings(value: unknown, path = "edition"): { path: string; text: string }[] {
  if (typeof value === "string") return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => strings(item, `${path}[${index}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, inner]) => strings(inner, `${path}.${key}`));
  }
  return [];
}

test("the four editions are Lending, Real Estate Pros, Business and Enterprise", () => {
  assert.deepEqual(
    editions.map((edition) => edition.href),
    ["/lending", "/real-estate", "/business", "/enterprise"],
  );
  assert.deepEqual(
    editions.map((edition) => edition.name),
    ["Genesis Lending", "Genesis Real Estate Pros", "Genesis Business", "Genesis Enterprise"],
  );
});

test("every edition has three benefit points and the shared funding disclaimer", () => {
  for (const edition of editions) {
    assert.equal(edition.points.length, 3, `${edition.name} points`);
    assert.equal(edition.disclaimer, FUNDING_LINE, `${edition.name} disclaimer`);
  }
});

test("Lending keeps its own page and the other three carry calls to action", () => {
  assert.equal(editionByPath("/lending")?.ctas.length, 0);
  assert.ok(editionByPath("/real-estate")!.ctas.length > 0);
  assert.ok(editionByPath("/business")!.ctas.length > 0);
  assert.ok(editionByPath("/enterprise")!.ctas.length > 0);
});

test("CTA URLs are existing internal routes or existing real estate pack URLs", () => {
  const packUrls = realEstatePack.tiers.map((tier) => String(tier.href));
  for (const edition of editions) {
    for (const cta of edition.ctas) {
      const ok = cta.href.startsWith("/") || packUrls.includes(cta.href);
      assert.ok(ok, `${edition.name} CTA points at an unexpected URL: ${cta.href}`);
    }
  }
});

test("no edition copy string contains a dash or emoji, only the URLs may", () => {
  for (const { path, text } of strings(editions)) {
    const isUrl = text.startsWith("http://") || text.startsWith("https://") || text.startsWith("/");
    if (isUrl) continue;
    for (const dash of DASHES) {
      assert.equal(text.includes(dash), false, `${path} contains "${dash}": ${text}`);
    }
    assert.equal(EMOJI.test(text), false, `${path} contains an emoji: ${text}`);
  }
});
