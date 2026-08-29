import type { Metadata } from "next";
import { MiniPricingCards } from "@/components/sections/MiniPricingCards";
import { PricingCards } from "@/components/sections/PricingCards";
import { PricingPathSwitcher } from "@/components/sections/PricingPathSwitcher";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow, Section } from "@/components/ui/Section";
import { pageMetadata } from "@/lib/metadata";
import { getMiniCatalogDisplayMode } from "@/lib/products";

export const metadata: Metadata = pageMetadata(
  "Pricing",
  "Compare ready-to-use G-Core Mini software for agents with custom Genesis Infrastructure for brokerages, lenders, acquisitions teams, and complex operations.",
);

const infrastructurePricingFaqs = [
  {
    question: "What do the custom-build starting prices cover?",
    answer:
      "Foundation and Growth show the minimum starting point for a one-time implementation. A written proposal confirms the systems, workflows, integrations, launch responsibilities, and any ongoing support included in the engagement.",
  },
  {
    question: "What changes the final custom-build scope?",
    answer:
      "The current environment, workflow complexity, data quality, number of systems and teams, integration depth, governance requirements, adoption work, and post-launch support can all affect the final scope.",
  },
  {
    question: "Where do Discovery and a Pilot fit?",
    answer:
      "After the consultation, Genesis may recommend paid Discovery to map a complex operation or an optional Pilot to validate one workflow before a wider build. They are scoping tools, not additional public pricing tiers.",
  },
  {
    question: "Is ongoing management included forever?",
    answer:
      "No. Foundation and Growth show one-time implementation starting prices. If monitoring, support, maintenance, or workflow refinement is needed after launch, that responsibility and fee are stated separately in the proposal.",
  },
] as const;

export default function PricingPage() {
  const miniCatalogMode = getMiniCatalogDisplayMode();
  const miniPricingFaq =
    miniCatalogMode === "hold"
      ? {
          question: "Why are Agent Dashboard prices not shown?",
          answer:
            "The G-Core Mini subscription model is still in commercial review. Genesis has not approved its prices, limits, or legal terms for public release, and this website does not yet provide signup, billing, or product access.",
        }
      : miniCatalogMode === "review"
        ? {
            question: "Why are the Agent Dashboard prices marked provisional?",
            answer:
              "The $20, $100, and $200 structure is shown for review. Genesis still needs to approve product scope, usage limits, support requirements, unit economics, and legal language before these plans can become a production offer.",
          }
        : {
            question: "What does an Agent Dashboard subscription include?",
            answer:
              "Each G-Core Mini plan provides standardized software access within its published features and usage limits. Custom implementation and Genesis Infrastructure services are separate engagements.",
          };
  const pricingFaqs = [miniPricingFaq, ...infrastructurePricingFaqs];

  const miniPanel = (
    <div id="mini">
      <div className="mb-6 max-w-2xl">
        <Eyebrow>G-Core Mini</Eyebrow>
        <h2 className="mt-3 text-[clamp(2rem,4vw,3.1rem)]">
          Ready-to-use software for agents.
        </h2>
        <p className="mt-2 text-[0.95rem] text-muted-dark">
          Monthly plans for independent agents and small teams—without a custom implementation.
        </p>
      </div>
      <MiniPricingCards mode={miniCatalogMode} />
    </div>
  );

  const infrastructurePanel = (
    <div id="infrastructure">
      <div className="mb-6 max-w-2xl">
        <Eyebrow>Genesis Infrastructure</Eyebrow>
        <h2 className="mt-3 text-[clamp(2rem,4vw,3.1rem)]">
          Infrastructure built around the business.
        </h2>
        <p className="mt-2 text-[0.95rem] text-muted-dark">
          For brokerages, lenders, acquisitions teams, and complex real-estate operations.
        </p>
      </div>
      <PricingCards condensed featuredLabel="Common starting point" />
      <p className="mt-5 text-[0.82rem] text-muted-dark">
        Final scope depends on the systems, workflows, integrations, and rollout involved.
      </p>
    </div>
  );

  return (
    <>
      <section className="border-b border-line-light bg-paper pt-[calc(var(--header-height)+42px)] pb-[42px] text-ink md:pt-[calc(var(--header-height)+52px)] md:pb-[48px]">
        <div className="shell max-w-[960px]">
          <Eyebrow>Pricing</Eyebrow>
          <h1 className="mt-5 text-[clamp(2.55rem,5.4vw,4.8rem)]">
            Agent software or custom infrastructure.
          </h1>
          <p className="mt-5 max-w-3xl text-[1.02rem] text-muted-dark md:text-[1.08rem]">
            G-Core Mini is ready-to-use software for agents and small teams.
            Genesis Infrastructure is designed and implemented for brokerages,
            lenders, acquisitions teams, and complex operations.
          </p>
        </div>
      </section>

      <Section className="!py-[clamp(52px,7vw,92px)]">
        <PricingPathSwitcher
          mini={miniPanel}
          infrastructure={infrastructurePanel}
        />
      </Section>

      <Section className="border-t border-line-light bg-paper !py-[clamp(68px,8vw,108px)]">
        <Reveal>
          <div className="mb-9 max-w-3xl">
            <Eyebrow>Pricing FAQ</Eyebrow>
            <h2 className="mt-4 text-[clamp(2rem,4vw,3.5rem)]">
              Pricing questions.
            </h2>
          </div>
        </Reveal>
        <div className="mx-auto max-w-4xl">
          {pricingFaqs.map((faq, index) => (
            <Reveal key={faq.question} delay={index * 0.035}>
              <details className="group border-t border-line-light last:border-b">
                <summary className="flex cursor-pointer list-none justify-between gap-6 py-6 text-[clamp(1rem,1.5vw,1.2rem)] font-medium [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span
                    aria-hidden="true"
                    className="text-[1.35rem] font-light text-gold-dark transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pr-12 pb-6 text-muted-dark">{faq.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
