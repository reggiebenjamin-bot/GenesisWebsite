import type {
  InfrastructurePlanKey,
  MiniEntitlementKey,
  MiniNumericLimits,
  MiniPlanKey,
} from "@/lib/commerce/plan-contract";

export type CatalogPublicationState = "draft" | "beta" | "public";

export type MiniPlanLimits = MiniNumericLimits & {
  reports: string;
  integrations: string;
};

type MiniPlanBase = {
  key: MiniPlanKey;
  slug: "preview" | "agent" | "pro" | "team";
  name: string;
  priceCentsMonthly: number | null;
  priceDisplay: string;
  audience: string;
  summary: string;
  features: readonly string[];
  entitlements: readonly MiniEntitlementKey[];
  limits: MiniPlanLimits;
  featured?: boolean;
};

export type MiniPlan = MiniPlanBase &
  (
    | {
        provisional: true;
        approvedAt: null;
        approvedBy: null;
      }
    | {
        provisional: false;
        approvedAt: string;
        approvedBy: string;
      }
  );

export type MiniCatalog = {
  version: string;
  publicationState: CatalogPublicationState;
  plans: readonly MiniPlan[];
};

export type InfrastructurePrice =
  | {
      kind: "starting_at";
      display: string;
      cadence: "one-time";
      amountCents: number;
    }
  | {
      kind: "scoped";
      cadence: "Scoped after consultation";
    };

export type InfrastructurePlan = {
  key: InfrastructurePlanKey;
  slug: "foundation" | "growth" | "custom-infrastructure";
  name: string;
  price: InfrastructurePrice;
  audience: string;
  features: readonly string[];
  ctaLabel: "Discuss Foundation" | "Discuss Growth" | "Book a consultation";
  featured?: boolean;
};

export const MINI_CATALOG_VERSION = "mini-2026-08-27-draft-1";
export const INFRASTRUCTURE_CATALOG_VERSION = "infrastructure-2026-08-27-public-1";

/**
 * This catalog is deliberately draft. The prices are a commercial hypothesis
 * and the limits are engineering seeds from the governing plan. Production UI
 * must not display them unless an explicit review/publication gate allows it.
 */
export const miniCatalog = {
  version: MINI_CATALOG_VERSION,
  publicationState: "draft" as const,
  plans: [
    {
      key: "mini.preview",
      slug: "preview",
      name: "Preview / Trial",
      priceCentsMonthly: null,
      priceDisplay: "Invite-only or time-limited",
      audience: "For evaluating the core daily workflow before a paid plan is approved.",
      summary: "See what needs attention, complete the next move, and record the outcome.",
      features: [
        "Today, Leads, and Deals workspaces",
        "Manual tasks and draft outreach",
        "Basic reports",
        "Single-user workspace",
      ],
      entitlements: [
        "mini.workspace.today",
        "mini.workspace.leads",
        "mini.workspace.deals",
        "mini.tasks.manual",
        "mini.outreach.draft",
        "mini.reports.basic",
      ],
      limits: {
        seats: 1,
        active_records: 50,
        pipelines: 1,
        genesis_standard_units_monthly: 25,
        reports: "Basic",
        integrations: "None",
      },
      provisional: true,
      approvedAt: null,
      approvedBy: null,
    },
    {
      key: "mini.agent",
      slug: "agent",
      name: "Agent",
      priceCentsMonthly: 2_000,
      priceDisplay: "$20/month",
      audience: "For an independent agent who needs a focused revenue-moving workspace.",
      summary: "Prioritize due work, prepare follow-up, and maintain a usable record of what happened.",
      features: [
        "Today, Leads, and Deals workspaces",
        "Manual tasks and draft outreach",
        "Basic reports",
        "Manual import and export",
      ],
      entitlements: [
        "mini.workspace.today",
        "mini.workspace.leads",
        "mini.workspace.deals",
        "mini.tasks.manual",
        "mini.outreach.draft",
        "mini.reports.basic",
      ],
      limits: {
        seats: 1,
        active_records: 500,
        pipelines: 1,
        genesis_standard_units_monthly: 250,
        reports: "Basic",
        integrations: "Manual import/export",
      },
      provisional: true,
      approvedAt: null,
      approvedBy: null,
    },
    {
      key: "mini.pro",
      slug: "pro",
      name: "Pro",
      priceCentsMonthly: 10_000,
      priceDisplay: "$100/month",
      audience: "For a high-volume individual operator who needs more capacity and approved connections.",
      summary: "Handle more active opportunities with deeper reporting and metered connected execution.",
      features: [
        "Everything in Agent",
        "Advanced individual reports",
        "Limited approved connections",
        "Priority product support",
      ],
      entitlements: [
        "mini.workspace.today",
        "mini.workspace.leads",
        "mini.workspace.deals",
        "mini.tasks.manual",
        "mini.outreach.draft",
        "mini.reports.basic",
        "mini.reports.advanced_individual",
        "mini.connections.approved",
      ],
      limits: {
        seats: 1,
        active_records: 5_000,
        pipelines: 3,
        genesis_standard_units_monthly: 2_000,
        reports: "Advanced individual",
        integrations: "Limited approved connections",
      },
      provisional: true,
      approvedAt: null,
      approvedBy: null,
      featured: true,
    },
    {
      key: "mini.team",
      slug: "team",
      name: "Team",
      priceCentsMonthly: 20_000,
      priceDisplay: "$200/month",
      audience: "For a small team sharing queues, records, and ownership visibility.",
      summary: "Coordinate due work across a small team without turning Mini into a custom implementation.",
      features: [
        "Everything in Pro",
        "Shared team queues",
        "Owner, admin, and member roles",
        "Team and ownership reports",
      ],
      entitlements: [
        "mini.workspace.today",
        "mini.workspace.leads",
        "mini.workspace.deals",
        "mini.tasks.manual",
        "mini.outreach.draft",
        "mini.reports.basic",
        "mini.reports.advanced_individual",
        "mini.reports.team_ownership",
        "mini.connections.approved",
        "mini.queues.shared",
        "mini.roles.team",
      ],
      limits: {
        seats: 5,
        active_records: 25_000,
        pipelines: 10,
        genesis_standard_units_monthly: 5_000,
        reports: "Team/ownership views",
        integrations: "Additional approved connections and governance",
      },
      provisional: true,
      approvedAt: null,
      approvedBy: null,
    },
  ] satisfies readonly MiniPlan[],
} satisfies MiniCatalog;

