import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Genesis AI",
    short_name: "Genesis AI",
    description:
      "AI infrastructure for real estate professionals: Genesis Tools for specific tasks, and Genesis Managed AI across the business.",
    start_url: "/",
    display: "standalone",
    background_color: "#08090e",
    theme_color: "#08090e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
