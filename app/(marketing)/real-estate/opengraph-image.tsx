import { ogCard, ogSize } from "@/components/seo/ogCard";
import { editionByPath } from "@/lib/editions";

const edition = editionByPath("/real-estate")!;

export const alt = edition.name;
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({
    eyebrow: edition.eyebrow,
    title: "Real Estate Pros",
    subtitle: edition.body,
    footer: "Genesis is software",
  });
}
