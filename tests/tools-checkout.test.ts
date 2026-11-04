import assert from "node:assert/strict";
import test from "node:test";
import { genesisTools } from "../lib/offers.ts";
import {
  TOOLS_CHECKOUT_INTEGRATION_ID,
  toolLineItem,
  toolPriceEnv,
  toolPriceId,
} from "../lib/toolsCheckout.ts";

test("a configured price id is used and placeholders are ignored", () => {
  assert.equal(toolPriceId("deal-architect", {}), null);
  assert.equal(
    toolPriceId("deal-architect", { STRIPE_PRICE_TOOL_DEAL_ARCHITECT: "price_placeholder" }),
    null,
  );
  assert.equal(
    toolPriceId("deal-architect", { STRIPE_PRICE_TOOL_DEAL_ARCHITECT: "price_123" }),
    "price_123",
  );
  for (const tool of genesisTools) {
    assert.equal(toolPriceEnv[tool.id].startsWith("STRIPE_PRICE_TOOL_"), true);
  }
  assert.match(TOOLS_CHECKOUT_INTEGRATION_ID, /[a-z]{8}$/);
});

test("without a price id the line item is built from the site copy amount", () => {
  for (const tool of genesisTools) {
    const item = toolLineItem(tool, {});
    assert.ok("price_data" in item);
    if ("price_data" in item) {
      assert.equal(item.quantity, 1);
      assert.equal(item.price_data.currency, "usd");
      assert.equal(item.price_data.unit_amount, tool.price.amountUsd[0] * 100);
      assert.equal(item.price_data.product_data.name, `Genesis ${tool.name}`);
      assert.deepEqual(item.price_data.product_data.metadata, {
        source: "geai_site",
        tool: tool.id,
      });
    }
  }
  // The exact approved amounts, in cents.
  assert.deepEqual(
    genesisTools.map((tool) => {
      const item = toolLineItem(tool, {});
      return "price_data" in item ? item.price_data.unit_amount : null;
    }),
    [4900, 9900, 7900],
  );
});

test("with a price id the line item references it directly", () => {
  const [architect] = genesisTools;
  const item = toolLineItem(architect, { STRIPE_PRICE_TOOL_DEAL_ARCHITECT: "price_live_arch" });
  assert.deepEqual(item, { price: "price_live_arch", quantity: 1 });
});
