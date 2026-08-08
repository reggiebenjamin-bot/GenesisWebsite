import type { Metadata } from "next";
import { PricingCards } from "@/components/PricingCards";
import { ConsultationCTA, PageIntro } from "@/components/Shared";
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
      <section className="section section-ivory">
        <div className="shell">
          <PricingCards />
          <div className="pricing-note">
            <p>
              The optional Genesis CRM layer, implementation scope, team size, and
              existing environment may affect final pricing.
            </p>
            <p>No direct purchase is required or offered on this site.</p>
          </div>
        </div>
      </section>
      <ConsultationCTA />
    </>
  );
}
