import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Genesis AI",
    short_name: "Genesis AI",
    description:
      "AI infrastructure for growing businesses. Genesis Managed AI connects systems, workflows, and communication.",
    start_url: "/",
    display: "standalone",
    background_color: "#08090e",
    theme_color: "#08090e",
    // The gold G on the ink disc, from the Genesis brand kit. The PNGs are the
    // kit's disc renders; the SVG is the same disc for any other size.
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/genesis-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
