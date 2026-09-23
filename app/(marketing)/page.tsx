import type { Metadata } from "next";
import { HawkHero } from "@/components/home/HawkHero";
import { AgentSections, CustomInfrastructureSections } from "@/components/home/PathSections";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { graph, organizationSchema, websiteSchema } from "@/lib/schema";

export const metadata: Metadata = pageMetadata("/");

/**
 * A homepage for each way to use Genesis. The hero is shared: the hawk stays
 * and only the title changes. Everything after it is the chosen path's own
 * layout.
 *
 * Both are server-rendered, and the toggle chooses which one shows, in place,
 * through the attribute on <html>, so neither flashes before the other.
 */
export default function Home() {
  return (
    <>
      {/* The organization record lives here and on /about; every other page
          points back to it. */}
      <JsonLd data={graph(organizationSchema(), websiteSchema())} />

      <HawkHero />

      <div data-offer-panel="agent">
        <AgentSections />
      </div>

      <div data-offer-panel="custom-infrastructure">
        <CustomInfrastructureSections />
      </div>
    </>
  );
}
