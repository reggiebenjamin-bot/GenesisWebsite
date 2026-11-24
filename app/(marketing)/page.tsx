import type { Metadata } from "next";
import { AiEmployeesHomeSection } from "@/components/ai-employees/AiEmployeesHomeSection";
import { HawkHero } from "@/components/home/HawkHero";
import { HawkInAction } from "@/components/home/HawkInAction";
import { CustomInfrastructureSections } from "@/components/home/PathSections";
import {
  StoryClose,
  StoryHowItWorks,
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
 * The homepage tells the Genesis story beneath the Hawk hero: the problem,
 * why Genesis exists, Genesis OS and its editions, the team, how it runs,
 * Managed AI with the plans and checkout (one presentation, PlanCards), the
 * questions, and the close.
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

      <CustomInfrastructureSections />
      <StoryClose />
    </>
  );
}
