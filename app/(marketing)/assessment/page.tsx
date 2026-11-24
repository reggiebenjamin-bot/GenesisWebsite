import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { CHURCH_PERSONA, personaFromParams } from "@/lib/assessment";
import { pageMetadata, withVariant } from "@/lib/metadata";
import { ministryMeta } from "@/lib/ministryPage";
import { breadcrumbSchema, graph } from "@/lib/schema";
import { AssessmentExperience } from "./AssessmentForm";

/* /assessment?for=church names the church assessment in the tab and in a shared link's preview;
   the canonical stays /assessment. */
export async function generateMetadata({ searchParams }: PageProps<"/assessment">): Promise<Metadata> {
  const base = pageMetadata("/assessment");
  return personaFromParams(await searchParams) === CHURCH_PERSONA ? withVariant(base, ministryMeta.assessment) : base;
}

/**
 * The lower-friction way into Genesis: answer how the work moves, see where
 * the operation (or the church) appears to depend on someone remembering,
 * and decide from there whether a call is worth booking. The intro is short
 * so the first question is on the first screen. A link that says who is
 * answering (?for=church, ?persona=lending, real-estate or business) is read
 * here, on the server, so the first render is already on that path.
 */
export default async function AssessmentPage({ searchParams }: PageProps<"/assessment">) {
  const initialPersona = personaFromParams(await searchParams);
  return (
    <>
      <JsonLd data={graph(breadcrumbSchema("/assessment"))} />
      <AssessmentExperience initialPersona={initialPersona} />
    </>
  );
}
