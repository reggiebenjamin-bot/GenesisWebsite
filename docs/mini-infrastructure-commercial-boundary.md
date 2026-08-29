# G-Core Mini and Genesis Infrastructure boundary

Status: architecture preparation only. No authentication, checkout, billing,
provisioning, or customer access is enabled by this repository.

## Product boundary

| | G-Core Mini | Genesis Infrastructure |
|---|---|---|
| Product | Standardized subscription software | Customer-specific assessment, implementation, and managed service |
| Buyer | Independent real-estate agent or small team | Brokerage, lender, acquisitions team, builder, or complex operator |
| Motion | Future account, hosted checkout, guided onboarding | Consultation, written scope, implementation, launch, support |
| Custom work | Not included in the subscription | Central to the engagement |
| Public action today | Read the product preview or email about the beta | Submit the Infrastructure consultation form |

Mini is not a lower-priced Infrastructure engagement. Infrastructure is not a
larger Mini plan. The catalogs and conversion paths remain separate in code.

The Mini catalog has an explicit publication invariant: every plan must be
marked non-provisional and carry attributable approval metadata before public
mode can render prices or limits. Development and approved review deployments
may show the draft catalog, while an ordinary production build holds it back.

## Recommended deployable structure

Use separate deployables sharing a versioned FastAPI/OpenAPI contract:

```text
www.geai.us             app.geai.us                   api.geai.us/v1
marketing website       Mini application              authoritative FastAPI
public content          identity + product UI         tenants + data + policy
/api/consultation only  Clerk session boundary        billing + entitlements
```

This marketing repository has one public consultation proxy and a root layout
that always renders marketing navigation and footer. It has no dashboard,
authentication, billing, database, ORM, or FastAPI code. Placing the product
here now would couple releases and require restructuring every marketing route.

The Mini application may move into a monorepo later, but the domain and `/v1`
contract should remain stable so marketing, product, and API deployments can be
rolled back independently.

Proposed route ownership, subject to dashboard and DNS approval:

| Surface | Routes |
|---|---|
| Apex | `geai.us` returns a permanent redirect to `www.geai.us` |
| Marketing | `www.geai.us/*`, including `/mini`, `/pricing`, `/contact`, and the existing `/api/consultation` Infrastructure proxy |
| Mini identity | `app.geai.us/sign-in`, `/accept-invitation/*`, and `/onboarding` |
| Mini product | `app.geai.us/dashboard/*` and `/settings/billing` |
| FastAPI account | `api.geai.us/healthz`, `/v1/me`, `/v1/me/entitlements`, and `/v1/me/provisioning` |
| FastAPI billing | `/v1/billing/checkout-sessions`, `/v1/billing/portal-sessions`, and `/v1/webhooks/{provider}` |

These paths are architectural recommendations, not routes created by this
task. Once approved, keep the contract stable even if the repositories later
move into one monorepo.

## Authentication boundary

- Clerk should run in the Mini application, not this marketing application.
- Clerk establishes identity and organization membership; it is not the source
  of paid entitlement truth.
- The Mini frontend checks the session on every protected page, action, and
  route handler. A Next.js proxy is only an early navigation boundary.
- FastAPI independently verifies the bearer JWT signature, issuer, audience,
  authorized party, expiry, and organization mapping.
- Organization and customer identifiers are derived from verified server state,
  never accepted from browser state or query parameters.

## Billing-provider boundary

The billing provider is not approved. Stripe is only a candidate. No provider
SDK or secret belongs in this repository until the provider and staging account
are approved.

The future provider adapter must expose hosted checkout, billing-portal, signed
webhook verification, subscription retrieval, and reconciliation without
putting provider price IDs into the UI. Provider price IDs map server-side to a
stable Mini plan key plus immutable catalog version.

## Signed webhook and provisioning flow

1. The customer selects a Mini plan.
2. The Mini application completes Clerk sign-in or account creation.
3. For a paid plan, a server endpoint creates a hosted checkout session from an
   allow-listed plan key. The browser never supplies an arbitrary price or
   billing-customer ID.
4. The billing provider calls the FastAPI webhook. FastAPI verifies the
   signature against the unmodified request body before parsing it.
5. A unique `(provider, provider_account, environment, event_id)` record makes
   webhook processing idempotent and distinguishes test events from live ones.
6. In one transaction, the backend updates the subscription, derives the next
   entitlement revision, and writes an outbox provisioning job.
7. A provisioning worker creates or updates only product resources and records
   the applied entitlement revision, using the deterministic job key
   `(organization_id, desired_entitlement_revision)`. Identity resolution has
   already created or resolved the tenant and membership before checkout; the
   verified webhook transaction owns subscription and desired-entitlement data.
8. Access becomes active only after verified payment or approved trial state
   and successful provisioning. A checkout-success URL never grants access.
