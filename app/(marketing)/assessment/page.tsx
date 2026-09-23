import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { Sheet } from "@/components/ui/Blocks";
import { PageIntro } from "@/components/ui/Section";
import { assessmentCopy } from "@/lib/assessment";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, graph } from "@/lib/schema";
import { AssessmentForm } from "./AssessmentForm";

export const metadata: Metadata = pageMetadata("/assessment");

/**
 * The lower-friction way into Custom Infrastructure: answer how the work
 * moves, see where the operation appears to be carrying manual coordination,
 * and decide from there whether a review is worth booking.
 */
export default function AssessmentPage() {
  return (
    <>
      <JsonLd data={graph(breadcrumbSchema("/assessment"))} />

      <PageIntro
        eyebrow={assessmentCopy.eyebrow}
        title={assessmentCopy.headline}
        description={assessmentCopy.summary}
      />

      <Sheet surface="paper" rise className="site-section">
        <AssessmentForm />
      </Sheet>
    </>
  );
}
