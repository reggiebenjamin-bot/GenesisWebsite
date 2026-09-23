import assert from "node:assert/strict";
import test from "node:test";
import { genesisTools, managedPlans } from "../lib/offers.ts";
import {
  aboutPageSchema,
  breadcrumbSchema,
  managedServiceSchema,
  organizationSchema,
  priceNumber,
  softwareApplicationSchema,
  toolsCollectionSchema,
  websiteSchema,
} from "../lib/schema.ts";
import { absoluteUrl, breadcrumbTrail, fullTitle, seoPages, toolSeo } from "../lib/seo.ts";
import { canonicalOrigin, siteUrl } from "../lib/site.ts";
import { toolPages } from "../lib/toolPages.ts";

/* The build-time checks in scripts/check-seo.ts cover the rendered HTML;
   these cover the data every page's metadata is made from. */

test("every indexable page has one path, one title and one description of its own", () => {
  const paths = seoPages.map((page) => page.path);
  const titles = seoPages.map(fullTitle);
  const descriptions = seoPages.map((page) => page.description);

  assert.equal(new Set(paths).size, paths.length, "duplicate path");
  assert.equal(new Set(titles).size, titles.length, "duplicate title");
  assert.equal(new Set(descriptions).size, descriptions.length, "duplicate description");

  for (const page of seoPages) {
    assert.match(page.path, /^\/[a-z0-9/-]*$/, `${page.path} is not a clean path`);
    assert.ok(!page.path.endsWith("/") || page.path === "/", `${page.path} has a trailing slash`);
    assert.ok(fullTitle(page).length <= 60, `"${fullTitle(page)}" is too long for a result title`);
    assert.ok(
      page.description.length >= 70 && page.description.length <= 170,
      `${page.path}: description is ${page.description.length} characters`,
    );
    assert.match(page.lastModified, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("the page that moved stays out, and every tool has its own page", () => {
  const paths = seoPages.map((page) => page.path);
  assert.ok(!paths.includes("/mini"), "/mini redirects, so it must not be listed");
  assert.ok(paths.includes("/assessment"), "the infrastructure assessment must be indexable");
  for (const tool of genesisTools) {
    assert.ok(paths.includes(`/tools/${tool.id}`), `${tool.name} has no page`);
  }
});

test("canonical URLs are absolute and on the production domain", () => {
  assert.equal(canonicalOrigin, "https://www.geai.us");
  assert.ok(!siteUrl.endsWith("/"));
  for (const page of seoPages) {
    const url = absoluteUrl(page.path);
    assert.ok(url.startsWith(siteUrl), url);
    assert.ok(!url.includes("vercel.app"), `${url} points at a deployment, not the site`);
  }
});

test("every breadcrumb trail starts at home and ends at the page", () => {
  for (const page of seoPages) {
    const trail = breadcrumbTrail(page.path);
    assert.equal(trail[0].path, "/");
    assert.equal(trail.at(-1)?.path, page.path);

    const list = breadcrumbSchema(page.path);
    list.itemListElement.forEach((item, index) => assert.equal(item.position, index + 1));
  }
  assert.deepEqual(
    breadcrumbTrail("/tools/capital-advisor").map((page) => page.label),
    ["Home", "Genesis Tools", "Capital Advisor"],
  );
});

/** Every key, at any depth, in a structured-data object. */
function keysOf(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(keysOf);
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, inner]) => [key, ...keysOf(inner)]);
  }
  return [];
}

test("structured data never claims ratings or reviews Genesis does not have", () => {
  const all = [
    organizationSchema(),
    websiteSchema(),
    toolsCollectionSchema(),
    managedServiceSchema(),
    aboutPageSchema(),
    ...genesisTools.map(softwareApplicationSchema),
  ];
  const keys = new Set(all.flatMap(keysOf));
  for (const banned of ["aggregateRating", "review", "reviewRating"]) {
    assert.ok(!keys.has(banned), `structured data contains ${banned}`);
  }
});

test("every structured-data price is the price printed on the page", () => {
  for (const tool of genesisTools) {
    const schema = softwareApplicationSchema(tool);
    assert.equal(schema.offers.price, priceNumber(tool.price.display), tool.name);
    assert.equal(schema.offers.priceCurrency, "USD");
    assert.equal(schema.url, absoluteUrl(`/tools/${tool.id}`));
  }

  const plans = managedServiceSchema().hasOfferCatalog.itemListElement;
  assert.deepEqual(
    plans.map((offer) => offer.price),
    managedPlans.map((plan) => priceNumber(plan.priceDisplay)),
  );
});

test("the organization record carries what search engines need to recognise Genesis", () => {
  const organization = organizationSchema();
  assert.equal(organization.name, "Genesis AI");
  assert.equal(organization.url, siteUrl);
  assert.ok(organization.logo.url.endsWith(".png"));
  assert.ok(organization.description.startsWith("AI Infrastructure for Real Estate Professionals"));
  assert.ok(organization.sameAs.every((url) => url.startsWith("https://")));
});

test("each tool page answers what it is, who makes it, and what it costs", () => {
  for (const tool of genesisTools) {
    const page = toolPages[tool.id];
    assert.ok(page.definition.startsWith(`${tool.name} is `), `${tool.name} definition`);
    assert.ok(page.definition.includes("Genesis AI"), `${tool.name} definition names the maker`);

    const facts = Object.fromEntries(page.facts.map((fact) => [fact.label, fact.value]));
    assert.equal(facts["Made by"], "Genesis AI");
    assert.ok(facts.Price.startsWith(tool.price.display), `${tool.name} price fact`);
    assert.ok(page.facts.every((fact) => fact.value.trim().length > 0), `${tool.name} empty fact`);
    assert.ok(page.faqs.length >= 2);
  }

  const dealPackager = toolPages["deal-packager"].facts.find((fact) => fact.label === "Does not");
  assert.match(dealPackager?.value ?? "", /Invent evidence/);

  const capitalAdvisor = toolPages["capital-advisor"].facts.find((fact) => fact.label === "Does not");
  assert.match(capitalAdvisor?.value ?? "", /Quote live rates/);
});

test("tool search snippets stay aligned with the live catalog and shared prices", () => {
  for (const tool of genesisTools) {
    const snippet = toolSeo[tool.id];
    assert.ok(snippet.description.includes(`${tool.price.display} per ${tool.price.unit}`), `${tool.name} snippet price`);
  }

  const searchCopy = seoPages.map((page) => `${fullTitle(page)} ${page.description}`).join(" ");
  assert.doesNotMatch(searchCopy, /Funding Ready|Deal Desk/);
  assert.doesNotMatch(toolSeo["capital-advisor"].description, /compar(?:e|ing|ison).*scenarios?/i);
});