9. Upgrades, downgrades, cancellations, and failed payments update the same
   subscription and entitlement records through signed events and periodic
   reconciliation.

Identity, billing, entitlement, and provisioning are separate state axes.
`SubscriptionStatus` records provider-derived billing state,
`EntitlementStatus` records access policy, and the provisioning worker uses the
following technical lifecycle:

```text
not_started → queued → in_progress → ready
                         ↘ failed → queued
ready | failed → deprovisioning → deprovisioned
                         ↘ deprovisioning_failed → deprovisioning
```

A worker may enter `queued` only from a server-created command containing a
verified-payment event or an approved-trial record. A state transition by itself
never authorizes access. Upgrades and downgrades preserve `currentPlan` while a
`pendingPlan` and desired entitlement revision are provisioned; the applied
revision advances only after the worker succeeds.

## Entitlements and usage

- FastAPI and its relational database are authoritative for tenants,
  memberships, billing-customer mappings, subscriptions, entitlements, usage,
  webhook events, and provisioning jobs.
- One versioned, server-owned plan catalog defines baseline seats, records,
  pipelines, Genesis work units, reports, integrations, and support. Stable
  keys such as `mini.agent` do not carry a version suffix; each subscription
  persists the exact immutable catalog version used for its terms.
- The UI may explain a limit, but every data and usage operation enforces it on
  the server.
- Usage reservations and billing operations require idempotency keys.
- User-command idempotency is scoped by tenant, operation, and key. Webhook
  identity includes provider account and environment. Provisioning job keys
  are derived server-side from tenant and desired entitlement revision.
- A downgrade or over-limit state never deletes customer data. Preserve read
  and export access, explain the restriction, and block only new records or
  premium usage until the account is under the limit or upgraded.
- Failed payments use an approved grace/restricted-mode policy. Billing and
  export access remain reachable while product entitlements are suspended.

## Account and billing management

The future protected account area should display the current plan, entitlement
revision, usage against limits, renewal state, invoices, and hosted
plan-management access. It reads authoritative state from FastAPI. It must not
infer access from a checkout return URL, local storage, hidden UI, Clerk
metadata, or a live billing-provider lookup alone.

## Dashboard and API integration

- Keep the existing dashboard where it is during this stage. Do not copy its
  repository or another product's database, fixtures, credentials, roles, branding, or
  internal operating rules into this site.
- FastAPI remains authoritative. The Mini application uses a generated,
  versioned TypeScript client derived from FastAPI's OpenAPI document.
- `lib/commerce/plan-contract.ts` and `contracts.ts` are review scaffolds. The
  eventual generated contract replaces them as the authority; the marketing
  catalog remains a display projection and never determines access.
- Server Components call fixed FastAPI endpoints with a short-lived user token.
  Browser mutations go through narrow same-origin actions or route handlers;
  there is no generic proxy and no direct database access.
- Direct browser-to-API access is reserved for an approved streaming need, with
  bearer authentication and an exact CORS allowlist.
- Share only stable brand tokens, logo assets, and small UI primitives through
  a versioned package later. The marketing header, footer, hero, and page shell
  stay marketing-specific.

## Environment-variable names

Current marketing variables remain:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SITE_INDEXABLE
GENESIS_CONSULTATION_WEBHOOK_URL
MINI_CATALOG_REVIEW_MODE
```

Future dashboard and API names are listed in
`lib/commerce/environment.ts`. They are names only; this scaffold does not read
secrets or enable the integrations.

## Decisions requiring Graham/Reggie approval

1. Public product name and first Mini customer niche.
2. Trial, invite-only beta, or permanent free-plan policy.
3. Final Mini prices, limits, upgrade triggers, and variable-cost treatment.
4. Approved billing provider and the organization responsible for refunds,
   disputes, support, privacy requests, and incidents.
5. Clerk organization/membership policy and account-ownership model.
6. Failed-payment grace, cancellation, retention, export, deletion, downgrade,
   proration, and refund rules.
7. Which integrations and outbound actions are allowed in the first beta.
8. Legal approval for terms, privacy, brokerage independence, communication
   consent, and AI disclosures.
9. Production domains and ownership of DNS, deployments, and on-call response.
10. What post-launch support is included with each Infrastructure build.

## Safe implementation sequence

1. Approve the product decisions and keep all feature flags disabled.
2. Define the FastAPI OpenAPI schemas and tenant-safe persistence model.
3. Implement Clerk in the separate Mini application and JWT verification in
   FastAPI; prove negative cross-tenant tests.
4. Implement the server entitlement read path and usage reservations.
5. Approve a billing provider; implement signed staging webhooks,
   reconciliation, and the idempotent provisioning outbox.
6. Add account/billing management and hosted checkout in staging.
7. Run security, restore, deletion, export, billing, mobile, and rollback tests.
8. Publish Mini plans and enable production access only after the release gate
   is approved.
