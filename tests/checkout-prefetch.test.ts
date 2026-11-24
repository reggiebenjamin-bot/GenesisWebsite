import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { gateCheckoutLink, isPrefetchRequest } from "../lib/checkoutLink.ts";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const BASE = "https://www.geai.us/start/750?edition=business";

function request(url: string, headers: Record<string, string> = {}) {
  return new Request(url, { headers: { "user-agent": IPHONE, ...headers } });
}

/** Stand-in for startManagedCheckout: records every call that would reach Stripe. */
function mockStripe() {
  const calls: Array<[string, string | null]> = [];
  const start = async (plan: string, edition: string | null) => {
    calls.push([plan, edition]);
    return new Response(null, { status: 303, headers: { Location: "https://checkout.stripe.com/c/pay/cs_test_mock" } });
  };
  return { calls, start };
}

const PREFETCHES: Array<[string, Record<string, string>]> = [
  ["RSC header", { rsc: "1" }],
  ["Next-Router-Prefetch", { rsc: "1", "next-router-prefetch": "1" }],
  ["Next-Router-Prefetch alone", { "next-router-prefetch": "1" }],
  ["Next-Router-State-Tree", { "next-router-state-tree": "%5B%22%22%5D" }],
  ["Purpose: prefetch", { purpose: "prefetch" }],
  ["Sec-Purpose: prefetch", { "sec-purpose": "prefetch" }],
  ["Sec-Purpose: prefetch;prerender", { "sec-purpose": "prefetch;prerender" }],
  ["X-Moz: prefetch", { "x-moz": "prefetch" }],
];

for (const [name, headers] of PREFETCHES) {
  test(`a ${name} request never reaches Stripe`, async () => {
    const stripe = mockStripe();
    const req = request(BASE, headers);
    assert.equal(isPrefetchRequest(req), true);
    const res = await gateCheckoutLink(req, "750", stripe.start);
    assert.equal(stripe.calls.length, 0);
    assert.equal(res.status, 303);
    assert.equal(res.headers.get("location"), "https://www.geai.us/pricing#custom-infrastructure");
    assert.equal(res.headers.get("cache-control"), "no-store");
  });
}

test("an _rsc query never reaches Stripe, for every tier and edition", async () => {
  for (const tier of ["750", "1750", "4500"]) {
    for (const suffix of ["?_rsc=5CB68i4pnAekjehf", "?edition=business&_rsc=abc", "?edition=real_estate&_rsc=abc", "?edition=lending&_rsc=abc"]) {
      const stripe = mockStripe();
      const res = await gateCheckoutLink(request(`https://www.geai.us/start/${tier}${suffix}`), tier, stripe.start);
      assert.equal(stripe.calls.length, 0, `${tier}${suffix}`);
      assert.equal(res.status, 303);
    }
  }
});

test("bots and unknown tiers never reach Stripe", async () => {
  const stripe = mockStripe();
  await gateCheckoutLink(
    new Request(BASE, { headers: { "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" } }),
    "750",
    stripe.start,
  );
  await gateCheckoutLink(request("https://www.geai.us/start/697"), "697", stripe.start);
  assert.equal(stripe.calls.length, 0);
});

test("a person opening the link still starts checkout with the plan and edition", async () => {
  const stripe = mockStripe();
  const req = request(BASE, {
    accept: "text/html,application/xhtml+xml",
    "sec-fetch-mode": "navigate",
    "sec-fetch-dest": "document",
  });
  assert.equal(isPrefetchRequest(req), false);
  const res = await gateCheckoutLink(req, "750", stripe.start);
  assert.deepEqual(stripe.calls, [["managed-750", "business"]]);
  assert.equal(res.headers.get("location"), "https://checkout.stripe.com/c/pay/cs_test_mock");
});

test("the /start route goes through the prefetch gate", () => {
  const route = readFileSync(new URL("../app/start/[tier]/route.ts", import.meta.url), "utf8");
  assert.match(route, /startManagedCheckoutFromLink\(request, tier\)/);
  const start = readFileSync(new URL("../lib/managedCheckoutStart.ts", import.meta.url), "utf8");
  assert.match(start, /gateCheckoutLink\(request, rawPlan/);
  assert.equal(/planFromLink\(|isLinkPreviewAgent\(/.test(start), false, "gate is the only entry");
});

test("no next/link points at /start, so nothing prefetches checkout", () => {
  for (const file of ["components/home/ProductChooser.tsx", "components/home/PlanCards.tsx"]) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    const links = source.match(/<Link\b[^>]*>/g) ?? [];
    for (const link of links) {
      assert.equal(/level\.href|\/start\//.test(link), false, `${file}: ${link}`);
    }
    assert.match(source, /<a\b[^>]*href=\{level\.href\}/, file);
  }
});
