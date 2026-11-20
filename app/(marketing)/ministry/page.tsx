import type { Metadata } from "next";
import {
  MinistryCheckAndFaq,
  MinistryClose,
  MinistryHero,
  MinistryLevelsSection,
  MinistryLooks,
  MinistryPackage,
  MinistryPlatform,
  MinistryProcess,
  MinistryProtection,
} from "@/components/ministry/MinistrySections";
import { JsonLd } from "@/components/seo/JsonLd";
import { ministryFaq } from "@/lib/ministryPage";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, faqPageSchema, graph } from "@/lib/schema";

export const metadata: Metadata = pageMetadata("/ministry");

/**
 * Edition 05, Genesis Ministry: software for churches. The hero and its film,
 * what a church gets, the four website looks, the platform (front office,
 * back office, member app), the rules that protect people, the draft levels,
 * how it runs, the free Church Website Check, questions, and the close.
 */
export default function MinistryPage() {
  return (
    <>
      <JsonLd data={graph(breadcrumbSchema("/ministry"), faqPageSchema(ministryFaq.items, "/ministry"))} />

      <MinistryHero />
      <MinistryPackage />
      <MinistryLooks />
      <MinistryPlatform />
      <MinistryProtection />
      <MinistryLevelsSection />
      <MinistryProcess />
      <MinistryCheckAndFaq />
      <MinistryClose />
    </>
  );
}
