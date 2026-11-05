import { ogCard, ogSize } from "@/components/seo/ogCard";
import { DRAFT_BANNER } from "@/components/sections/LegalDraft";

export const alt = "Genesis terms of service draft";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({
    eyebrow: "Legal",
    title: "Terms of service",
    subtitle: DRAFT_BANNER,
    footer: "Draft for legal review",
  });
}
