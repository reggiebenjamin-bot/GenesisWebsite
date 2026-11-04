import type { GenesisTool, ToolId } from "./offers.ts";

/**
 * Stripe Checkout for the one-time Genesis Tools add-ons ($49, $99, $79).
 *
 * The approved amounts live in the site copy (lib/offers.ts), so the checkout
 * drives the price from there: a configured Stripe Price id is used when one is
 * set, and otherwise a one-time line item is built inline from the copy amount,
 * tagged `source=geai_site`. That keeps the charge equal to the price printed
 * on the page and lets a stable Price id take over later with no code change.
 *
 * No path aliases in this file: tests import it directly under Node.
 */

/** Env names that can supply a stable one-time Price id per tool. */
export const toolPriceEnv: Record<ToolId, string> = {
  "deal-architect": "STRIPE_PRICE_TOOL_DEAL_ARCHITECT",
  "deal-packager": "STRIPE_PRICE_TOOL_DEAL_PACKAGER",
  "capital-advisor": "STRIPE_PRICE_TOOL_CAPITAL_ADVISOR",
};

export function toolPriceId(
  tool: ToolId,
  env: Record<string, string | undefined> = process.env,
): string | null {
  const value = env[toolPriceEnv[tool]]?.trim() ?? "";
  if (!value || /placeholder/i.test(value) || !value.startsWith("price_")) return null;
  return value;
}

export type ToolLineItem =
  | { price: string; quantity: 1 }
  | {
      quantity: 1;
      price_data: {
        currency: "usd";
        unit_amount: number;
        product_data: { name: string; metadata: { source: "geai_site"; tool: ToolId } };
      };
    };

/**
 * One Checkout line item for a tool: a configured Price id when present,
 * otherwise a one-time inline price built from the site copy amount.
 */
export function toolLineItem(
  tool: GenesisTool,
  env: Record<string, string | undefined> = process.env,
): ToolLineItem {
  const priceId = toolPriceId(tool.id, env);
  if (priceId) return { price: priceId, quantity: 1 };
  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: tool.price.amountUsd[0] * 100,
      product_data: {
        name: `Genesis ${tool.name}`,
        metadata: { source: "geai_site", tool: tool.id },
      },
    },
  };
}

/** Stable Checkout label. The last eight letters are the tracking suffix. */
export const TOOLS_CHECKOUT_INTEGRATION_ID = "genesis_tools_zjpmkrwd";
