import {
  aiEmployeePlans,
  aiEmployeesEnterprise,
  aiEmployeesExpert,
  aiEmployeesPricing,
  expertPhone,
} from "./aiEmployees.ts";
import { contact } from "./content.ts";
import {
  genesisPositioning,
  genesisTools,
  managedOverview,
  managedPlans,
  toolsOverview,
  type GenesisTool,
} from "./offers.ts";
import { absoluteUrl, breadcrumbTrail, seoPage } from "./seo.ts";
import { siteUrl } from "./site.ts";

/*
 * Structured data that describes Genesis as it is — no ratings, no reviews,
 * no claims the pages themselves do not make. Every price and description
 * here is the one printed on the page it describes.
 *
 * Organization carries the full record on the homepage and the About page
 * (Google reads it from either); everything else points back to it by @id.
 */

const ORGANIZATION_ID = `${siteUrl}/#organization`;
const WEBSITE_ID = `${siteUrl}/#website`;
const REGINALD_ID = `${siteUrl}/#reginald-benjamin`;

const organizationRef = { "@type": "Organization", "@id": ORGANIZATION_ID, name: "Genesis AI" };

/** The visible price, as a number: "$1,750" → 1750. */
export function priceNumber(display: string): number {
  return Number(display.replace(/[^0-9.]/g, ""));
}

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "Genesis AI",
    alternateName: "Genesis",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/icon-512.png`,
      width: 512,
      height: 512,
    },
    description: `${genesisPositioning.category}. ${genesisPositioning.brandDescription}`,
    email: contact.email,
    telephone: contact.phoneHref,
    founder: {
      "@type": "Person",
      "@id": REGINALD_ID,
      name: "Reginald Benjamin",
      jobTitle: "Founder",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: contact.email,
      telephone: contact.phoneHref,
      areaServed: "US",
      availableLanguage: "English",
    },
    sameAs: [contact.linkedin, contact.facebook],
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: "Genesis AI",
    url: siteUrl,
    inLanguage: "en-US",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** Home › … › this page, from the page registry. */
export function breadcrumbSchema(path: string) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbTrail(path).map((page, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: page.label,
      item: absoluteUrl(page.path),
    })),
  };
}

const toolCategory: Record<GenesisTool["id"], string> = {
  "deal-architect": "Real estate deal analysis",
  "deal-packager": "Real estate deal presentation",
  "capital-advisor": "Real estate capital planning",
};

export function softwareApplicationSchema(tool: GenesisTool) {
  const url = absoluteUrl(`/tools/${tool.id}`);

  return {
    "@type": "SoftwareApplication",
    "@id": `${url}#software`,
    name: tool.name,
    url,
    description: tool.purpose,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: toolCategory[tool.id],
    operatingSystem: "Web",
    featureList: tool.highlights,
    ...(tool.primaryUsers
      ? { audience: { "@type": "Audience", audienceType: tool.primaryUsers } }
      : {}),
    offers: {
      "@type": "Offer",
      url,
      price: priceNumber(tool.price.display),
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: priceNumber(tool.price.display),
        priceCurrency: "USD",
        unitText: `per ${tool.price.unit}`,
      },
    },
    publisher: organizationRef,
  };
}

export function toolsCollectionSchema() {
  const page = seoPage("/tools");

  return {
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(page.path)}#page`,
    url: absoluteUrl(page.path),
    name: toolsOverview.product,
    description: page.description,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: genesisTools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/tools/${tool.id}`),
        name: tool.name,
      })),
    },
  };
}

export function managedServiceSchema() {
  return {
    "@type": "Service",
    "@id": `${absoluteUrl("/solutions")}#service`,
    name: managedOverview.product,
    serviceType: "AI infrastructure for real estate businesses",
    description: managedOverview.summary,
    url: absoluteUrl("/solutions"),
    provider: organizationRef,
    areaServed: { "@type": "Country", name: "United States" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${managedOverview.product} plans`,
      itemListElement: managedPlans.map((plan) => ({
        "@type": "Offer",
        name: `${managedOverview.product}, Level ${plan.step}`,
        description: `${plan.ladder} ${plan.scope}`,
        price: plan.monthlyPriceUsd,
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: plan.monthlyPriceUsd,
          priceCurrency: "USD",
          unitText: "per month",
        },
        url: absoluteUrl("/pricing"),
      })),
    },
  };
}

export function aboutPageSchema() {
  return {
    "@type": "AboutPage",
    "@id": `${absoluteUrl("/about")}#page`,
    url: absoluteUrl("/about"),
    name: "About Genesis AI",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    mainEntity: { "@id": ORGANIZATION_ID },
  };
}

/** Reginald Benjamin, linked to the Genesis organization by @id. */
export function reginaldBenjaminSchema() {
  return {
    "@type": "Person",
    "@id": REGINALD_ID,
    name: aiEmployeesExpert.name,
    jobTitle: aiEmployeesExpert.jobTitle,
    description: aiEmployeesExpert.body,
    url: `${absoluteUrl("/ai-employees")}#expert`,
    telephone: expertPhone.href,
    worksFor: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: "Genesis",
      alternateName: "Genesis AI",
      url: siteUrl,
    },
  };
}

export function aiEmployeesServiceSchema() {
  const url = absoluteUrl("/ai-employees");
  const monthly = (price: number, name: string, description: string) => ({
    "@type": "Offer",
    name,
    description,
    url: `${url}#plans`,
    price,
    priceCurrency: "USD",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price,
      priceCurrency: "USD",
      unitText: "per month",
    },
  });

  return {
    "@type": "Service",
    "@id": `${url}#service`,
    name: "Genesis AI Employees",
    serviceType: "AI employees for real estate pipeline work",
    description: aiEmployeesPricing.summary,
    url,
    provider: organizationRef,
    areaServed: { "@type": "Country", name: "United States" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Genesis AI Employees plans",
      itemListElement: [
        ...aiEmployeePlans.map((plan) => monthly(plan.monthlyPriceUsd, plan.name, plan.summary)),
        {
          "@type": "Offer",
          name: aiEmployeesEnterprise.name,
          description: aiEmployeesEnterprise.priceLine,
          url: `${url}#enterprise`,
          price: aiEmployeesEnterprise.monthlyPriceUsd,
          priceCurrency: "USD",
          priceSpecification: [
            {
              "@type": "UnitPriceSpecification",
              price: aiEmployeesEnterprise.setupUsd,
              priceCurrency: "USD",
              unitText: aiEmployeesEnterprise.setupUnit,
            },
            {
              "@type": "UnitPriceSpecification",
              price: aiEmployeesEnterprise.monthlyPriceUsd,
              priceCurrency: "USD",
              unitText: "per month",
            },
          ],
        },
      ],
    },
  };
}

/** A page's nodes wrapped as one graph. */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
