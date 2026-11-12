import assert from "node:assert/strict";
import test from "node:test";
import { FUNDING_LINE } from "../lib/legal.ts";
import { managedPlans } from "../lib/offers.ts";
import { fullTitle, seoPages } from "../lib/seo.ts";
import { texasLanding } from "../lib/texasPages.ts";
import { texasServiceLandings } from "../lib/texasServicePages.ts";

const DASHES = ["-", "–", "—"];
const EMOJI = /\p{Extended_Pictographic}/u;
const BANNED = /\b(lend|lender|loan|mortgage|real estate|investor|funding|guarantee|guaranteed|testimonial|clients?|customers served)\b/i;

function strings(value: unknown, path = "page"): { path: string; text: string }[] {
  if (typeof value === "string") return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => strings(item, `${path}[${index}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, inner]) => strings(inner, `${path}.${key}`));
  }
  return [];
}

test("the service landings are the hub and seven trades, all in the sitemap", () => {
  assert.deepEqual(
    texasServiceLandings.map((page) => page.path),
    [
      "/texas/service-businesses",
      "/texas/hvac",
      "/texas/plumbing",
      "/texas/roofing",
      "/texas/electrical",
      "/texas/landscaping",
      "/texas/cleaning",
      "/texas/contractors",
    ],
  );
  for (const page of texasServiceLandings) {
    assert.ok(seoPages.some((entry) => entry.path === page.path), `${page.path} missing from the sitemap`);
    assert.equal(texasLanding(page.path).title, page.title);
    assert.equal(page.points.length, 3);
    assert.ok(page.faqs.length >= 4);
    assert.equal(page.ctas[0]?.href, "/assessment");
    assert.ok(page.ctas.some((cta) => cta.href === "/pricing"));
    assert.equal(page.pricing, true);
    assert.equal(page.parent, page.path === "/texas/service-businesses" ? "/texas" : "/texas/service-businesses");
    assert.ok(page.related.some((item) => item.href === "/texas"));
    assert.ok(page.related.some((item) => item.href === "/texas/san-antonio"));
    if (page.path !== "/texas/service-businesses") {
      assert.ok(page.related.some((item) => item.href === "/texas/service-businesses"));
    }
  }
  const hub = texasServiceLandings[0];
  for (const trade of texasServiceLandings.slice(1)) {
    assert.ok(hub.related.some((item) => item.href === trade.path), `hub does not link ${trade.path}`);
  }
  assert.ok(texasLanding("/texas").related.some((item) => item.href === "/texas/service-businesses"));
});

test("service landing titles, descriptions, headlines and ledes are unique and in range", () => {
  const unique = (values: string[]) => assert.equal(new Set(values).size, values.length);
  unique(texasServiceLandings.map((page) => page.title));
  unique(texasServiceLandings.map((page) => page.description));
  unique(texasServiceLandings.map((page) => page.headline));
  unique(texasServiceLandings.map((page) => page.lede));
  for (const page of texasServiceLandings) {
    const title = `${page.title} | Genesis AI`;
    assert.equal(title, fullTitle(seoPages.find((entry) => entry.path === page.path)!));
    assert.ok(title.length <= 60, `"${title}" is too long`);
    assert.ok(
      page.description.length >= 70 && page.description.length <= 170,
      `${page.path} description is ${page.description.length} characters`,
    );
  }
});

test("service landing FAQs name the live Levels prices and carry no real estate or lending claims", () => {
  const prices = managedPlans.map((plan) => plan.priceDisplay);
  const setups = managedPlans.map((plan) => plan.setupDisplay);
  for (const page of texasServiceLandings) {
    const blob = page.faqs.map((faq) => `${faq.question} ${faq.answer}`).join(" ");
    for (const value of [...prices, ...setups]) assert.ok(blob.includes(value), `${page.path} faqs missing ${value}`);
    assert.equal(page.disclaimer, FUNDING_LINE);
    for (const { path, text } of strings({ ...page, disclaimer: "" })) {
      if (text.startsWith("/")) continue;
      assert.equal(BANNED.test(text), false, `${path} has a banned claim: ${text}`);
    }
  }
});

test("no service landing copy string contains a dash, emoji or a number claim, only URLs may", () => {
  for (const page of texasServiceLandings) {
    for (const { path, text } of strings(page)) {
      if (text.startsWith("/")) continue;
      for (const dash of DASHES) assert.equal(text.includes(dash), false, `${path} contains "${dash}": ${text}`);
      assert.equal(EMOJI.test(text), false, `${path} contains an emoji: ${text}`);
      assert.equal(/\d+\s*%|\bpercent\b/i.test(text), false, `${path} has a stat: ${text}`);
    }
  }
});
