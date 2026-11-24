import { aiEmployeesHero } from "./aiEmployees.ts";
import { defaultDescription, defaultTitle } from "./defaultMeta.ts";
import { genesisTools, managedPlans, type ToolId } from "./offers.ts";
import { blogPosts } from "./blog.ts";
import { siteUrl } from "./site.ts";
import { texasLandings } from "./texasPages.ts";
import { texasServiceLandings } from "./texasServicePages.ts";

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
    title: { absolute: defaultTitle },
    description: defaultDescription,
    label: "Home",
    image: socialImage("home", "Genesis AI — AI infrastructure for growing businesses"),
    lastModified: "2026-11-15",
    changeFrequency: "weekly",
    priority: 1,
  },
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
    title: "Free Business Assessment",
    description:
      "Free assessment for service businesses, lenders and real estate teams: see where calls, follow up and handoffs still depend on someone remembering. No account needed.",
    label: "Free Assessment",
    parent: "/solutions",
    image: null,
    lastModified: SEO_PASS,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/pricing",
    title: "Pricing: Managed AI Plans",
    /* Business Levels first, then the church plans, which have their own page. */
    description: `Genesis plans for service businesses, lenders and real estate teams: ${managedPlans
      .map((plan) => `Level ${plan.step} ${plan.priceDisplay}`)
      .join(", ")} a month, plus setup. Church plans from $149.`,
    label: "Pricing",
    image: socialImage("pricing", "Genesis AI pricing: Managed AI plans"),
    lastModified: "2026-11-15",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/ai-employees",
    title: "AI Employees for Your Pipeline",
    description: `${aiEmployeesHero.title} Meet Hawk, Susan, Darius, and Ava. Plans at ${managedPlans
      .slice(0, -1)
      .map((plan) => plan.priceDisplay)
      .join(", ")}, and ${managedPlans.at(-1)?.priceDisplay} a month.`,
    label: "AI Employees",
    image: null,
    lastModified: "2026-11-03",
    changeFrequency: "monthly",
    priority: 0.8,
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
      "Genesis AI builds managed AI infrastructure for real estate professionals and supports the operation as it grows.",
    label: "About",
    image: socialImage("about", "About Genesis AI: the principles behind Genesis"),
    lastModified: "2026-11-15",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/contact",
    title: { absolute: "Contact Genesis AI: Book a Call" },
    description:
      "Book a free call with Genesis to review your current systems, the manual work creating the most drag, and the right scope and next step.",
    label: "Contact",
    image: socialImage("contact", "Contact Genesis AI: book a call"),
    lastModified: REBUILD,
    changeFrequency: "yearly",
    priority: 0.6,
  },
  {
    path: "/lending",
    title: "Software for Lending Teams",
    description:
      "Genesis is software for lending teams. Brokers and lender desks capture, qualify and follow up with borrower inquiries faster, so no inquiry sits waiting.",
    label: "Lending",
    image: null,
    lastModified: "2026-11-12",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/real-estate",
    title: "Software for Real Estate Pros",
    description:
      "Genesis is software for real estate pros. Agents, investors and teams work every buyer and seller lead the same day and keep the deal board current.",
    label: "Real Estate Pros",
    image: null,
    lastModified: "2026-11-05",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/business",
    title: "Software for Service Businesses",
    description:
      "Genesis is software for service businesses. Calls get answered, quotes get followed up, and appointments get confirmed so no customer waits.",
    label: "Business",
    image: null,
    lastModified: "2026-11-05",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/capital-desk",
    title: "Capital Desk",
    description:
      "Request a consult for Capital Desk, a back office for brokers. No checkout on this page. Genesis follows up about fit.",
    label: "Capital Desk",
    image: null,
    lastModified: "2026-11-22",
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    path: "/leadscout",
    title: "Leadscout",
    description:
      "Request a Leadscout consult or demo. Tell us about your operation and we will follow up. This page does not start checkout.",
    label: "Leadscout",
    image: null,
    lastModified: "2026-11-22",
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    path: "/enterprise",
    title: "Software for Multi Location Operations",
    description:
      "Genesis is software for multi location operations. Connect your systems, run custom workflows, and keep a managed build operating every month.",
    label: "Enterprise",
    image: null,
    lastModified: "2026-11-05",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/ministry",
    title: "Church Websites and Care Software",
    description:
      "Genesis Ministry is software for churches: a website in your own look, Hope the site assistant, a guest pipeline and a private care inbox. Plans from $149 a month.",
    label: "Ministry",
    image: null,
    lastModified: "2026-11-21",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/privacy",
    title: "Privacy Policy",
    description:
      "Genesis privacy notice. What information the Genesis software collects, how payments and sign in work, and how to reach us.",
    label: "Privacy",
    image: null,
    lastModified: "2026-11-05",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    path: "/terms",
    title: "Terms of Service",
    description:
      "Genesis terms of service. The software is provided as is, you are responsible for lawful use, and classes are education only.",
    label: "Terms",
    image: null,
    lastModified: "2026-11-05",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    path: "/blog",
    title: "Real Estate Operations and AI Blog",
    description:
      "Practical writing from Genesis AI on real estate operations, email deliverability, client data, and putting AI to work in brokerages and investor teams.",
    label: "Blog",
    image: null,
    lastModified: blogPosts[0]?.date ?? REBUILD,
    changeFrequency: "weekly",
    priority: 0.7,
  },
  ...blogPosts.map(
    (post): SeoPage => ({
      path: `/blog/${post.slug}`,
      title: post.seoTitle,
      description: post.seoDescription,
      label: post.title,
      parent: "/blog",
      image: { url: post.image, alt: post.imageAlt, width: 1400, height: 1120 },
      lastModified: post.date,
      changeFrequency: "yearly",
      priority: 0.6,
    }),
  ),
  ...texasLandings.map(
    (page): SeoPage => ({
      path: page.path,
      title: page.title,
      description: page.description,
      label: page.label,
      parent: page.parent,
      image: null,
      lastModified: "2026-11-12",
      changeFrequency: "monthly",
      priority: page.path === "/texas" ? 0.8 : 0.7,
    }),
  ),
  ...texasServiceLandings.map(
    (page): SeoPage => ({
      path: page.path,
      title: page.title,
      description: page.description,
      label: page.label,
      parent: page.parent,
      image: null,
      lastModified: "2026-11-12",
      changeFrequency: "monthly",
      priority: page.path === "/texas/service-businesses" ? 0.8 : 0.7,
    }),
  ),
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
