const configuredIndexability = process.env.NEXT_PUBLIC_SITE_INDEXABLE;
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const indexable = configuredIndexability
  ? configuredIndexability === "true"
  : process.env.VERCEL_ENV === "production";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (productionHost
    ? `https://${productionHost}`
    : "https://genesis-website-plum.vercel.app");
