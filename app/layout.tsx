import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { contact, faqs, pricingPlans } from "@/lib/content";
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
    default: "Genesis AI | Managed Applied AI Systems for Deal Operations",
    template: "%s | Genesis AI",
  },
  description:
    "Genesis delivers a managed Applied AI system for real estate, lending, and property-driven teams, powered by reusable platform technology and operated on an ongoing basis.",
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
    title: "Genesis AI | Managed Applied AI Systems for Deal Operations",
    description:
      "Connect data, documents, follow-up, and handoffs in one managed Applied AI system for deal operations.",
    images: [
      {
        url: "/images/social/og-home-1920x1080.png",
        width: 1920,
        height: 1080,
        alt: "Genesis AI — managed Applied AI systems for deal operations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Genesis AI | Managed Applied AI Systems for Deal Operations",
    description:
      "A reusable Applied AI platform, delivered as a fully managed system.",
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
      "@id": `${siteUrl}/#service`,
      name: "Genesis Managed Applied AI System",
      serviceType: "Applied AI platform implementation and managed service",
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: { "@type": "Country", name: "United States" },
      audience: {
        "@type": "Audience",
        audienceType: "Real estate, lending, and property-driven owner-operators",
      },
      offers: pricingPlans.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        description: `${plan.price}${plan.cadence}`,
        priceCurrency: "USD",
        url: `${siteUrl}/pricing`,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
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
