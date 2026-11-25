import type { Metadata } from "next";
import { EditionLevels } from "@/components/offers/EditionLevels";
import { EditionLanding } from "@/components/sections/EditionLanding";
import { editionByPath } from "@/lib/editions";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/business");

const edition = editionByPath("/business")!;

/* What Business does, from the edition's own Level bullets, before the prices. */
const benefits = [
  "Calls answered, so the customer who rings while you are on a job still hears back.",
  "Quotes followed up, so no estimate sits waiting on someone to remember it.",
  "Appointments confirmed, with team roles and routing rules as the team grows.",
] as const;

export default function BusinessPage() {
  return (
    <EditionLanding edition={edition} pricingKey="business" benefits={benefits}>
      <EditionLevels edition="business" />
    </EditionLanding>
  );
}
