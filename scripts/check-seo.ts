/*
 * The SEO gate. Runs after `next build` and reads the HTML the build actually
 * produced, so a page that ships without a title, with the wrong canonical,
 * with a stray noindex, with broken structured data, or with no link to it
 * from anywhere else fails the build instead of quietly dropping out of
 * search.
 *
 * It checks whichever kind of build this is. A production build must be
 * indexable, with canonicals and a full sitemap. Any other build must be
 * closed to crawlers, with noindex everywhere and nothing in the sitemap, so a
 * preview can never be indexed in the site's place.
 *
 *   node --experimental-strip-types scripts/check-seo.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { absoluteUrl, fullTitle, seoPages, type SeoPage } from "../lib/seo.ts";
import { indexable, siteUrl } from "../lib/site.ts";

const APP = join(process.cwd(), ".next", "server", "app");
const failures: string[] = [];
const fail = (where: string, message: string) => failures.push(`${where}: ${message}`);

if (!existsSync(APP)) {
  console.error(`SEO check: no build output at ${APP}. Run \`next build\` first.`);
  process.exit(1);
}

const decode = (text: string) =>
  text
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

function attribute(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return match ? decode(match[1]) : null;
}

/** Every <meta>/<link> tag in the head whose attribute matches. */
function tags(head: string, element: "meta" | "link", key: string, value: string): string[] {
  return (head.match(new RegExp(`<${element}\\b[^>]*>`, "g")) ?? []).filter(
    (tag) => attribute(tag, key) === value,
  );
}

const htmlFile = (path: string) => join(APP, path === "/" ? "index.html" : `${path.slice(1)}.html`);

const rendered: { page: SeoPage; html: string }[] = [];
const perRequest: string[] = [];

for (const page of seoPages) {
  const file = htmlFile(page.path);
  if (!existsSync(file)) {
    // Rendered per request (it reads the query string), so there is no file to read.
    perRequest.push(page.path);
    continue;
  }
  rendered.push({ page, html: readFileSync(file, "utf8") });
}

for (const { page, html } of rendered) {
  const where = page.path;
  const head = html.slice(0, html.indexOf("</head>"));
  const body = html.slice(html.indexOf("</head>"));

  const titles = head.match(/<title>([\s\S]*?)<\/title>/g) ?? [];
  if (titles.length !== 1) fail(where, `expected one <title>, found ${titles.length}`);
  else if (decode(titles[0].replace(/<\/?title>/g, "")) !== fullTitle(page)) {
    fail(where, `title is "${decode(titles[0].replace(/<\/?title>/g, ""))}", expected "${fullTitle(page)}"`);
  }

  const description = tags(head, "meta", "name", "description");
  if (description.length !== 1) fail(where, `expected one meta description, found ${description.length}`);
  else if (attribute(description[0], "content") !== page.description) {
    fail(where, "meta description does not match lib/seo.ts");
  }

  const ogTitle = tags(head, "meta", "property", "og:title")[0];
  if (!ogTitle || attribute(ogTitle, "content") !== fullTitle(page)) fail(where, "og:title does not match the title");
  const ogUrl = tags(head, "meta", "property", "og:url")[0];
  if (!ogUrl || attribute(ogUrl, "content") !== absoluteUrl(page.path)) fail(where, "og:url is not the canonical URL");
  if (tags(head, "meta", "property", "og:image").length === 0) fail(where, "no og:image");

  const robots = tags(head, "meta", "name", "robots").map((tag) => attribute(tag, "content") ?? "");
  const canonicals = tags(head, "link", "rel", "canonical");

  if (indexable) {
    if (robots.some((content) => /noindex/.test(content))) fail(where, "noindex on an indexable build");
    if (canonicals.length !== 1) fail(where, `expected one canonical, found ${canonicals.length}`);
    else {
      const href = attribute(canonicals[0], "href") ?? "";
      if (href !== absoluteUrl(page.path)) fail(where, `canonical is ${href}, expected ${absoluteUrl(page.path)}`);
      if (new URL(href).origin !== new URL(siteUrl).origin) fail(where, `canonical points at ${new URL(href).origin}`);
    }
  } else if (!robots.some((content) => /noindex/.test(content))) {
    fail(where, "a build that is not production must carry noindex");
  }

  const h1s = body.match(/<h1\b/g) ?? [];
  if (h1s.length !== 1) fail(where, `expected one <h1>, found ${h1s.length}`);

  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (scripts.length === 0) fail(where, "no structured data");
  for (const [, json] of scripts) {
    try {
      const data = JSON.parse(json);
      if (data["@context"] !== "https://schema.org") fail(where, "structured data without the schema.org context");
      if (/aggregateRating|"review"/.test(json)) fail(where, "structured data claims ratings or reviews");
    } catch {
      fail(where, "structured data is not valid JSON");
    }
  }
}

/* Every indexable page is linked from at least one other page, so crawlers
   that follow links — not only the sitemap — can reach it. */
for (const page of seoPages) {
  if (page.path === "/") continue;
  const linked = rendered.some(
    ({ page: other, html }) => other.path !== page.path && html.includes(`href="${page.path}"`),
  );
  if (!linked) fail(page.path, "no other page links here");
}

/* robots.txt and the sitemap agree with the kind of build this is. */
const robotsTxt = readFileSync(join(APP, "robots.txt.body"), "utf8");
const sitemapXml = readFileSync(join(APP, "sitemap.xml.body"), "utf8");
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

if (indexable) {
  if (/^Disallow: \/\s*$/m.test(robotsTxt)) fail("robots.txt", "disallows the whole site on an indexable build");
  if (!robotsTxt.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) fail("robots.txt", "does not point at the sitemap");
  for (const bot of ["Googlebot", "Bingbot", "OAI-SearchBot"]) {
    if (!robotsTxt.includes(`User-Agent: ${bot}`)) fail("robots.txt", `does not name ${bot}`);
  }

  const expected = seoPages.map((page) => absoluteUrl(page.path)).sort();
  if (JSON.stringify([...sitemapUrls].sort()) !== JSON.stringify(expected)) {
    fail("sitemap.xml", "does not list exactly the indexable pages");
  }
} else {
  if (!/^Disallow: \/\s*$/m.test(robotsTxt)) fail("robots.txt", "a build that is not production must disallow crawling");
  if (sitemapUrls.length > 0) fail("sitemap.xml", "a build that is not production must list nothing");
}

const kind = indexable ? "indexable (production)" : "closed to crawlers (not production)";
if (failures.length) {
  console.error(`\nSEO check failed for this ${kind} build:\n`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  console.error("");
  process.exit(1);
}

console.log(
  `SEO check passed: ${rendered.length} pages, robots.txt and sitemap.xml, ${kind} build.` +
    (perRequest.length ? ` Rendered per request, checked by the unit tests: ${perRequest.join(", ")}.` : ""),
);
