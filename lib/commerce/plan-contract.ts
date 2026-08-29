/**
 * Stable identifiers for the future FastAPI/OpenAPI contract.
 *
 * The marketing catalog in `lib/products.ts` is a review projection. FastAPI
 * must ultimately own the published catalog version and return these values to
 * the Mini application through a generated client.
 */
export const miniPlanKeys = [
  "mini.preview",
  "mini.agent",
  "mini.pro",
  "mini.team",
] as const;

export type MiniPlanKey = (typeof miniPlanKeys)[number];

export const infrastructurePlanKeys = [
  "infrastructure.foundation",
  "infrastructure.growth",
  "infrastructure.custom",
] as const;

export type InfrastructurePlanKey = (typeof infrastructurePlanKeys)[number];

export const miniLimitKeys = [
  "seats",
  "active_records",
  "pipelines",
  "genesis_standard_units_monthly",
] as const;

export type MiniLimitKey = (typeof miniLimitKeys)[number];

export const miniEntitlementKeys = [
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
] as const;

export type MiniEntitlementKey = (typeof miniEntitlementKeys)[number];

export type MiniNumericLimits = Record<MiniLimitKey, number>;
