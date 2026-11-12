import { ogCard, ogSize } from "@/components/seo/ogCard";
import { texasLanding } from "@/lib/texasPages";

const page = texasLanding("/texas/plumbing");

export const alt = page.title;
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({
    eyebrow: page.eyebrow,
    title: page.label,
    subtitle: page.lede,
    footer: "Genesis is software",
  });
}
