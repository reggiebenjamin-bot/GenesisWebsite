import { ogCard, ogSize } from "@/components/seo/ogCard";
import { assessmentCopy } from "@/lib/assessment";

export const alt = "The free Genesis Infrastructure Assessment";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({
    eyebrow: assessmentCopy.eyebrow,
    title: "See where your operation is carrying unnecessary work.",
    subtitle: "A few questions about how leads, deals, documents and handoffs actually move.",
    footer: "Free · No purchase required",
  });
}
