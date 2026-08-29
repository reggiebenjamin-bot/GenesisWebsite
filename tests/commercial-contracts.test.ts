import assert from "node:assert/strict";
import test from "node:test";
import {
  canTransitionProvisioningState,
  isValidProvisioningCommand,
  isValidUsageReservation,
  provisioningJobKey,
  provisioningTransitions,
  type AccessGrantBasis,
  type ProvisioningCommand,
  type ResolvedOrganizationId,
  type UsageReservation,
} from "../lib/commerce/contracts.ts";
import {
  miniEntitlementKeys,
  miniLimitKeys,
  miniPlanKeys,
} from "../lib/commerce/plan-contract.ts";
import {
  infrastructureCatalog,
  isMiniCatalogPublishable,
  miniCatalog,
  miniPaidPlans,
  type MiniCatalog,
} from "../lib/products.ts";

test("Mini remains an explicitly provisional catalog", () => {
  assert.equal(miniCatalog.publicationState, "draft");
  assert.deepEqual(
    miniCatalog.plans.map((plan) => plan.key),
    ["mini.preview", "mini.agent", "mini.pro", "mini.team"],
  );
  assert.ok(miniCatalog.plans.every((plan) => plan.provisional));
  assert.ok(
    miniCatalog.plans.every(
      (plan) => plan.approvedAt === null && plan.approvedBy === null,
    ),
  );
  assert.deepEqual(
    miniCatalog.plans.map((plan) => plan.priceCentsMonthly),
    [null, 2_000, 10_000, 20_000],
  );
});

test("Mini cannot become public until every plan has explicit approval", () => {
  const invalidPublicCatalog = {
    ...miniCatalog,
    publicationState: "public" as const,
  } satisfies MiniCatalog;
  assert.equal(isMiniCatalogPublishable(invalidPublicCatalog), false);

  const approvedPublicCatalog = {
    ...miniCatalog,
    publicationState: "public" as const,
    plans: miniCatalog.plans.map((plan) => ({
      ...plan,
      provisional: false as const,
      approvedAt: "2026-08-27T12:00:00.000Z",
      approvedBy: "commercial-approval-001",
    })),
  } satisfies MiniCatalog;
  assert.equal(isMiniCatalogPublishable(approvedPublicCatalog), true);
});

test("public Mini pricing presents paid plans only", () => {
  assert.deepEqual(
    miniPaidPlans.map((plan) => plan.key),
    ["mini.agent", "mini.pro", "mini.team"],
  );
  assert.ok(miniPaidPlans.every((plan) => plan.slug !== "preview"));
});

test("every Mini plan uses canonical limits and known entitlements", () => {
  assert.deepEqual(
    miniCatalog.plans.map((plan) => plan.key),
    [...miniPlanKeys],
  );

  const allowedEntitlements = new Set<string>(miniEntitlementKeys);
  for (const plan of miniCatalog.plans) {
    assert.deepEqual(
      Object.keys(plan.limits)
        .filter((key) => miniLimitKeys.includes(key as (typeof miniLimitKeys)[number]))
        .sort(),
      [...miniLimitKeys].sort(),
    );
    for (const key of miniLimitKeys) {
      assert.ok(Number.isSafeInteger(plan.limits[key]));
      assert.ok(plan.limits[key] >= 0);
    }
    assert.equal(new Set(plan.entitlements).size, plan.entitlements.length);
    assert.ok(plan.entitlements.every((key) => allowedEntitlements.has(key)));
  }
});

test("Infrastructure exposes only the approved three custom-build paths", () => {
  assert.deepEqual(
    infrastructureCatalog.plans.map((plan) => plan.slug),
    ["foundation", "growth", "custom-infrastructure"],
  );
  assert.deepEqual(
    infrastructureCatalog.plans.map((plan) => plan.ctaLabel),
    ["Discuss Foundation", "Discuss Growth", "Book a consultation"],
  );
  assert.deepEqual(
    infrastructureCatalog.plans.map((plan) => plan.name),
    ["Foundation", "Growth", "Enterprise"],
  );

  const [foundation, growth, enterprise] = infrastructureCatalog.plans;
  assert.equal(foundation.price.kind, "starting_at");
  assert.equal(growth.price.kind, "starting_at");
  assert.equal(enterprise.price.kind, "scoped");
  assert.ok("display" in foundation.price);
  assert.ok("display" in growth.price);
  assert.equal(foundation.price.display, "$1,500");
  assert.equal(growth.price.display, "$5,000");
  assert.equal("display" in enterprise.price, false);
});

