import type { Metadata } from "next";
import { HawkHero } from "@/components/home/HawkHero";
import { HawkInAction } from "@/components/home/HawkInAction";
import { HomeFaq } from "@/components/home/HomeFaq";
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
 * The homepage tells the Genesis story beneath the Hawk hero, in numbered
 * chapters: the problem, why Genesis exists, Genesis OS and its editions, the
 * team, how it runs, the plans (the one place the homepage prices them), the
 * questions, and the close. Every deeper page (pricing, each edition, how it
 * works) is one link away, so the homepage does not repeat them.
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
      <StoryTeamDay />
      <StoryHowItWorks />
      <StoryOffers />

      <HomeFaq path="custom-infrastructure" eyebrow="Chapter seven. Questions" rise />
      <StoryClose />
    </>
  );
}
