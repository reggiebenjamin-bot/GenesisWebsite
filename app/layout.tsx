import type { Metadata, Viewport } from "next";
import "@fontsource-variable/orbitron";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { GlobalLogoIntro } from "@/components/layout/GlobalLogoIntro";
import { Header } from "@/components/layout/Header";
import { contact, faqs, pricingPlans } from "@/lib/content";

const indexable = process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://genesis-ai-preview.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08090e",
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Genesis AI | Managed Systems for Real Estate Operators",
    template: "%s | Genesis AI",
  },
  description:
    "Genesis AI provisions and manages the complete technology foundation beneath a real-estate operation: Microsoft 365, practical AI workflows, optional CRM, integrations, and ongoing support.",
  applicationName: "Genesis AI",
  category: "Business services",
  alternates: indexable ? { canonical: "/" } : undefined,
  robots: indexable
    ? { index: true, follow: true }
    : {
        index: false,
        follow: false,
        nocache: true,
        googleBot: { index: false, follow: false, noimageindex: true },
      },
  icons: {
    icon: "/brand/genesis-logo-gradient.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Genesis AI",
    title: "Genesis AI | Managed Systems for Real Estate Operators",
    description:
      "Work faster and close more deals with a professional foundation, practical AI workflows, and ongoing management.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Genesis AI — managed systems for real-estate operators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Genesis AI | Managed Systems for Real Estate Operators",
    description:
      "Work faster and close more deals with practical, fully managed systems.",
    images: ["/og.png"],
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
      name: "Managed AI Infrastructure for Real Estate Professionals",
      serviceType: "Managed AI and IT infrastructure",
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: { "@type": "Country", name: "United States" },
      audience: {
        "@type": "Audience",
        audienceType: "Real estate agents, teams, brokerages, and investors",
      },
      offers: pricingPlans.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        price: plan.monthlyPrice.replace(/[$,]/g, ""),
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
      <body>
        <GlobalLogoIntro />
        <a
          href="#main-content"
          className="fixed top-3 left-3 z-1000 -translate-y-[150%] bg-ivory px-4 py-2.5 text-ink transition-transform duration-200 focus:translate-y-0"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
