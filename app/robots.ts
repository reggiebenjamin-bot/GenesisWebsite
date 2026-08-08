import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const indexable = process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://genesis-ai-preview.vercel.app";

  if (!indexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
