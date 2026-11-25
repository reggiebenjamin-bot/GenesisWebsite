import Script from "next/script";
import { GaPageViews } from "@/components/seo/GaPageViews";
import { gaMeasurementId } from "@/lib/analytics";

/**
 * Google Analytics 4, loaded only when NEXT_PUBLIC_GA_MEASUREMENT_ID holds a
 * measurement ID (G- followed by letters and digits). With no ID, or one that
 * is not shaped like a GA4 ID, nothing is loaded and `track` stays a no-op.
 * The script waits until the page is interactive, so it never holds up the
 * first paint. GaPageViews configures it and reports each page without its
 * query string.
 */
export function GoogleAnalytics() {
  const id = gaMeasurementId();
  if (!id) return null;
  return (
    <>
      <GaPageViews id={id} />
      <Script id="ga4-loader" src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
    </>
  );
}
