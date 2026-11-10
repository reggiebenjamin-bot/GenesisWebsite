import type { Metadata } from "next";
import { EditionLevels } from "@/components/offers/EditionLevels";
import { EditionLanding } from "@/components/sections/EditionLanding";
import { editionByPath } from "@/lib/editions";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/real-estate");

const edition = editionByPath("/real-estate")!;

export default function RealEstatePage() {
  return (
    <EditionLanding edition={edition}>
      <EditionLevels edition="real_estate" />
    </EditionLanding>
  );
}
