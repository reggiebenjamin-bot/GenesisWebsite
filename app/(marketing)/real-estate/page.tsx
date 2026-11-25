import type { Metadata } from "next";
import { EditionLevels } from "@/components/offers/EditionLevels";
import { EditionLanding } from "@/components/sections/EditionLanding";
import { editionByPath } from "@/lib/editions";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/real-estate");

const edition = editionByPath("/real-estate")!;

/* What Real Estate Pros does, from the edition's own Level bullets, before the prices. */
const benefits = [
  "Every buyer and seller lead captured the moment it lands, with a guided first touch and follow up.",
  "Same day lead response, so speed to lead stays on your side while you are with another client.",
  "Clean buyer and seller lanes, call scripts for every stage, and team roles and routing as you grow.",
] as const;

export default function RealEstatePage() {
  return (
    <EditionLanding edition={edition} pricingKey="real_estate" benefits={benefits}>
      <EditionLevels edition="real_estate" />
    </EditionLanding>
  );
}
