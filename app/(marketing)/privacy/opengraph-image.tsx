import { ogCard, ogSize } from "@/components/seo/ogCard";

export const alt = "Genesis privacy policy";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({
    eyebrow: "Legal",
    title: "Privacy policy",
    subtitle: "What the Genesis software collects, and how to reach us.",
    footer: "Genesis is software",
  });
}
