import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import "./globals.css";
import { OfferPathBootstrap } from "@/components/offers/OfferPathBootstrap";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";
import {
  DEFAULT_OFFER_PATH,
  OFFER_PATH_ATTRIBUTE,
  OFFER_PATH_STORAGE_KEY,
  offerPathByPage,
  offerPathHashAliases,
  offerPaths,
} from "@/lib/offers";
import { defaultDescription, defaultTitle } from "@/lib/defaultMeta";
import { indexable, siteUrl } from "@/lib/site";

/* Search Console and Bing Webmaster Tools ownership tags, set per deployment
   so no verification token lives in the repository. */
const verification = {
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : {}),
  ...(process.env.BING_SITE_VERIFICATION
    ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  /* The page runs edge to edge on an iPhone; .safe-area (globals.css) and the header keep
     words and buttons clear of the notch, the rounded corners and the home indicator. */
  viewportFit: "cover",
  themeColor: "#08090e",
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | Genesis AI",
  },
  description: defaultDescription,
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
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: "/images/social/og-home-1920x1080.png",
        width: 1920,
        height: 1080,
        alt: "Genesis AI. AI employees for Texas businesses.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/images/social/og-home-1920x1080.png"],
  },
  ...(Object.keys(verification).length ? { verification } : {}),
};

/*
 * Chooses the Agent / Custom Infrastructure path before first paint, so the
 * matching content is visible immediately: a path page (/tools, /solutions)
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

/* Satoshi weights used above the fold. 300 is the light hero headline
   weight; without it the H1 re-wraps when the font swaps in (layout shift).
   preload() lets React emit each hint once, where hand-written <link> tags in
   <head> were emitted twice. */
const SATOSHI_PRELOADS = [300, 400, 500, 700].map((weight) => `/fonts/satoshi-${weight}.woff2`);

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  for (const href of SATOSHI_PRELOADS) {
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      {...{ [OFFER_PATH_ATTRIBUTE]: DEFAULT_OFFER_PATH }}
      // The inline script below may change the path attribute before React hydrates.
      suppressHydrationWarning
    >
      <body>
        <OfferPathBootstrap script={offerPathScript} />
        {children}
        {/* Google Analytics 4, only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set. */}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