test("technical provisioning cannot skip required state transitions", () => {
  assert.equal(canTransitionProvisioningState("not_started", "ready"), false);
  assert.equal(canTransitionProvisioningState("not_started", "queued"), true);
  assert.equal(canTransitionProvisioningState("queued", "in_progress"), true);
  assert.equal(canTransitionProvisioningState("in_progress", "ready"), true);
  assert.equal(canTransitionProvisioningState("failed", "ready"), false);
  assert.equal(canTransitionProvisioningState("failed", "queued"), true);
  assert.deepEqual(provisioningTransitions.deprovisioned, []);
});

test("provisioning requires verified identity and a matching payment environment", () => {
  const organizationId = "org_123" as ResolvedOrganizationId;
  const paymentBasis = {
    kind: "verified_payment",
    paymentStatus: "paid",
    event: {
      provider: "candidate-provider",
      providerAccountId: "acct_live",
      environment: "live",
      providerEventId: "event_123",
      eventType: "subscription.payment_confirmed",
      payloadDigest: "sha256:verified-payload",
      providerCustomerId: "customer_123",
      providerSubscriptionId: "subscription_123",
      verifiedAt: "2026-08-27T11:59:00.000Z",
    },
  } satisfies AccessGrantBasis;
  const valid: ProvisioningCommand = {
    resource: {
      organizationId,
      principalId: "user_123",
      membershipId: "member_123",
      resolvedAt: "2026-08-27T11:55:00.000Z",
    },
    environment: "live",
    desiredPlan: {
      key: "mini.agent",
      catalogVersion: "mini-approved-v1",
    },
    desiredEntitlementRevision: 3,
    accessGrantBasis: paymentBasis,
    jobKey: provisioningJobKey(organizationId, 3),
    requestedAt: "2026-08-27T12:00:00.000Z",
  };

  assert.equal(isValidProvisioningCommand(valid), true);
  assert.equal(
    isValidProvisioningCommand({
      ...valid,
      accessGrantBasis: {
        ...paymentBasis,
        event: {
          ...paymentBasis.event,
          environment: "test",
        },
      },
    }),
    false,
  );
  assert.equal(
    isValidProvisioningCommand({ ...valid, jobKey: "browser-selected" }),
    false,
  );
});

test("approved trials must be server-attributed and unexpired", () => {
  const organizationId = "org_trial" as ResolvedOrganizationId;
  const trialBasis = {
    kind: "approved_trial",
    approvalId: "trial_approval_123",
    approvedBy: "server-policy-operator",
    approvedAt: "2026-08-27T11:59:00.000Z",
    expiresAt: "2026-09-10T00:00:00.000Z",
  } satisfies AccessGrantBasis;
  const validTrial: ProvisioningCommand = {
    resource: {
      organizationId,
      principalId: "user_trial",
      membershipId: "member_trial",
      resolvedAt: "2026-08-27T11:55:00.000Z",
    },
    environment: "test",
    desiredPlan: {
      key: "mini.preview",
      catalogVersion: "mini-approved-v1",
    },
    desiredEntitlementRevision: 1,
    accessGrantBasis: trialBasis,
    jobKey: provisioningJobKey(organizationId, 1),
    requestedAt: "2026-08-27T12:00:00.000Z",
  };

  assert.equal(isValidProvisioningCommand(validTrial), true);
  assert.equal(
    isValidProvisioningCommand({
      ...validTrial,
      accessGrantBasis: {
        ...trialBasis,
        expiresAt: validTrial.requestedAt,
      },
    }),
    false,
  );
});

test("provisioning job keys are deterministic by tenant and revision", () => {
  const organizationId = "org_123" as ResolvedOrganizationId;
  assert.equal(
    provisioningJobKey(organizationId, 7),
    "org_123:entitlements:7",
  );
});

test("usage reservations reject invalid units, revisions, and periods", () => {
  const valid: UsageReservation = {
    resource: {
      organizationId: "org_123" as ResolvedOrganizationId,
      principalId: "user_123",
      membershipId: "member_123",
      resolvedAt: "2026-08-27T12:00:00.000Z",
    },
    entitlementRevision: 3,
    limitKey: "active_records",
    units: 1,
    idempotencyKey: "create-lead:123",
    billingPeriodStart: "2026-08-01T00:00:00.000Z",
    billingPeriodEnd: "2026-09-01T00:00:00.000Z",
  };

  assert.equal(isValidUsageReservation(valid), true);
  assert.equal(isValidUsageReservation({ ...valid, units: 0 }), false);
  assert.equal(isValidUsageReservation({ ...valid, entitlementRevision: 0 }), false);
  assert.equal(
    isValidUsageReservation({
      ...valid,
      billingPeriodEnd: valid.billingPeriodStart,
    }),
    false,
  );
});
