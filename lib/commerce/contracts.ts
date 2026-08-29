import type {
  MiniEntitlementKey,
  MiniLimitKey,
  MiniPlanKey,
} from "@/lib/commerce/plan-contract";

export type SubscriptionStatus =
  | "none"
  | "incomplete"
  | "trialing"
  | "active"
  | "past_due"
  | "paused"
  | "canceled"
  | "unpaid";

export type ProvisioningStatus =
  | "not_started"
  | "queued"
  | "in_progress"
  | "ready"
  | "failed"
  | "deprovisioning"
  | "deprovisioning_failed"
  | "deprovisioned";

export type EntitlementStatus =
  | "pending"
  | "active"
  | "grace"
  | "suspended"
  | "revoked"
  | "expired";

declare const resolvedOrganizationBrand: unique symbol;

/** Minted only after server-side identity, membership, and resource checks. */
export type ResolvedOrganizationId = string & {
  readonly [resolvedOrganizationBrand]: "ResolvedOrganizationId";
};

export type VerifiedResourceContext = {
  organizationId: ResolvedOrganizationId;
  principalId: string;
  membershipId: string;
  resolvedAt: string;
};

export type PlanReference = {
  key: MiniPlanKey;
  catalogVersion: string;
};

export type Entitlement = {
  key: MiniEntitlementKey;
  status: EntitlementStatus;
  effectiveAt?: string;
  expiresAt?: string;
};

export type EntitlementSnapshot = {
  organizationId: ResolvedOrganizationId;
  currentPlan: PlanReference | null;
  pendingPlan: PlanReference | null;
  subscriptionStatus: SubscriptionStatus;
  provisioningStatus: ProvisioningStatus;
  entitlements: readonly Entitlement[];
  effectiveLimits: Readonly<Record<MiniLimitKey, number>>;
  usage: readonly UsageSummary[];
  desiredEntitlementRevision: number;
  appliedEntitlementRevision: number;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  graceEndsAt: string | null;
  accessEndsAt: string | null;
  updatedAt: string;
};

export type BillingEnvironment = "test" | "live";

export type VerifiedBillingEvent = {
  provider: string;
  providerAccountId: string;
  environment: BillingEnvironment;
  providerEventId: string;
  eventType: string;
  providerApiVersion: string | null;
  providerCreatedAt: string;
  payloadDigest: string;
  payloadReference: string | null;
  providerCustomerId: string;
  providerSubscriptionId: string | null;
  receivedAt: string;
  verifiedAt: string;
};

export type VerifiedBillingEventReference = Pick<
  VerifiedBillingEvent,
  | "provider"
  | "providerAccountId"
  | "environment"
  | "providerEventId"
  | "eventType"
  | "payloadDigest"
  | "providerCustomerId"
  | "providerSubscriptionId"
  | "verifiedAt"
>;

export type AccessGrantBasis =
  | {
      kind: "verified_payment";
      paymentStatus: "paid";
      event: VerifiedBillingEventReference;
    }
  | {
      kind: "approved_trial";
      approvalId: string;
      approvedBy: string;
      approvedAt: string;
      expiresAt: string;
    };

export type InternalCommandContext = {
  resource: VerifiedResourceContext;
  idempotencyKey: string;
  requestedAt: string;
};

export type CreateCheckoutSessionCommand = InternalCommandContext & {
  plan: PlanReference;
  completionDestination: "mini_onboarding";
  cancellationDestination: "mini_plan_selection";
};

export type CreateBillingPortalSessionCommand = InternalCommandContext & {
  returnDestination: "mini_account_billing";
};

export type RequestPlanChangeCommand = InternalCommandContext & {
  desiredPlan: PlanReference;
  effectiveTiming: "provider_default" | "period_end";
};

export type ProvisioningCommand = {
  resource: VerifiedResourceContext;
  environment: BillingEnvironment;
  desiredPlan: PlanReference;
  desiredEntitlementRevision: number;
  accessGrantBasis: AccessGrantBasis;
  jobKey: string;
  requestedAt: string;
};

export type UsageReservation = {
  resource: VerifiedResourceContext;
  entitlementRevision: number;
  limitKey: MiniLimitKey;
  units: number;
  idempotencyKey: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
};

export type UsageSummary = {
  limitKey: MiniLimitKey;
  usedUnits: number;
  limit: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
};

export type HostedSession = {
  providerSessionId: string;
  url: string;
  expiresAt: string;
};

export type ProviderSubscriptionSnapshot = {
  provider: string;
  providerAccountId: string;
  environment: BillingEnvironment;
  providerCustomerId: string;
  providerSubscriptionId: string;
  providerPriceId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  observedAt: string;
};

/**
 * Provider-neutral server boundary. No implementation or provider SDK is
 * installed in this marketing repository.
 */
