import assert from "node:assert/strict";
import test from "node:test";
import { lendingPage } from "../lib/lendingPage.ts";
import { FUNDING_LINE } from "../lib/legal.ts";

/* The three dash characters that must never appear in visitor copy. */
const DASHES = ["-", "–", "—"];
/* Any emoji or pictographic character is banned from visitor copy. */
const EMOJI = /\p{Extended_Pictographic}/u;

/** Every string on the page, paired with the key path that reached it. */
function strings(value: unknown, path = "lendingPage"): { path: string; text: string }[] {
  if (typeof value === "string") return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => strings(item, `${path}[${index}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, inner]) => strings(inner, `${path}.${key}`));
  }
  return [];
}

test("the two CTAs point at the assessment, then Lending Edition pricing", () => {
  assert.equal(lendingPage.ctas.primary.label, "Assess my business");
  assert.equal(lendingPage.ctas.primary.href, "/assessment");

  assert.equal(lendingPage.ctas.secondary.label, "See Lending Edition pricing");
  assert.equal(lendingPage.ctas.secondary.href, "/packs/lending/pricing");
});

test("the disclaimer is the shared funding line", () => {
  assert.equal(lendingPage.disclaimer, FUNDING_LINE);
});

test("there are three benefit bullets", () => {
  assert.equal(lendingPage.benefits.length, 3);
});

test("no copy string contains a dash or emoji, only the URLs may", () => {
  for (const { path, text } of strings(lendingPage)) {
    const isUrl = text.startsWith("http://") || text.startsWith("https://") || text.startsWith("/");
    if (isUrl) continue;
    for (const dash of DASHES) {
      assert.equal(text.includes(dash), false, `${path} contains "${dash}": ${text}`);
    }
    assert.equal(EMOJI.test(text), false, `${path} contains an emoji: ${text}`);
  }
});
