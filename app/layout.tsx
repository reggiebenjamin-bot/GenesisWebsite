import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { contact } from "@/lib/content";
import { infrastructureCatalog } from "@/lib/products";
import { indexable, siteUrl } from "@/lib/site";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08090e",
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Genesis AI | Agent Software & Custom Infrastructure",
    template: "%s | Genesis AI",
  },
  description:
    "G-Core Mini is ready-to-use software for agents and small teams. Genesis Infrastructure delivers custom systems for brokerages, lenders, acquisitions teams, and complex operations.",
  applicationName: "Genesis AI",
  category: "Business services",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  alternates: indexable ? { canonical: "/" } : undefined,
  robots: indexable
    ? { index: true, follow: true }
    : {
        index: false,
        follow: false,
        nocache: true,
        googleBot: { index: false, follow: false, noimageindex: true },
      },
  openGraph: {
    type: "website",
    siteName: "Genesis AI",
    url: "/",
    title: "Genesis AI | Agent Software & Custom Infrastructure",
    description:
      "Ready-to-use G-Core Mini software for agents and small teams, plus custom Genesis Infrastructure for brokerages, lenders, acquisitions teams, and complex operations.",
    images: [
      {
        url: "/images/social/og-home-1920x1080.png",
        width: 1920,
        height: 1080,
        alt: "Genesis AI — G-Core Mini software and Genesis Infrastructure custom systems",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Genesis AI | Agent Software & Custom Infrastructure",
    description:
      "Two distinct paths: ready-to-use software for agents and custom Infrastructure for complex real-estate organizations.",
    images: ["/images/social/og-home-1920x1080.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Genesis AI",
      url: siteUrl,
      logo: `${siteUrl}/brand/genesis-logo-gradient.svg`,
      email: contact.email,
      telephone: contact.phoneHref,
      founder: { "@type": "Person", name: "Reginald Benjamin" },
      sameAs: [contact.linkedin, contact.facebook],
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/#infrastructure-service`,
      name: "Genesis Infrastructure",
      serviceType: "Custom operating-system assessment, implementation, integration, and scoped managed support",
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: { "@type": "Country", name: "United States" },
      audience: {
        "@type": "Audience",
        audienceType: "Brokerages, lenders, acquisitions teams, and complex real-estate operators",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Genesis Infrastructure custom builds",
        itemListElement: infrastructureCatalog.plans.map((plan) => ({
          "@type": "Service",
          name: plan.name,
          description: `${plan.audience} ${plan.features.join("; ")}.`,
          url: `${siteUrl}/pricing#infrastructure`,
        })),
      },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link
          rel="preload"
          href="/fonts/satoshi-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/satoshi-500.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/satoshi-700.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <div className="site-runtime">
          <a
            href="#main-content"
            className="fixed top-3 left-3 z-1000 -translate-y-[150%] bg-ivory px-4 py-2.5 text-ink transition-transform duration-200 focus:translate-y-0"
          >
            Skip to content
          </a>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