export interface BillingProviderAdapter {
  createHostedCheckout(
    command: CreateCheckoutSessionCommand,
  ): Promise<HostedSession>;
  createHostedPortal(
    command: CreateBillingPortalSessionCommand,
  ): Promise<HostedSession>;
  verifyWebhook(
    rawBody: Uint8Array,
    headers: Readonly<Record<string, string>>,
  ): Promise<VerifiedBillingEvent>;
  getSubscription(
    providerSubscriptionId: string,
    environment: BillingEnvironment,
  ): Promise<ProviderSubscriptionSnapshot>;
  requestPlanChange(
    command: RequestPlanChangeCommand,
  ): Promise<ProviderSubscriptionSnapshot>;
  cancelSubscription(
    command: InternalCommandContext & {
      effectiveTiming: "immediate" | "period_end";
    },
  ): Promise<ProviderSubscriptionSnapshot>;
}

/**
 * Contract only. The authoritative implementation belongs beside the FastAPI
 * tenant and billing data, not in this marketing application. The resource
 * context is resolved from verified identity and membership; user input never
 * selects the organization directly.
 */
export interface ServerEntitlementService {
  getSnapshot(resource: VerifiedResourceContext): Promise<EntitlementSnapshot>;
  assertEntitled(
    resource: VerifiedResourceContext,
    entitlementKey: MiniEntitlementKey,
  ): Promise<void>;
  reserveUsage(input: UsageReservation): Promise<EntitlementSnapshot>;
}

export const provisioningTransitions = {
  not_started: ["queued"],
  queued: ["in_progress"],
  in_progress: ["ready", "failed"],
  ready: ["queued", "deprovisioning"],
  failed: ["queued", "deprovisioning"],
  deprovisioning: ["deprovisioned", "deprovisioning_failed"],
  deprovisioning_failed: ["deprovisioning"],
  deprovisioned: [],
} as const satisfies Record<ProvisioningStatus, readonly ProvisioningStatus[]>;

export function canTransitionProvisioningState(
  from: ProvisioningStatus,
  to: ProvisioningStatus,
) {
  return (provisioningTransitions[from] as readonly ProvisioningStatus[]).includes(to);
}

export function provisioningJobKey(
  organizationId: ResolvedOrganizationId,
  desiredEntitlementRevision: number,
) {
  return `${organizationId}:entitlements:${desiredEntitlementRevision}`;
}

function isNonEmpty(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoDate(value: string | null | undefined) {
  return isNonEmpty(value) && Number.isFinite(Date.parse(value as string));
}

/**
 * Construction guard for the future server-owned provisioning queue. A valid
 * state transition never authorizes access on its own; the command must carry
 * verified identity context plus a payment event for the same environment or
 * an approved, unexpired trial.
 */
export function isValidProvisioningCommand(input: ProvisioningCommand) {
  const requestedAt = Date.parse(input.requestedAt);
  const validBase =
    isNonEmpty(input.resource.organizationId) &&
    isNonEmpty(input.resource.principalId) &&
    isNonEmpty(input.resource.membershipId) &&
    isIsoDate(input.resource.resolvedAt) &&
    isNonEmpty(input.desiredPlan.key) &&
    isNonEmpty(input.desiredPlan.catalogVersion) &&
    Number.isSafeInteger(input.desiredEntitlementRevision) &&
    input.desiredEntitlementRevision > 0 &&
    Number.isFinite(requestedAt) &&
    input.jobKey ===
      provisioningJobKey(
        input.resource.organizationId,
        input.desiredEntitlementRevision,
      );

  if (!validBase) return false;

  if (input.accessGrantBasis.kind === "verified_payment") {
    const event = input.accessGrantBasis.event;
    return (
      input.accessGrantBasis.paymentStatus === "paid" &&
      event.environment === input.environment &&
      isNonEmpty(event.provider) &&
      isNonEmpty(event.providerAccountId) &&
      isNonEmpty(event.providerEventId) &&
      isNonEmpty(event.eventType) &&
      isNonEmpty(event.payloadDigest) &&
      isNonEmpty(event.providerCustomerId) &&
      isNonEmpty(event.providerSubscriptionId) &&
      isIsoDate(event.verifiedAt)
    );
  }

  const approvedAt = Date.parse(input.accessGrantBasis.approvedAt);
  const expiresAt = Date.parse(input.accessGrantBasis.expiresAt);
  return (
    isNonEmpty(input.accessGrantBasis.approvalId) &&
    isNonEmpty(input.accessGrantBasis.approvedBy) &&
    Number.isFinite(approvedAt) &&
    Number.isFinite(expiresAt) &&
    approvedAt <= requestedAt &&
    expiresAt > requestedAt
  );
}

export function isValidUsageReservation(input: UsageReservation) {
  const startsAt = Date.parse(input.billingPeriodStart);
  const endsAt = Date.parse(input.billingPeriodEnd);

  return (
    Number.isSafeInteger(input.units) &&
    input.units > 0 &&
    Number.isSafeInteger(input.entitlementRevision) &&
    input.entitlementRevision > 0 &&
    Number.isFinite(startsAt) &&
    Number.isFinite(endsAt) &&
    startsAt < endsAt &&
    input.idempotencyKey.trim().length > 0
  );
}
