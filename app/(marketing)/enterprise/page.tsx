import type { Metadata } from "next";
import { EditionLanding } from "@/components/sections/EditionLanding";
import { SectionIntro } from "@/components/ui/Blocks";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { TrackClick } from "@/components/ui/TrackClick";
import { aiEmployeesEnterprise } from "@/lib/aiEmployees";
import { editionByPath } from "@/lib/editions";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/enterprise");

const edition = editionByPath("/enterprise")!;

/* What Enterprise does, in the words the edition card and its points already use. */
const benefits = [
  "Your systems connected across every location, so work keeps moving at each handoff.",
  "Custom workflows and access controls set up for how your operation runs.",
  "A managed build that Genesis keeps running every month, with AI employees working inside it.",
] as const;

export default function EnterprisePage() {
  return (
    <EditionLanding edition={edition} benefits={benefits}>
      {/* The standard section opening, left aligned like every other section on the page. */}
      <SectionIntro
        layout="split"
        eyebrow={aiEmployeesEnterprise.eyebrow}
        title={aiEmployeesEnterprise.publicTitle}
        className="mb-0"
        aside={
          <div className="grid gap-5">
            <p className="max-w-[44ch] text-[0.95rem] leading-relaxed text-muted-dark">
              {aiEmployeesEnterprise.summary} More than 25 users, or more than one location, is scoped on a call, with no list price.
            </p>
            <TrackClick event="consultation_cta_clicked" from="enterprise_scope">
              <ConsultationButton href="/contact?topic=enterprise#consultation-form" className="max-sm:w-full sm:w-fit">
                Book a Call
              </ConsultationButton>
            </TrackClick>
          </div>
        }
      />
    </EditionLanding>
  );
}
