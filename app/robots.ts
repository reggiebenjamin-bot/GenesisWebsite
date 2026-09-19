import type { MetadataRoute } from "next";
import { siteUrl, indexable } from "@/lib/site";

/* Never for crawlers: the form endpoint and the framework's internals. */
const PRIVATE = ["/api/"];

/*
 * Search and answer engines Genesis wants to be found in, named explicitly so
 * the intent survives a future change to the default rule. A crawler follows
 * only the most specific group that names it, so each group repeats the
 * private paths rather than inheriting them.
 *
 * Crawlers that collect training data (GPTBot, Google-Extended, CCBot and
 * the like) fall under the default rule. Whether to allow them is a business
 * decision, separate from being findable in search.
 */
const SEARCH_CRAWLERS = [
  "Googlebot",
  "Bingbot",
  "DuckDuckBot",
  "Applebot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
];

export default function robots(): MetadataRoute.Robots {
  if (!indexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [
      { userAgent: SEARCH_CRAWLERS, allow: "/", disallow: PRIVATE },
      { userAgent: "*", allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
