import { ogCard, ogSize } from "@/components/seo/ogCard";
import { ministryEdition } from "@/lib/editions";

const edition = ministryEdition;

export const alt = edition.name;
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({
    eyebrow: `Edition ${edition.no}. ${edition.eyebrow}`,
    title: "Ministry",
    /* Shorter than the lede, so it fits the card in three lines. */
    subtitle: "A church website, Hope, and a platform where no first time guest falls through the cracks.",
    footer: "Genesis is software",
  });
}
