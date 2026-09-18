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
};

export default nextConfig;
