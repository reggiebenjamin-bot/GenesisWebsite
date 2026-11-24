import {
  aiEmployeesExpert,
  aiEmployeesPricing,
  expertPhone,
} from "./aiEmployees.ts";
import { contact } from "./content.ts";
import { editionLevels, editionPricing, type EditionKey } from "./editionPlans.ts";
import { editions, ministryEdition } from "./editions.ts";
import { ministryLevels } from "./ministryPage.ts";
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
    serviceType: "AI infrastructure for service, lending and real estate businesses",
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
        description: plan.day,
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

/** "1 user, plus $500 setup." for an edition Offer. */
export function offerDescription(plan: { userLimit: string; setupLine: string }): string {
  return `${plan.userLimit}, ${plan.setupLine}.`;
}

/**
 * Genesis Enterprise as a Service: no listed price, so its one Offer says the
 * price is set on a call.
 */
export function enterpriseServiceSchema() {
  const edition = editions.find((candidate) => candidate.href === "/enterprise")!;
  return {
    "@type": "Service",
    "@id": `${absoluteUrl(edition.href)}#service`,
    name: edition.name,
    serviceType: "Multi location AI operations",
    description: edition.body,
    url: absoluteUrl(edition.href),
    provider: organizationRef,
    areaServed: { "@type": "State", name: "Texas" },
    offers: {
      "@type": "Offer",
      name: `${edition.name}, scoped on a call`,
      description: "More than 25 users or more than one location. Pricing is set with you on a call.",
      url: absoluteUrl("/contact"),
    },
  };
}

/**
 * One business edition as a Service with its three Levels as Offers, built
 * from the same data the edition page prints, so the two cannot drift.
 */
export function editionServiceSchema(key: EditionKey) {
  const pricing = editionPricing[key];
  const edition = editions.find((candidate) => candidate.href === pricing.landingPath)!;
  return {
    "@type": "Service",
    "@id": `${absoluteUrl(edition.href)}#service`,
    name: edition.name,
    serviceType: edition.audience,
    description: edition.body,
    url: absoluteUrl(edition.href),
    provider: organizationRef,
    areaServed: { "@type": "State", name: "Texas" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${pricing.name} Levels`,
      itemListElement: editionLevels(key).map(({ plan }) => ({
        "@type": "Offer",
        name: `${pricing.name}, Level ${plan.step}`,
        description: offerDescription(plan),
        price: plan.monthlyPriceUsd,
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: plan.monthlyPriceUsd,
          priceCurrency: "USD",
          unitText: "per month",
        },
        url: absoluteUrl(pricing.pricingPath),
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
        ...managedPlans.map((plan) => monthly(plan.monthlyPriceUsd, `Level ${plan.step} ${plan.name}`, plan.summary)),
      ],
    },
  };
}

/**
 * Genesis Ministry, for churches: the three plans and the monthly prices the
 * /ministry cards print. Enterprise is scoped on a call, so it carries no
 * price and is left out of the catalog.
 */
export function ministryServiceSchema() {
  const url = absoluteUrl("/ministry");
  return {
    "@type": "Service",
    "@id": `${url}#service`,
    name: ministryEdition.name,
    serviceType: "Church websites and care software",
    description: ministryEdition.body,
    url,
    provider: organizationRef,
    areaServed: { "@type": "Country", name: "United States" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${ministryEdition.name} plans`,
      itemListElement: ministryLevels.levels.map((plan) => ({
        "@type": "Offer",
        name: `${ministryEdition.name} ${plan.name}`,
        description: plan.summary,
        url: `${url}#levels`,
        price: plan.monthlyPriceUsd,
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: plan.monthlyPriceUsd,
          priceCurrency: "USD",
          unitText: ministryLevels.priceUnit,
        },
      })),
    },
  };
}

/** The questions and answers printed on a page, as FAQPage structured data. */
export function faqPageSchema(
  items: readonly { question: string; answer: string }[],
  path: string,
) {
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(path)}#faq`,
    url: absoluteUrl(path),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** Genesis itself, distinct from the three one-time tools. */
export function genesisSoftwareSchema() {
  const url = siteUrl;

  return {
    "@type": "SoftwareApplication",
    "@id": `${url}/#software`,
    name: "Genesis",
    alternateName: "Genesis AI",
    url,
    description: genesisPositioning.brandDescription,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    provider: organizationRef,
    publisher: organizationRef,
    offers: managedPlans.map((plan) => ({
      "@type": "Offer",
      name: `${managedOverview.product}, Level ${plan.step}`,
      description: plan.day,
      url: absoluteUrl("/pricing"),
      price: plan.monthlyPriceUsd,
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: plan.monthlyPriceUsd,
        priceCurrency: "USD",
        unitText: "per month",
      },
    })),
  };
}

/** A page's nodes wrapped as one graph. */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
