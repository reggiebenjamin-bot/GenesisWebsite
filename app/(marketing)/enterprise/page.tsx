import type { Metadata } from "next";
import { EditionLanding } from "@/components/sections/EditionLanding";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { Eyebrow } from "@/components/ui/Section";
import { aiEmployeesEnterprise } from "@/lib/aiEmployees";
import { editionByPath } from "@/lib/editions";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/enterprise");

const edition = editionByPath("/enterprise")!;

export default function EnterprisePage() {
  return (
    <EditionLanding edition={edition}>
      <div className="mx-auto max-w-[40rem] text-center">
        <Eyebrow>{aiEmployeesEnterprise.eyebrow}</Eyebrow>
        <h2 className="mt-4 font-light text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-[-0.04em] text-balance">
          {aiEmployeesEnterprise.publicTitle}
        </h2>
        <p className="mx-auto mt-5 max-w-[46ch] text-[1.02rem] leading-relaxed text-muted-dark">
          {aiEmployeesEnterprise.summary}
        </p>
        <div className="mt-9 flex justify-center">
          <ConsultationButton href="/contact#consultation-form">Book a Call</ConsultationButton>
        </div>
      </div>
    </EditionLanding>
  );
}
