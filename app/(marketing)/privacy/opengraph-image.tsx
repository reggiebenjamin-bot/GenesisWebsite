import { ogCard, ogSize } from "@/components/seo/ogCard";
import { DRAFT_BANNER } from "@/components/sections/LegalDraft";

export const alt = "Genesis privacy policy draft";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({
    eyebrow: "Legal",
    title: "Privacy policy",
    subtitle: DRAFT_BANNER,
    footer: "Draft for legal review",
  });
}
