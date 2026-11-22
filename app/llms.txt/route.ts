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
  const home = seoPage("/");
  const managed = seoPage("/solutions");

  const text = [
    "# Genesis AI",
    "",
    `> ${home.description}`,
    "",
    `${managed.label} connects systems, data, workflows, communication, and AI across the business. Plans are listed on the pricing page.`,
    "",
    `## ${managed.label}`,
    "",
    link("/solutions"),
    link("/assessment"),
    link("/how-it-works"),
    link("/pricing"),
    "",
    "## AI Employees",
    "",
    link("/ai-employees"),
    "",
    "## Editions",
    "",
    link("/business"),
    link("/real-estate"),
    link("/lending"),
    "",
    "## Consults",
    "",
    link("/capital-desk"),
    link("/leadscout"),
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
