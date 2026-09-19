import type { MetadataRoute } from "next";
import { absoluteUrl, seoPages } from "@/lib/seo";
import { indexable } from "@/lib/site";

/**
 * Every canonical, indexable page — and nothing else. Built from the same
 * registry as the canonicals, so the two cannot disagree. A deployment that
 * is not indexable lists nothing, so no noindexed page is ever in a sitemap.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexable) return [];

  return seoPages.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: page.lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
