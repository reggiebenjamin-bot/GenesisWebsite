/*
 * Where the site lives, and whether search engines may index it.
 *
 * Production is indexable by default and every other deployment is not, so a
 * preview or staging build can never become a second "source of truth" for a
 * search engine or an AI crawler. NEXT_PUBLIC_SITE_INDEXABLE still wins in
 * either direction: "false" takes production out of search, "true" opens a
 * non-production build (for checking the indexable output locally).
 */
const configuredIndexability = process.env.NEXT_PUBLIC_SITE_INDEXABLE;
const deployment = process.env.VERCEL_ENV;

export const indexable =
  configuredIndexability === "true" ||
  (configuredIndexability !== "false" && deployment === "production");

/** The one canonical origin. The apex domain redirects here. */
export const canonicalOrigin = "https://www.geai.us";

/**
 * Every canonical, sitemap and structured-data URL is built on this. Previews
 * point at production too: they are not indexable, and if a crawler reaches
 * one anyway, the canonical sends it to the real page.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || canonicalOrigin).replace(/\/+$/, "");
