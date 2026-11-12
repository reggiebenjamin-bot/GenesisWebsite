import type { Metadata } from "next";
import { AiEmployeesHomeSection } from "@/components/ai-employees/AiEmployeesHomeSection";
import { HawkHero } from "@/components/home/HawkHero";
import { HawkInAction } from "@/components/home/HawkInAction";
import { AgentSections, CustomInfrastructureSections } from "@/components/home/PathSections";
import {
  StoryClose,
  StoryHowItWorks,
  StoryOffers,
  StoryOpening,
  StoryTeamDay,
} from "@/components/home/story/StorySections";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqs } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { faqPageSchema, genesisSoftwareSchema, graph, organizationSchema, websiteSchema } from "@/lib/schema";

const homeFaqs = [
  ...new Map(
    faqs
      .filter((faq) => faq.paths.includes("agent") || faq.paths.includes("custom-infrastructure"))
      .map((faq) => [faq.question, faq] as const),
  ).values(),
];

export const metadata: Metadata = pageMetadata("/");

/**
 * The homepage tells the Genesis story beneath the unchanged Hawk hero:
 * the problem, why Genesis exists, Genesis OS and its editions, the team,
 * how it runs, the plans, then each path's existing sections and the close.
 */
export default function Home() {
  return (
    <>
      <JsonLd
        data={graph(
          organizationSchema(),
          websiteSchema(),
          genesisSoftwareSchema(),
          faqPageSchema(homeFaqs, "/"),
        )}
      />

      <HawkHero />

      <HawkInAction />

      <StoryOpening />
      <AiEmployeesHomeSection />
      <StoryTeamDay />
      <StoryHowItWorks />
      <StoryOffers />

      <div data-offer-panel="agent">
        <AgentSections />
      </div>

      <div data-offer-panel="custom-infrastructure">
        <CustomInfrastructureSections />
      </div>

      {/* The custom-infrastructure path keeps its own closing band. */}
      <div data-offer-panel="agent">
        <StoryClose />
      </div>
    </>
  );
}
