import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Development only: the dev server blocks its own assets for requests from
   * any origin but the one it started on, so a phone opening the site by the
   * machine's address on the network gets the page without the script that
   * makes it work. These are private network addresses, and the setting has
   * no effect on a production build.
   */
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.16.*.*", "*.local"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 92],
  },
  /*
   * /classes is an App Router page in the site layout. The past class page
   * and its thank-you page are still static files in public/classes; these
   * rewrites serve each folder's index.html at its clean path.
   */
  async rewrites() {
    return [
      { source: "/classes/ai-employees", destination: "/classes/ai-employees/index.html" },
      { source: "/classes/ai-employees/thank-you", destination: "/classes/ai-employees/thank-you/index.html" },
    ];
  },
  /*
   * The Genesis Ministry demo copies (public/ministry-demo/) show made up
   * churches. Each page there also carries a robots noindex meta, and
   * robots.txt leaves the folder crawlable so both can be read (app/robots.ts).
   */
  async headers() {
    return [
      {
        source: "/ministry-demo/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    return [
      /* Public tool pages are retired. 301 tells search engines the move is permanent. */
      { source: "/mini", destination: "/pricing", statusCode: 301 },
      { source: "/mini/:path*", destination: "/pricing", statusCode: 301 },
      { source: "/tools", destination: "/pricing", statusCode: 301 },
      { source: "/tools/:path*", destination: "/pricing", statusCode: 301 },
      /* The edition pricing pages repeated the Levels already on each edition page. */
      { source: "/packs/lending/pricing", destination: "/lending#levels", statusCode: 301 },
      { source: "/packs/real_estate/pricing", destination: "/real-estate#levels", statusCode: 301 },
      /*
       * The Genesis Ministry demo is static files whose links are relative,
       * so a folder address (typed, or trimmed from a shared link) is sent to
       * the folder's index.html rather than served in place, where those links
       * would resolve one folder too high. Temporary: the demo may move.
       */
      { source: "/ministry-demo", destination: "/ministry-demo/index.html", permanent: false },
      { source: "/ministry-demo/platform", destination: "/ministry-demo/platform/index.html", permanent: false },
      {
        source: "/ministry-demo/templates/:look(bright-modern|bold-dark|classic-timeless|warm-community)",
        destination: "/ministry-demo/templates/:look/index.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
