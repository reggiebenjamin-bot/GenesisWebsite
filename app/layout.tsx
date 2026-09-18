import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { OfferPathBootstrap } from "@/components/offers/OfferPathBootstrap";
import { contact } from "@/lib/content";
import {
  DEFAULT_OFFER_PATH,
  genesisPositioning,
  genesisTools,
  managedOverview,
  managedPlans,
  OFFER_PATH_ATTRIBUTE,
  OFFER_PATH_STORAGE_KEY,
  offerPathByPage,
  offerPathHashAliases,
  offerPaths,
  toolsOverview,
} from "@/lib/offers";
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
    default: "Genesis AI | AI Infrastructure for Real Estate Professionals",
    template: "%s | Genesis AI",
  },
  description: genesisPositioning.summary,
  applicationName: "Genesis AI",
  category: "Business services",
  manifest: "/manifest.webmanifest",
  icons: {
    // The mark is gold on transparent, so every icon here is the disc version:
    // ink circle behind the gradient G, which keeps it legible on a light tab.
    // SVG first for browsers that take it, .ico as the universal fallback.
    icon: [
      { url: "/brand/genesis-icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48" },
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
    title: "Genesis AI | AI Infrastructure for Real Estate Professionals",
    description: genesisPositioning.summary,
    images: [
      {
        url: "/images/social/og-home-1920x1080.png",
        width: 1920,
        height: 1080,
        alt: "Genesis AI — AI infrastructure for real estate professionals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Genesis AI | AI Infrastructure for Real Estate Professionals",
    description:
      "Genesis Tools for specific tasks, and Genesis Managed AI across the business.",
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
      "@id": `${siteUrl}/#managed-ai`,
      name: managedOverview.product,
      description: managedOverview.summary,
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: { "@type": "Country", name: "United States" },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: `${managedOverview.product} plans`,
        itemListElement: managedPlans.map((plan) => ({
          "@type": "Offer",
          name: `${managedOverview.product} — ${plan.priceDisplay} per month`,
          description: `${plan.ladder} ${plan.scope}`,
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: plan.monthlyPriceUsd,
            priceCurrency: "USD",
            unitText: "MONTH",
          },
          url: `${siteUrl}/pricing#custom-infrastructure`,
        })),
      },
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/#genesis-tools`,
      name: toolsOverview.product,
      description: toolsOverview.summary,
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: { "@type": "Country", name: "United States" },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: toolsOverview.product,
        itemListElement: genesisTools.map((tool) => ({
          "@type": "Offer",
          name: tool.name,
          description: tool.promise,
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            minPrice: tool.price.amountUsd[0],
            maxPrice: tool.price.amountUsd[1],
            priceCurrency: "USD",
            unitText: tool.price.unit,
          },
          url: `${siteUrl}/mini#${tool.id}`,
        })),
      },
    },
  ],
};

/*
 * Chooses the Agent / Custom Infrastructure path before first paint, so the
 * matching content is visible immediately: a path page (/mini, /solutions)
 * wins, then the URL hash, then this session's earlier choice. Built from the
 * same constants the client code uses, so the two cannot drift.
 */
const offerPathScript = `(function(){try{var d=document.documentElement,v=${JSON.stringify(
  offerPaths.map((path) => path.id),
)},a=${JSON.stringify(offerPathHashAliases)},g=${JSON.stringify(
  offerPathByPage,
)},h=location.hash.slice(1),p=g[location.pathname]||(v.indexOf(h)>-1?h:a[h]);if(!p){p=sessionStorage.getItem(${JSON.stringify(
  OFFER_PATH_STORAGE_KEY,
)})}if(v.indexOf(p)>-1)d.setAttribute(${JSON.stringify(OFFER_PATH_ATTRIBUTE)},p)}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      {...{ [OFFER_PATH_ATTRIBUTE]: DEFAULT_OFFER_PATH }}
      // The inline script below may change the path attribute before React hydrates.
      suppressHydrationWarning
    >
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
        <OfferPathBootstrap script={offerPathScript} />
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
