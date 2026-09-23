import { genesisPositioning, offerPaths } from "@/lib/offers";
import { absoluteUrl, seoPage } from "@/lib/seo";

/*
 * A plain-text map of the site for AI assistants that look for /llms.txt.
 * Google says it does not use the file, so it is kept small and generated
 * from the same registry as the sitemap: it can never describe a page
 * differently from the page itself.
 */
export const dynamic = "force-static";

const link = (path: string) => {
  const page = seoPage(path);
  return `- [${page.label}](${absoluteUrl(page.path)}): ${page.description}`;
};

export function GET() {
  const [tools, managed] = offerPaths;

  const text = [
    "# Genesis AI",
    "",
    `> ${genesisPositioning.category}. ${genesisPositioning.summary}`,
    "",
    `Genesis offers two things. ${tools.product}: focused, self-service AI applications ("${tools.distinction}"). ${managed.product}: AI operating across the business ("${managed.distinction}").`,
    "",
    `## ${tools.product}`,
    "",
    link("/tools"),
    link("/tools/deal-architect"),
    link("/tools/deal-packager"),
    link("/tools/capital-advisor"),
    "",
    `## ${managed.product}`,
    "",
    link("/solutions"),
    link("/assessment"),
    link("/how-it-works"),
    link("/pricing"),
    "",
    "## Company",
    "",
    link("/about"),
    link("/results"),
    link("/contact"),
    "",
  ].join("\n");

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