/**
 * Public pricing deliberately excludes the internal preview entitlement. Free
 * access belongs inside the future authenticated product, not beside the paid
 * plans as another buying decision.
 */
export const miniPaidPlans: readonly MiniPlan[] = miniCatalog.plans.filter(
  (plan) => plan.slug !== "preview",
);

export const infrastructureCatalog = {
  version: INFRASTRUCTURE_CATALOG_VERSION,
  publicationState: "public" as const,
  plans: [
    {
      key: "infrastructure.foundation",
      slug: "foundation",
      name: "Foundation",
      price: {
        kind: "starting_at",
        display: "$1,500",
        cadence: "one-time",
        amountCents: 150_000,
      },
      audience: "A brokerage, lending, or acquisitions operation establishing a dependable business foundation.",
      features: [
        "Microsoft 365 foundation",
        "Business email, identity, and documents",
        "Core platform configuration",
        "One focused workflow implementation",
      ],
      ctaLabel: "Discuss Foundation",
    },
    {
      key: "infrastructure.growth",
      slug: "growth",
      name: "Growth",
      price: {
        kind: "starting_at",
        display: "$5,000",
        cadence: "one-time",
        amountCents: 500_000,
      },
      audience: "A growing organization ready to connect its data, workflows, and teams.",
      features: [
        "Everything in Foundation",
        "Applied-AI workflow implementation",
        "Data synthesis across key systems",
        "Genesis CRM when needed",
        "Deeper integrations and adoption support",
      ],
      ctaLabel: "Discuss Growth",
      featured: true,
    },
    {
      key: "infrastructure.custom",
      slug: "custom-infrastructure",
      name: "Enterprise",
      price: {
        kind: "scoped",
        cadence: "Scoped after consultation",
      },
      audience: "Larger, multi-entity, multi-team, lender, brokerage, or otherwise complex operations.",
      features: [
        "Multiple operational workflows",
        "Custom AI agents and integrations",
        "Broader data architecture",
        "Expanded governance, launch, and support",
        "Scope determined with the customer",
      ],
      ctaLabel: "Book a consultation",
    },
  ] satisfies readonly InfrastructurePlan[],
};

export type MiniCatalogDisplayMode = "hold" | "review" | "public";

export function isMiniCatalogPublishable(catalog: MiniCatalog) {
  return (
    catalog.publicationState === "public" &&
    catalog.version.trim().length > 0 &&
    catalog.plans.length > 0 &&
    catalog.plans.every(
      (plan) =>
        !plan.provisional &&
        plan.approvedAt.trim().length > 0 &&
        Number.isFinite(Date.parse(plan.approvedAt)) &&
        plan.approvedBy.trim().length > 0 &&
        (plan.priceCentsMonthly === null ||
          (Number.isSafeInteger(plan.priceCentsMonthly) &&
            plan.priceCentsMonthly >= 0)) &&
        Object.values(plan.limits)
          .filter((value): value is number => typeof value === "number")
          .every((value) => Number.isSafeInteger(value) && value >= 0),
    )
  );
}

/**
 * Draft details are visible automatically in local development. A preview
 * deployment must opt in with MINI_CATALOG_REVIEW_MODE=review. Publication is
 * a separate source decision: change the catalog state to public only after
 * the pricing, limits, and legal language are approved.
 */
export function getMiniCatalogDisplayMode(): MiniCatalogDisplayMode {
  if (isMiniCatalogPublishable(miniCatalog)) {
    return "public";
  }
  if (
    process.env.NODE_ENV === "development" ||
    process.env.MINI_CATALOG_REVIEW_MODE === "review"
  ) {
    return "review";
  }
  return "hold";
}

const infrastructurePlanSlugs = new Set<string>(
  infrastructureCatalog.plans.map((plan) => plan.slug),
);

export function isInfrastructurePlanSlug(
  value: string,
): value is InfrastructurePlan["slug"] {
  return infrastructurePlanSlugs.has(value);
}
