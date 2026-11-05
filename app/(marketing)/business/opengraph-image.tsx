import { ogCard, ogSize } from "@/components/seo/ogCard";
import { editionByPath } from "@/lib/editions";

const edition = editionByPath("/business")!;

export const alt = edition.name;
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({
    eyebrow: edition.eyebrow,
    title: "Business",
    subtitle: edition.body,
    footer: "Genesis is software",
  });
}
