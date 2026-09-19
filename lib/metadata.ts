import type { Metadata } from "next";
import { absoluteUrl, fullTitle, seoPage } from "@/lib/seo";
import { indexable } from "@/lib/site";

/**
 * A page's metadata, from its entry in lib/seo.ts: the title, description,
 * canonical and social preview all say the same thing, because they come from
 * the same place. Search engines build a result's title from several of these
 * at once, so they should never disagree.
 */
export function pageMetadata(path: string): Metadata {
  const page = seoPage(path);
  const title = fullTitle(page);
  const images = page.image ? [page.image] : undefined;

  return {
    title: page.title,
    description: page.description,
    alternates: indexable ? { canonical: absoluteUrl(page.path) } : undefined,
    openGraph: {
      title,
      description: page.description,
      type: "website",
      siteName: "Genesis AI",
      locale: "en_US",
      url: absoluteUrl(page.path),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: page.description,
      ...(images ? { images: images.map((image) => image.url) } : {}),
    },
  };
}
