import type { Metadata } from "next";
import { EditionLanding } from "@/components/sections/EditionLanding";
import { Eyebrow } from "@/components/ui/Section";
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
      {/* The split header every section uses: the heading on the left, and on the right the lead
          set against the heading's top line, with the call under it at the standard button size. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
        <div>
          <Eyebrow>{aiEmployeesEnterprise.eyebrow}</Eyebrow>
          <h2 className="mt-4 max-w-[20ch] text-[clamp(2.2rem,4.4vw,3.9rem)] leading-[1.02] tracking-[-0.045em] text-balance">
            {aiEmployeesEnterprise.publicTitle}
          </h2>
        </div>
        <div className="grid content-start gap-6 lg:pt-[2.1rem]">
          <p className="max-w-[46ch] text-[1.02rem] leading-relaxed text-muted-dark">
            {aiEmployeesEnterprise.summary} More than 25 users, or more than one location, is scoped on a call, with no list price.
          </p>
          <TrackClick event="consultation_cta_clicked" from="enterprise_scope">
            <ConsultationButton href="/contact?topic=enterprise#consultation-form" className="w-full sm:w-[17rem]">
              Book a Call
            </ConsultationButton>
          </TrackClick>
        </div>
      </div>
    </EditionLanding>
  );
}
