/** Shared offers. The same prices for every vertical. Full price only. */

export type PriceLevel = { setup: string; monthly: string };

export type Offer = {
  id: string;
  name: string;
  summary: string;
  levels: readonly { id: string; label: string; price: PriceLevel }[];
};

const levels = ["Level 01", "Level 02", "Level 03"] as const;

function offer(
  id: string,
  name: string,
  summary: string,
  prices: readonly PriceLevel[],
): Offer {
  return {
    id,
    name,
    summary,
    levels: prices.map((price, index) => ({
      id: `level_0${index + 1}`,
      label: levels[index] ?? "Level",
      price,
    })),
  };
}

export const offers: readonly Offer[] = [
  offer("inbox_routing", "Inbox Routing", "Puts business messages in one place.", [
    { setup: "$500", monthly: "$297" },
    { setup: "$1,000", monthly: "$597" },
    { setup: "$1,500", monthly: "$997" },
  ]),
  offer("lead_flow", "Lead Flow", "Moves new inquiries into a single flow.", [
    { setup: "$1,000", monthly: "$497" },
    { setup: "$2,000", monthly: "$997" },
    { setup: "$3,500", monthly: "$1,497" },
  ]),
  offer("agent_website", "Agent Website", "A site that captures inquiries for the business.", [
    { setup: "$750", monthly: "$297" },
    { setup: "$1,500", monthly: "$597" },
    { setup: "$2,500", monthly: "$997" },
  ]),
];

export const priceNote = "Shown at full price. Setup is one time. Monthly is each month.";
