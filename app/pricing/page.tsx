import type { Metadata } from "next";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";
import { PricingCards } from "@/components/sections/PricingCards";
import { PageIntro, Section } from "@/components/ui/Section";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "Pricing",
  "Starting prices for Genesis AI managed systems. A consultation is required to confirm scope and fit.",
);

export default function PricingPage() {
  return (
    <>
      <PageIntro
        eyebrow="Starting pricing"
        title="Choose a starting point. Define the right scope together."
        description="Pricing reflects the level of operational complexity and ongoing support involved. Every plan begins with a consultation before work is proposed."
      />

      <Section>
        <PricingCards />
        <div className="mt-12 flex justify-between gap-8 text-[0.9rem] text-muted-dark max-md:flex-col">
          <p className="max-w-xl">
            The optional Genesis CRM layer, implementation scope, team size, and
            existing environment may affect final pricing.
          </p>
          <p>No direct purchase is required or offered on this site.</p>
        </div>
      </Section>

      <ConsultationCTA />
    </>
  );
}
