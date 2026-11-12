import assert from "node:assert/strict";
import test from "node:test";
import { FUNDING_LINE } from "../lib/legal.ts";
import { managedPlans } from "../lib/offers.ts";
import { fullTitle, seoPages } from "../lib/seo.ts";
import { texasLanding, texasLandings } from "../lib/texasPages.ts";

const DASHES = ["-", "–", "—"];
const EMOJI = /\p{Extended_Pictographic}/u;

function strings(value: unknown, path = "page"): { path: string; text: string }[] {
  if (typeof value === "string") return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => strings(item, `${path}[${index}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, inner]) => strings(inner, `${path}.${key}`));
  }
  return [];
}

test("the Texas landings cover the hub, three use cases and four cities", () => {
  assert.deepEqual(
    texasLandings.map((page) => page.path),
    [
      "/texas",
      "/texas/investors",
      "/texas/lenders",
      "/texas/fix-and-flip",
      "/texas/san-antonio",
      "/texas/dfw",
      "/texas/houston",
      "/texas/austin",
    ],
  );
  for (const page of texasLandings) {
    assert.ok(seoPages.some((entry) => entry.path === page.path), `${page.path} missing from the sitemap`);
    assert.equal(texasLanding(page.path).title, page.title);
    assert.equal(page.disclaimer, FUNDING_LINE);
    assert.equal(page.points.length, 3);
    assert.ok(page.faqs.length >= 2);
    assert.equal(page.ctas[0]?.href, "/assessment");
  }
});

test("Texas landing search titles and descriptions stay unique and in range", () => {
  const titles = texasLandings.map((page) => `${page.title} | Genesis AI`);
  const descriptions = texasLandings.map((page) => page.description);
  assert.equal(new Set(titles).size, titles.length);
  assert.equal(new Set(descriptions).size, descriptions.length);
  for (const page of texasLandings) {
    const title = `${page.title} | Genesis AI`;
    assert.equal(title, fullTitle(seoPages.find((entry) => entry.path === page.path)!));
    assert.ok(title.length <= 60, `"${title}" is too long`);
    assert.ok(
      page.description.length >= 70 && page.description.length <= 170,
      `${page.path} description is ${page.description.length} characters`,
    );
  }
});

test("Texas landing copy names the live Levels prices and never invents funding", () => {
  const prices = managedPlans.map((plan) => plan.priceDisplay);
  assert.deepEqual(prices, ["$750", "$1,750", "$4,500"]);
  for (const page of texasLandings) {
    const blob = page.faqs.map((faq) => `${faq.question} ${faq.answer}`).join(" ");
    for (const price of prices) {
      assert.ok(blob.includes(price), `${page.path} faqs missing ${price}`);
    }
    assert.ok(blob.includes(FUNDING_LINE), `${page.path} faqs missing the funding line`);
  }
});

test("no Texas landing copy string contains a dash or emoji, only the URLs may", () => {
  for (const page of texasLandings) {
    for (const { path, text } of strings(page)) {
      const isUrl = text.startsWith("http://") || text.startsWith("https://") || text.startsWith("/");
      if (isUrl) continue;
      for (const dash of DASHES) {
        assert.equal(text.includes(dash), false, `${path} contains "${dash}": ${text}`);
      }
      assert.equal(EMOJI.test(text), false, `${path} contains an emoji: ${text}`);
    }
  }
});
