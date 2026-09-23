import { faqs, toolFaqs } from "./content.ts";
import { genesisTools, neverFabricated, toolJourney, type GenesisTool, type ToolId } from "./offers.ts";

/*
 * What each tool's own page says, beyond the offer data it is built from.
 * Every sentence restates the approved copy: the definitions are the tools
 * page's description of each tool, opened with what it is and who makes it,
 * and the limits are the ones the copy states. Nothing is added to make a
 * page rank: a page that claimed more than the tool does would be worse for
 * search engines, not better.
 */

export type ToolFact = { label: string; value: string };
export type ToolFaq = { question: string; answer: string };

export type ToolPage = {
  tool: GenesisTool;
  /** The one-sentence answer to "what is it?", naming Genesis AI as the maker, then the tool in full. */
  definition: string;
  /** The fact block: plain labels and plain values, for people and for retrieval. */
  facts: readonly ToolFact[];
  faqs: readonly ToolFaq[];
};

const allFaqs: readonly ToolFaq[] = [...toolFaqs, ...faqs];

function faq(question: string): ToolFaq {
  const found = allFaqs.find((candidate) => candidate.question === question);
  if (!found) throw new Error(`No approved answer for "${question}"`);
  return { question: found.question, answer: found.answer };
}

const sameAsManaged = faq("Are Genesis Tools the same as a Managed AI plan?");
const whatIsGenesis = faq("What is Genesis?");

function tool(id: ToolId): GenesisTool {
  const found = genesisTools.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`Unknown tool ${id}`);
  return found;
}

const price = (item: GenesisTool) =>
  `${item.price.display} per ${item.price.detail ?? item.price.unit}${
    item.price.cadence === "monthly" ? ", recurring" : ""
  }`;

const list = (items: readonly string[]) => items.join(", ");

const dealArchitect = tool("deal-architect");
const dealPackager = tool("deal-packager");
const capitalAdvisor = tool("capital-advisor");

export const toolPages: Readonly<Record<ToolId, ToolPage>> = {
  "deal-architect": {
    tool: dealArchitect,
    definition:
      "Deal Architect is a real estate deal analysis tool from Genesis AI. It structures the transaction around the information that matters, performs deterministic calculations from your inputs, identifies missing information and risk flags, and helps frame the questions and next actions that deserve attention.",
    facts: [
      { label: "Product", value: "Deal Architect" },
      { label: "Made by", value: "Genesis AI" },
      { label: "Category", value: "Real estate deal analysis" },
      { label: "For", value: dealArchitect.primaryUsers ?? "" },
      { label: "Price", value: price(dealArchitect) },
      { label: "Primary job", value: dealArchitect.purpose },
      {
        label: "Calculated with formulas",
        value: "The financial metrics that can be calculated, deterministically, from your inputs.",
      },
      {
        label: "AI is used for",
        value:
          "Interpreting the deal: identifying missing information and risk flags, and framing the questions and next actions that deserve attention.",
      },
      {
        label: "Never invented",
        value: `${list(neverFabricated)}. Information that has not been supplied is reported as missing rather than guessed.`,
      },
    ],
    faqs: [faq("Does Deal Architect invent missing deal information?"), sameAsManaged, whatIsGenesis],
  },
  "deal-packager": {
    tool: dealPackager,
    definition:
      "Deal Packager is a real estate deal presentation tool from Genesis AI. It organizes the property, project, financial story, strategy, evidence, and supporting documents into a clear package for the audience you choose.",
    facts: [
      { label: "Product", value: "Deal Packager" },
      { label: "Made by", value: "Genesis AI" },
      { label: "Category", value: "Real estate deal presentation" },
      { label: "Price", value: price(dealPackager) },
      { label: "Primary job", value: dealPackager.purpose },
      { label: "Can produce", value: list(dealPackager.outputs ?? dealPackager.highlights) },
      { label: "Does not", value: "Invent evidence, promise approval, or make the recipient's decision." },
    ],
    faqs: [faq("Does Deal Packager invent evidence or guarantee a response?"), sameAsManaged, whatIsGenesis],
  },
  "capital-advisor": {
    tool: capitalAdvisor,
    definition:
      "Capital Advisor is a real estate capital-planning tool from Genesis AI. It reviews the financing assumptions you provide, organizes sources and uses, surfaces readiness gaps, and prepares a clear capital request.",
    facts: [
      { label: "Product", value: "Capital Advisor" },
      { label: "Made by", value: "Genesis AI" },
      { label: "Category", value: "Real estate capital planning" },
      { label: "Price", value: price(capitalAdvisor) },
      { label: "Primary job", value: capitalAdvisor.purpose },
      { label: "Can produce", value: list(capitalAdvisor.outputs ?? capitalAdvisor.highlights) },
      { label: capitalAdvisor.structure.label, value: list(capitalAdvisor.structure.steps) },
      { label: "Does not", value: "Quote live rates, promise terms, approve financing, or replace a licensed professional." },
    ],
    faqs: [faq("Does Capital Advisor provide live lender terms or loan approval?"), sameAsManaged, whatIsGenesis],
  },
};

export function isToolId(value: string): value is ToolId {
  return genesisTools.some((candidate) => candidate.id === value);
}

/** Neighboring products in the catalog. No product is a required first or next step. */
export function journeyAround(id: ToolId) {
  const index = toolJourney.findIndex((step) => step.tool === id);
  return {
    step: toolJourney[index],
    previous: index > 0 ? toolJourney[index - 1] : null,
    next: index < toolJourney.length - 1 ? toolJourney[index + 1] : null,
  };
}
