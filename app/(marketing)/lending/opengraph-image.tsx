import { ogCard, ogSize } from "@/components/seo/ogCard";
import { editionByPath } from "@/lib/editions";

const edition = editionByPath("/lending")!;

export const alt = edition.name;
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({
    eyebrow: edition.eyebrow,
    title: "Lending",
    subtitle: edition.body,
    footer: "Genesis is software",
  });
}
