import type { Metadata } from "next";
import { EditionLevels } from "@/components/offers/EditionLevels";
import { EditionLanding } from "@/components/sections/EditionLanding";
import { editionByPath } from "@/lib/editions";
import { lendingPage } from "@/lib/lendingPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/lending");

const edition = editionByPath("/lending")!;

/**
 * Genesis Lending: the shared edition page, with the Lending page's own lede,
 * calls to action and benefit lines from lib/lendingPage.ts.
 */
export default function LendingPage() {
  return (
    <EditionLanding
      edition={edition}
      pricingKey="lending"
      lede={lendingPage.lede}
      ctas={[lendingPage.ctas.primary, lendingPage.ctas.secondary]}
      benefits={lendingPage.benefits}
    >
      <EditionLevels edition="lending" />
    </EditionLanding>
  );
}
