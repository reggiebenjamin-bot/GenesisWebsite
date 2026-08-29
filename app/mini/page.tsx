import type { Metadata } from "next";
import { MiniPricingCards } from "@/components/sections/MiniPricingCards";
import { Button, TextLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow, PageIntro, Section, SectionHeading } from "@/components/ui/Section";
import { contact } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { getMiniCatalogDisplayMode } from "@/lib/products";

export const metadata: Metadata = pageMetadata(
  "G-Core Mini",
  "Review G-Core Mini, a standardized revenue workspace being prepared for independent real-estate agents and small teams.",
);

const workspaceAreas = [
  {
    number: "01",
    title: "Today",
    description:
      "See due work and the next revenue-moving action without rebuilding the list by hand.",
  },
  {
    number: "02",
    title: "Leads",
    description:
      "Keep the next follow-up, recent activity, and ownership of the relationship in one usable record.",
  },
  {
    number: "03",
    title: "Deals",
    description:
      "Track active opportunities, what changed, and what needs to happen next.",
  },
] as const;

const notIncluded = [
  "Brokerage membership, sponsorship, supervision, or recruiting",
  "Custom workflows or custom integrations included in the subscription",
  "Unlimited AI, calling, email, SMS, enrichment, or paid data",
  "Legal, tax, financial, appraisal, or brokerage advice",
  "Unconfirmed autonomous actions on a customer’s behalf",
] as const;

export default function MiniPage() {
  const catalogMode = getMiniCatalogDisplayMode();
  const interestHref = `mailto:${contact.email}?subject=${encodeURIComponent(
    "G-Core Mini beta interest",
  )}`;

  return (
    <>
      <PageIntro
        eyebrow="G-Core Mini"
        title="Know what needs attention. Take the next revenue-moving action. Record what happened."
        description="Ready-to-use subscription software for independent real-estate agents and small teams. No custom implementation is required."
      />

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="A focused operating loop"
            title="The day starts with the work that needs to move."
            description="Mini is designed around a narrow daily workflow: identify the due action, complete it with human confirmation, and leave the record ready for what comes next."
          />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {workspaceAreas.map((area, index) => (
            <Reveal
              key={area.number}
              delay={index * 0.06}
              className="min-h-[260px] rounded-lg border border-line-light bg-paper p-[clamp(28px,4vw,44px)]"
            >
              <span className="font-display text-[0.68rem] tracking-[0.14em] text-gold-dark">
                {area.number}
              </span>
              <h2 className="mt-12 text-[clamp(2rem,3vw,3rem)]">{area.title}</h2>
              <p className="mt-5 text-muted-dark">{area.description}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-paper">
        <Reveal>
          <SectionHeading
            eyebrow="Commercial preview"
            title="A proposed subscription model, held behind an explicit publication gate."
            description="The prices and limits below are visible in local or approved review mode only. They remain provisional until customer evidence, unit economics, product scope, and legal language are approved."
          />
        </Reveal>
        <MiniPricingCards mode={catalogMode} />
      </Section>

      <Section className="bg-paper">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <Reveal>
            <Eyebrow>The product boundary</Eyebrow>
            <h2 className="mt-5 text-[clamp(2.4rem,5vw,5rem)]">
              Software access, not a custom Infrastructure engagement.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-[1.08rem] leading-relaxed">
              When released, Mini will provide a bounded product with
              standardized features and server-enforced plan limits. It will
              not include assessment, customer-specific implementation,
              governance, or ongoing operational ownership.
            </p>
            <div className="mt-8 border-t border-line-light pt-7">
              <h3>When the operation needs a custom build</h3>
              <p className="mt-3 text-muted-dark">
                Brokerages, lenders, acquisitions teams, and complex operators
                should review Genesis Infrastructure instead.
              </p>
              <TextLink href="/pricing#infrastructure" className="mt-7">
                Review custom-build pricing
              </TextLink>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <Reveal>
            <Eyebrow>Clear exclusions</Eyebrow>
            <h2 className="mt-5 text-[clamp(2.2rem,4vw,4rem)]">
              Mini has a deliberate edge.
            </h2>
            <p className="mt-6 max-w-xl text-muted-dark">
              These boundaries keep the software understandable, supportable,
              and separate from customer-specific Infrastructure engagements.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <ul className="grid gap-0 border-y border-line-light">
              {notIncluded.map((item) => (
                <li
                  key={item}
                  className="grid grid-cols-[10px_minmax(0,1fr)] gap-4 border-b border-line-light py-5 last:border-b-0"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.62rem] h-1.5 w-1.5 rounded-full bg-gold"
                  />
                  <span className="text-muted-dark">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <section className="border-t border-line-dark bg-ink py-[clamp(90px,10vw,150px)] text-ivory">
        <div className="shell grid items-end gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-24">
          <div>
            <Eyebrow>Mini is not open for purchase</Eyebrow>
            <h2 className="mt-5 text-[clamp(2.4rem,5vw,5rem)]">
              Ask about the product review without entering an Infrastructure sales flow.
            </h2>
          </div>
          <div>
            <p className="text-muted-light">
              This email does not create an account, start a trial, reserve a
              price, or grant product access.
            </p>
            <Button href={interestHref} variant="secondary" className="mt-8">
              Ask about the Mini beta
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
