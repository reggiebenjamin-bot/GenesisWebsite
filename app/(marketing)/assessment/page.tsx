import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, graph } from "@/lib/schema";
import { AssessmentExperience } from "./AssessmentForm";

export const metadata: Metadata = pageMetadata("/assessment");

/**
 * The lower-friction way into Genesis: answer how the work moves, see where
 * the operation (or the church) appears to depend on someone remembering,
 * and decide from there whether a call is worth booking. The intro is short
 * so the first question is on the first screen, and it speaks to a church
 * once a church says so, or when the link is /assessment?for=church.
 */
export default function AssessmentPage() {
  return (
    <>
      <JsonLd data={graph(breadcrumbSchema("/assessment"))} />
      <AssessmentExperience />
    </>
  );
}
