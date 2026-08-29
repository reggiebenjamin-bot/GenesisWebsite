import type { Metadata } from "next";
import { indexable } from "@/lib/site";

const description =
  "Genesis AI is preparing G-Core Mini software and delivers consultation-led custom Infrastructure for real-estate operations.";
type PagePreview = {
  path: string;
  image: string;
  alt: string;
};

const pagePreviews: Record<string, PagePreview> = {
  "G-Core Mini": {
    path: "/mini",
    image: "/images/social/og-home-1920x1080.png",
    alt: "Genesis AI brand preview for G-Core Mini, a product in commercial review",
  },
  Solutions: {
    path: "/solutions",
    image: "/images/social/og-solutions-1920x1080.png",
    alt: "Genesis AI Solutions — four connected layers in one managed system",
  },
  "How It Works": {
    path: "/how-it-works",
    image: "/images/social/og-how-it-works-1920x1080.png",
    alt: "How Genesis AI works — a practical path from provisioning to ongoing management",
  },
  Pricing: {
    path: "/pricing",
    image: "/images/social/og-pricing-1920x1080.png",
    alt: "Genesis AI pricing — Agent Dashboard subscriptions and custom Infrastructure starting prices",
  },
  Results: {
    path: "/results",
    image: "/images/social/og-results-1920x1080.png",
    alt: "Genesis AI Results — the standard for verified operating proof",
  },
  About: {
    path: "/about",
    image: "/images/social/og-about-1920x1080.png",
    alt: "About Genesis AI — operational foundations built to keep working",
  },
  Contact: {
    path: "/contact",
    image: "/images/social/og-contact-1920x1080.png",
    alt: "Contact Genesis AI — book a consultation for your operation",
  },
};

export function pageMetadata(title: string, pageDescription = description): Metadata {
  const preview = pagePreviews[title];

  return {
    title,
    description: pageDescription,
    alternates: indexable ? { canonical: preview.path } : undefined,
    openGraph: {
      title: `${title} | Genesis AI`,
      description: pageDescription,
      type: "website",
      siteName: "Genesis AI",
      url: preview.path,
      images: [
        {
          url: preview.image,
          width: 1920,
          height: 1080,
          alt: preview.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Genesis AI`,
      description: pageDescription,
      images: [preview.image],
    },
  };
}
