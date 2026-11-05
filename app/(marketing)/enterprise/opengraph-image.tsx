import { ogCard, ogSize } from "@/components/seo/ogCard";
import { editionByPath } from "@/lib/editions";

const edition = editionByPath("/enterprise")!;

export const alt = edition.name;
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({
    eyebrow: edition.eyebrow,
    title: "Enterprise",
    subtitle: edition.body,
    footer: "Genesis is software",
  });
}
