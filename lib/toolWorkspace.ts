import { genesisTools } from "./offers.ts";

export const workspaceToolIds = [
  "deal-architect",
  "deal-packager",
  "capital-advisor",
] as const;

export type WorkspaceToolId = (typeof workspaceToolIds)[number];

export type WorkspaceTool = {
  id: WorkspaceToolId;
  number: string;
  eyebrow: string;
  name: string;
  shortName: string;
  promise: string;
  price: number;
  unit: string;
  landingPath: `/tools/${WorkspaceToolId}`;
  workspacePath: `/workspace/${WorkspaceToolId}`;
  heroImage: `/images/products/${string}`;
};

function priceFor(id: WorkspaceToolId): number {
  const tool = genesisTools.find((candidate) => candidate.id === id);
  if (!tool) throw new Error(`Unknown priced tool: ${id}`);
  return tool.price.amountUsd[0];
}

export const workspaceTools: readonly WorkspaceTool[] = [
  {
    id: "deal-architect",
    number: "01",
    eyebrow: "Evaluate",
    name: "Deal Architect",
    shortName: "Architect",
    promise: "Understand whether the deal holds up before you commit.",
    price: priceFor("deal-architect"),
    unit: "analysis",
    landingPath: "/tools/deal-architect",
    workspacePath: "/workspace/deal-architect",
    heroImage: "/images/products/deal-architect-hero.webp",
  },
  {
    id: "deal-packager",
    number: "02",
    eyebrow: "Present",
    name: "Deal Packager",
    shortName: "Packager",
    promise: "Turn scattered deal details into one package people can review.",
    price: priceFor("deal-packager"),
    unit: "package",
    landingPath: "/tools/deal-packager",
    workspacePath: "/workspace/deal-packager",
    heroImage: "/images/products/deal-packager-hero.webp",
  },
  {
    id: "capital-advisor",
    number: "03",
    eyebrow: "Finance",
    name: "Capital Advisor",
    shortName: "Advisor",
    promise: "Review your capital plan before you make the ask.",
    price: priceFor("capital-advisor"),
    unit: "capital plan",
    landingPath: "/tools/capital-advisor",
    workspacePath: "/workspace/capital-advisor",
    heroImage: "/images/products/capital-advisor-hero.webp",
  },
] as const;

export function isWorkspaceToolId(value: string): value is WorkspaceToolId {
  return workspaceToolIds.includes(value as WorkspaceToolId);
}

export function getWorkspaceTool(id: WorkspaceToolId): WorkspaceTool {
  const tool = workspaceTools.find((candidate) => candidate.id === id);
  if (!tool) throw new Error(`Unknown workspace tool: ${id}`);
  return tool;
}
