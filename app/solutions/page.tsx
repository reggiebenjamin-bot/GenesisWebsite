import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { GenesisSystemScale } from "@/components/sections/GenesisSystemScale";
import { ProductCockpit } from "@/components/sections/ProductCockpit";
import { Card, ClosingBand, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { TextLink } from "@/components/ui/Button";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { PageIntro, Section } from "@/components/ui/Section";
import { audiences } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, graph, managedServiceSchema } from "@/lib/schema";

export const metadata: Metadata = pageMetadata("/solutions");

export default function SolutionsPage() {
  return (
    <>
      <JsonLd data={graph(managedServiceSchema(), breadcrumbSchema("/solutions"))} />

      <PageIntro
        eyebrow="The Genesis System"
        title="One managed operating layer, not another disconnected tool."
        description="Genesis connects the professional infrastructure, business data, workflows, AI capabilities, optional CRM, and ongoing management behind the operation so the systems become more useful together."
      />

      <Section>
        <GenesisSystemScale />
      </Section>

      <Section tone="navy" aria-labelledby="product-title">
        <SectionIntro
          layout="split"
          eyebrow="The product underneath"
          title="Reusable intelligence, fitted to the operation."
          titleId="product-title"
          aside={
            <div className="grid max-w-[46ch] gap-3 text-[0.95rem] leading-relaxed text-muted-light">
              <p>
                Genesis is not a collection of one-off automations rebuilt from scratch for every
                customer.
              </p>
              <p>
                The platform carries reusable patterns for understanding signals, organizing work,
                maintaining context, surfacing next actions, and connecting operational information.
                The implementation then adapts those capabilities to the workflows and boundaries of
                the business.
              </p>
            </div>
          }
        />
        <ProductCockpit />
        <p className="mt-6 max-w-[80ch] text-[0.8rem] leading-relaxed text-muted-light">
          Illustrative product view. The information shown is an example of how connected
          operational context can be turned into a clearer next action; it is not a client
          performance claim.
        </p>
      </Section>

      <Sheet surface="paper" aria-labelledby="operators-title" className="site-section">
        <SectionIntro
          layout="split"
          eyebrow="Built around the operator"
          title="One platform. Different operational pressure."
          titleId="operators-title"
          aside={
            <p className="max-w-[44ch] text-[0.95rem] leading-relaxed text-muted-dark">
              The implementation changes with the business. The operating principle does not:
              connect the context behind the work so growth creates more capacity instead of more
              coordination.
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
              <div className="mt-3 grid gap-3 text-[0.95rem] leading-relaxed text-muted-dark">
                {audience.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Card>
          ))}
        </ul>
      </Sheet>

      <ClosingBand
        eyebrow="Find the right architecture"
        title="Show us how the work moves today."
        line="We’ll look at the workflows, systems, data, communication, and handoffs your team carries now and determine where Genesis should connect the operation first."
        actions={
          <>
            <ConsultationButton href="/contact" />
            <TextLink light href="/pricing#custom-infrastructure">
              See the Levels
            </TextLink>
          </>
        }
      />
    </>
  );
}
