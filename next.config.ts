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
   * Live class sales page and thank-you page are static files in
   * public/classes. These rewrites serve each folder's index.html at its
   * clean path. Scoped to the class paths only.
   */
  async rewrites() {
    return [
      { source: "/classes", destination: "/classes/index.html" },
      { source: "/classes/ai-employees", destination: "/classes/ai-employees/index.html" },
      { source: "/classes/ai-employees/thank-you", destination: "/classes/ai-employees/thank-you/index.html" },
    ];
  },
  async redirects() {
    return [
      /* Public tool pages are retired. 301 tells search engines the move is permanent. */
      { source: "/mini", destination: "/pricing", statusCode: 301 },
      { source: "/mini/:path*", destination: "/pricing", statusCode: 301 },
      { source: "/tools", destination: "/pricing", statusCode: 301 },
      { source: "/tools/:path*", destination: "/pricing", statusCode: 301 },
    ];
  },
};

export default nextConfig;
