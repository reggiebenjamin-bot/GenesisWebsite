import type { Metadata } from "next";
import { GenesisSystemScale } from "@/components/sections/GenesisSystemScale";
import { ProductCockpit } from "@/components/sections/ProductCockpit";
import { Card, ClosingBand, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { TextLink } from "@/components/ui/Button";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { PageIntro, Section } from "@/components/ui/Section";
import { audiences } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "Solutions",
  "See the four connected parts of the Genesis Applied AI system: operational infrastructure, data synthesis, optional CRM, and ongoing management.",
);

export default function SolutionsPage() {
  return (
    <>
      <PageIntro
        eyebrow="The Genesis System"
        title="One managed system, not four tools bolted together."
        description="A reusable Genesis platform, fitted to the operation and kept running."
      />

      <Section>
        <GenesisSystemScale />
      </Section>

      <Section tone="navy" aria-labelledby="product-title">
        <SectionIntro
          layout="split"
          eyebrow="The product underneath"
          title="Reusable product intelligence."
          titleId="product-title"
          aside={
            <p className="max-w-[32ch] text-[0.95rem] text-muted-light">
              Not a new custom build every time.
            </p>
          }
        />
        <ProductCockpit />
      </Section>

      <Sheet surface="paper" aria-labelledby="operators-title" className="site-section">
        <SectionIntro
          layout="split"
          eyebrow="Built around the operator"
          title="One platform, different operations."
          titleId="operators-title"
          aside={
            <p className="max-w-[32ch] text-[0.95rem] text-muted-dark">
              Scope changes with the team. The operating principle does not.
            </p>
          }
        />

        <ul className="grid gap-4 md:grid-cols-2">
          {audiences.map((audience, index) => (
            <Card key={audience.title} as="li" className="flex flex-col">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[0.7rem] tracking-[0.14em] text-gold-dark">
                  0{index + 1}
                </span>
                <p className="font-display text-[0.66rem] tracking-[0.12em] text-muted-dark uppercase">
                  {audience.title}
                </p>
              </div>
              <h3 className="mt-5 text-[clamp(1.5rem,2.1vw,1.9rem)] leading-[1.06] tracking-[-0.03em]">
                {audience.outcome}
              </h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-dark">
                {audience.description}
              </p>
            </Card>
          ))}
        </ul>
      </Sheet>

      <ClosingBand
        eyebrow="Find the right architecture"
        title="See what Genesis would connect."
        line="A focused consultation about the workflows, data, and handoffs your team carries today."
        actions={
          <>
            <ConsultationButton href="/contact" />
            <TextLink light href="/pricing#custom-infrastructure">
              See the levels
            </TextLink>
          </>
        }
      />
    </>
  );
}
