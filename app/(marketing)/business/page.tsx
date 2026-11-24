import type { Metadata } from "next";
import { EditionLevels } from "@/components/offers/EditionLevels";
import { EditionLanding } from "@/components/sections/EditionLanding";
import { editionByPath } from "@/lib/editions";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/business");

const edition = editionByPath("/business")!;

export default function BusinessPage() {
  return (
    <EditionLanding edition={edition} pricingKey="business">
      <EditionLevels edition="business" />
    </EditionLanding>
  );
}
