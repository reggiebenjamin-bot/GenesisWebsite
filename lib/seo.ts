import { genesisPositioning, genesisTools, managedPlans, type ToolId } from "./offers.ts";
import { siteUrl } from "./site.ts";

/*
 * The one list of pages search engines should know about. The sitemap, every
 * canonical, the breadcrumbs, the social previews and the SEO checks are all
 * built from it, so a page cannot be in the sitemap without a canonical, or
 * carry a title that disagrees with its preview.
 *
 * Only public marketing pages belong here. Anything private, session-specific
 * or unfinished stays out, and stays out of the sitemap.
 */

export type SeoImage = { url: string; alt: string; width: number; height: number };

export type SeoPage = {
  /** The canonical path. */
  path: string;
  /**
   * The <title>, before the " | Genesis AI" suffix the layout adds. `absolute`
   * titles are used as written, for pages whose title already names Genesis.
   */
  title: string | { absolute: string };
  description: string;
  /** The page's name in a breadcrumb trail. */
  label: string;
  /** The page above this one; the homepage when omitted. */
  parent?: string;
  /** A fixed social preview, or null when the route draws its own. */
  image: SeoImage | null;
  /** The last meaningful change to the page's content — not the build date. */
  lastModified: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
};

const REBUILD = "2026-09-17";
/* The tools pages, the tools overview and About changed again with the SEO pass. */
const SEO_PASS = "2026-09-22";

const socialImage = (name: string, alt: string): SeoImage => ({
  url: `/images/social/og-${name}-1920x1080.png`,
  alt,
  width: 1920,
  height: 1080,
});

const toolPrices = genesisTools
  .map((tool) => `${tool.name} ${tool.price.display} per ${tool.price.unit}`)
  .join(", ");
const planPrices = managedPlans.map((plan) => plan.priceDisplay).join(", ");

function toolPricePhrase(id: ToolId): string {
  const tool = genesisTools.find((candidate) => candidate.id === id);
  if (!tool) throw new Error(`No Genesis Tool price for ${id}`);
  return `${tool.price.display} per ${tool.price.unit}`;
}

/** Per-tool search copy: the job each tool owns, in the words people search with. */
export const toolSeo: Readonly<Record<ToolId, { title: string; description: string }>> = {
  "deal-architect": {
    title: "Deal Architect: Real Estate Deal Analysis",
    description:
      `Evaluate a real estate opportunity with deterministic calculations, risk flags, missing-information review, and next questions. ${toolPricePhrase("deal-architect")}.`,
  },
  "deal-packager": {
    title: "Deal Packager: Real Estate Deal Packages",
    description:
      `Turn real estate deal facts, evidence, numbers, and strategy into a professional package for the audience you choose. ${toolPricePhrase("deal-packager")}.`,
  },
  "capital-advisor": {
    title: "Capital Advisor: Real Estate Capital Plans",
    description:
      `Review user-provided financing assumptions and capital readiness, then prepare a clear real estate capital request. ${toolPricePhrase("capital-advisor")}.`,
  },
};

export const seoPages: readonly SeoPage[] = [
  {
    path: "/",
    title: { absolute: `Genesis AI | ${genesisPositioning.category}` },
    description: genesisPositioning.summary,
    label: "Home",
    image: socialImage("home", "Genesis AI — AI infrastructure for real estate professionals"),
    lastModified: SEO_PASS,
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/tools",
    title: "Genesis Tools: Focused AI Tools for Real Estate",
    description:
      "Deal Architect, Deal Packager, and Capital Advisor help real estate professionals evaluate, present, and finance a deal with one-time pricing.",
    label: "Genesis Tools",
    image: null,
    lastModified: SEO_PASS,
    changeFrequency: "monthly",
    priority: 0.9,
  },
  ...genesisTools.map(
    (tool): SeoPage => ({
      path: `/tools/${tool.id}`,
      title: toolSeo[tool.id].title,
      description: toolSeo[tool.id].description,
      label: tool.name,
      parent: "/tools",
      image: null,
      lastModified: SEO_PASS,
      changeFrequency: "monthly",
      priority: 0.9,
    }),
  ),
  {
    path: "/solutions",
    title: "Managed AI Infrastructure for Real Estate",
    description:
      "Genesis Managed AI connects systems, data, workflows, communication, CRM, AI agents and automation into managed AI infrastructure for real estate businesses.",
    label: "Genesis Managed AI",
    image: socialImage("solutions", "Genesis Managed AI — managed AI infrastructure for real estate businesses"),
    lastModified: REBUILD,
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/assessment",
    title: "Business AI Assessment",
    description:
      "Assess where disconnected systems, manual coordination, and workflow gaps are creating operational drag in your real estate business.",
    label: "Business Assessment",
    parent: "/solutions",
    image: null,
    lastModified: SEO_PASS,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/pricing",
    title: "Pricing: Genesis Tools and Managed AI Plans",
    description: `${toolPrices}. Genesis Managed AI plans at ${planPrices} per month.`,
    label: "Pricing",
    image: socialImage("pricing", "Genesis AI pricing — Genesis Tools and Genesis Managed AI plans"),
    lastModified: SEO_PASS,
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/how-it-works",
    title: "How a Managed AI Engagement Works",
    description:
      "From a no-cost consultation to a managed platform: what Genesis reviews, scopes, builds, launches and keeps running during a Genesis Managed AI engagement.",
    label: "How It Works",
    image: socialImage("how-it-works", "How a Genesis Managed AI engagement works, from consultation to managed platform"),
    lastModified: REBUILD,
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/results",
    title: "Results and the Genesis Proof Standard",
    description:
      "What Genesis can verify today, and the evidence required before any client result is published: a baseline, a defined change, source records and permission.",
    label: "Results",
    image: socialImage("results", "Genesis AI results — the standard for verified operating proof"),
    lastModified: REBUILD,
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    path: "/about",
    title: { absolute: "About Genesis AI: AI Infrastructure for Real Estate" },
    description:
      "Genesis AI builds AI infrastructure for real estate professionals: self-service Genesis Tools for specific tasks, and consultation-led Genesis Managed AI.",
    label: "About",
    image: socialImage("about", "About Genesis AI — the team and principles behind Genesis"),
    lastModified: SEO_PASS,
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/contact",
    title: { absolute: "Contact Genesis AI: Book a Consultation" },
    description:
      "Book a no-cost Genesis consultation to review your current systems, the manual work creating the most drag, and the right scope and next step.",
    label: "Contact",
    image: socialImage("contact", "Contact Genesis AI — book a consultation for your operation"),
    lastModified: REBUILD,
    changeFrequency: "yearly",
    priority: 0.6,
  },
];

export function seoPage(path: string): SeoPage {
  const page = seoPages.find((candidate) => candidate.path === path);
  if (!page) throw new Error(`No SEO entry for ${path}. Add it to lib/seo.ts.`);
  return page;
}

/** An absolute URL on the canonical origin. */
export function absoluteUrl(path: string): string {
  return path === "/" ? siteUrl : `${siteUrl}${path}`;
}

/** The page's full <title> text, as it renders. */
export function fullTitle(page: SeoPage): string {
  return typeof page.title === "string" ? `${page.title} | Genesis AI` : page.title.absolute;
}

/** Home, then each parent, then the page itself. */
export function breadcrumbTrail(path: string): SeoPage[] {
  const trail: SeoPage[] = [];
  let current: SeoPage | undefined = seoPage(path);
  while (current) {
    trail.unshift(current);
    if (current.path === "/") break;
    current = seoPage(current.parent ?? "/");
  }
  return trail;
}
