import type { Metadata } from "next";

const description =
  "Genesis AI builds and manages practical systems that help real-estate operators work faster and close more deals.";

export function pageMetadata(title: string, pageDescription = description): Metadata {
  return {
    title,
    description: pageDescription,
    openGraph: {
      title: `${title} | Genesis AI`,
      description: pageDescription,
      type: "website",
      siteName: "Genesis AI",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Genesis AI`,
      description: pageDescription,
    },
  };
}
