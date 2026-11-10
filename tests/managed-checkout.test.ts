import assert from "node:assert/strict";
import test from "node:test";
import {
  isManagedPlanId,
  managedPlanById,
  managedPlans,
} from "../lib/offers.ts";
import {
  MANAGED_CHECKOUT_INTEGRATION_ID,
  checkoutLineItems,
  monthlyPriceDefaults,
  monthlyPriceId,
  setupPriceDefaults,
  setupPriceId,
} from "../lib/managedCheckout.ts";
import { resolvePlan } from "../lib/checkoutPlans.ts";
import { priceNumber } from "../lib/schema.ts";

test("each managed plan names its approved one-time setup fee", () => {
  assert.deepEqual(
    managedPlans.map((plan) => [plan.name, plan.setupUsd, plan.setupLine]),
    [
      ["Business Recover", 500, "plus $500 setup"],
      ["Business Grow", 1500, "plus $1,500 setup"],
      ["Business Operate", 5000, "plus $5,000 setup"],
    ],
  );
  for (const plan of managedPlans) {
    assert.equal(priceNumber(plan.setupDisplay), plan.setupUsd);
  }
});

test("checkout resolves the live monthly and setup prices and honors overrides", () => {
  assert.equal(monthlyPriceId("managed-750", {}), "price_1UXBvfFvlby2Ilp1MjEz1mb8");
  assert.equal(monthlyPriceId("managed-1750", {}), "price_1UXBvhFvlby2Ilp1mcGy6QdZ");
  assert.equal(monthlyPriceId("managed-4500", {}), "price_1UXBvjFvlby2Ilp1ZuBKAq3K");

  assert.equal(setupPriceId("managed-750", {}), "price_1UXrITFvlby2Ilp1Bv4gpd6F");
  assert.equal(setupPriceId("managed-1750", {}), "price_1UXrIVFvlby2Ilp1aaxnnH3A");
  assert.equal(setupPriceId("managed-4500", {}), "price_1UXrIRFvlby2Ilp1IZUIRx4p");

  for (const plan of managedPlans) {
    assert.match(monthlyPriceId(plan.id, {}), /^price_/);
    assert.match(setupPriceId(plan.id, {}), /^price_/);
    assert.equal(monthlyPriceId(plan.id, {}), monthlyPriceDefaults[plan.id]);
    assert.equal(setupPriceId(plan.id, {}), setupPriceDefaults[plan.id]);
  }

  assert.equal(
    monthlyPriceId("managed-750", { STRIPE_PRICE_MANAGED_750: "price_override" }),
    "price_override",
  );
  assert.equal(
    setupPriceId("managed-1750", { STRIPE_PRICE_MANAGED_1750_SETUP: "price_setup_override" }),
    "price_setup_override",
  );
  // Placeholders and non price ids fall back to the live default.
  assert.equal(
    monthlyPriceId("managed-4500", { STRIPE_PRICE_MANAGED_4500: "price_placeholder" }),
    monthlyPriceDefaults["managed-4500"],
  );
  assert.equal(
    monthlyPriceId("managed-4500", { STRIPE_PRICE_MANAGED_4500: "not-a-price" }),
    monthlyPriceDefaults["managed-4500"],
  );
});

test("checkout line items are the monthly price then the setup price", () => {
  assert.deepEqual(checkoutLineItems("price_m", "price_s"), [
    { price: "price_m", quantity: 1 },
    { price: "price_s", quantity: 1 },
  ]);
  assert.match(MANAGED_CHECKOUT_INTEGRATION_ID, /[a-z]{8}$/);
});

test("plan ids are guarded and resolve to a name across catalogs", () => {
  assert.equal(isManagedPlanId("managed-750"), true);
  assert.equal(isManagedPlanId("single"), false);
  assert.equal(isManagedPlanId("nope"), false);
  assert.equal(managedPlanById("managed-1750")?.name, "Business Grow");

  assert.deepEqual(resolvePlan("managed-4500"), {
    id: "managed-4500",
    name: "Business Operate",
    kind: "managed",
  });
  assert.deepEqual(resolvePlan("duo"), { id: "duo", name: "Duo", kind: "ai-employees" });
  assert.equal(resolvePlan("unknown"), null);
});

test("managed checkout asks an optional company name that the provisioner reads", async () => {
  const { companyNameField } = await import("../lib/managedCheckout.ts");
  const [field] = companyNameField();
  assert.equal(field.key, "company");
  assert.equal(field.type, "text");
  assert.equal(field.optional, true);
  assert.equal(field.label.custom, "Company name");
  assert.equal(companyNameField().length, 1);
});

test("managed checkout asks a required CRM dropdown after the company name", async () => {
  const { managedCheckoutFields } = await import("../lib/managedCheckout.ts");
  const fields = managedCheckoutFields();
  assert.equal(fields.length, 2);
  assert.ok(fields.length <= 3, "Stripe allows at most three custom fields");
  assert.equal(fields[0].key, "company");
  const crm = fields[1] as {
    key: string;
    type: string;
    optional: boolean;
    label: { custom: string };
    dropdown: { options: { label: string; value: string }[] };
  };
  assert.equal(crm.key, "crm");
  assert.equal(crm.type, "dropdown");
  assert.equal(crm.optional, false);
  assert.equal(crm.label.custom, "What CRM do you use today?");
  assert.deepEqual(
    crm.dropdown.options.map((option) => [option.value, option.label]),
    [
      ["ghl", "GoHighLevel"],
      ["other", "Another CRM"],
      ["none", "None"],
    ],
  );
});
