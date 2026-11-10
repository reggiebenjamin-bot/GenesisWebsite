import assert from "node:assert/strict";
import test from "node:test";
import { editions, editionByPath } from "../lib/editions.ts";
import { FUNDING_LINE } from "../lib/legal.ts";

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

test("every edition points to the assessment, then to its pricing", () => {
  for (const edition of editions) {
    assert.equal(edition.ctas[0]?.href, "/assessment", `${edition.name} first CTA`);
    assert.ok(edition.ctas.length >= 2, `${edition.name} CTAs`);
  }
  assert.equal(editionByPath("/lending")!.ctas[1].href, "/packs/lending/pricing");
  assert.equal(editionByPath("/real-estate")!.ctas[1].href, "/packs/real_estate/pricing");
  assert.ok(editionByPath("/real-estate")!.ctas.length > 0);
  assert.ok(editionByPath("/business")!.ctas.length > 0);
  assert.ok(editionByPath("/enterprise")!.ctas.length > 0);
});

test("CTA URLs are internal routes only", () => {
  for (const edition of editions) {
    for (const cta of edition.ctas) {
      assert.ok(cta.href.startsWith("/"), `${edition.name} CTA points at an external URL: ${cta.href}`);
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
