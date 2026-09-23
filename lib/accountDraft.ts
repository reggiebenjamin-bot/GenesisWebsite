import type { WorkspaceToolId } from "./toolWorkspace.ts";
import { WORKSPACE_DRAFT_VERSION } from "./workspaceDraft.ts";

// Guest drafts expire after 30 days on the device; account drafts expire after
// one year without an edit, including if the Clerk account is later removed.
export const ACCOUNT_DRAFT_TTL_SECONDS = 365 * 24 * 60 * 60;
export const ACCOUNT_DRAFT_MAX_BYTES = 64 * 1024;

export type AccountDraft = {
  version: typeof WORKSPACE_DRAFT_VERSION;
  toolId: WorkspaceToolId;
  revision: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  data: Record<string, string | boolean>;
};

const draftFields: Record<WorkspaceToolId, Record<string, "string" | "boolean">> = {
  "deal-architect": {
    projectName: "string", strategy: "string", address: "string", purchasePrice: "string",
    closingCosts: "string", rehabCost: "string", carryingCosts: "string",
    sellingCosts: "string", resaleValue: "string", holdMonths: "string", notes: "string",
  },
  "deal-packager": {
    projectName: "string", audience: "string", assetType: "string", location: "string",
    strategy: "string", status: "string", summary: "string", askingPrice: "string",
    valueEstimate: "string", rehabCost: "string", nextAction: "string",
    contactName: "string", contactEmail: "string", photosReady: "boolean",
    budgetReady: "boolean", compsReady: "boolean", contractReady: "boolean",
  },
  "capital-advisor": {
    projectName: "string", purpose: "string", assetType: "string", totalUses: "string",
    propertyValue: "string", requestedDebt: "string", availableCash: "string",
    interestRate: "string", termMonths: "string", monthlyNoi: "string",
    exitStrategy: "string", entityDocuments: "boolean", exitEvidence: "boolean",
    projectBudget: "boolean",
  },
};

export function isWorkspaceToolId(value: string): value is WorkspaceToolId {
  return Object.hasOwn(draftFields, value);
}

export function normalizeAccountDraftData(
  toolId: WorkspaceToolId,
  value: unknown,
): Record<string, string | boolean> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const fields = draftFields[toolId];
  const result: Record<string, string | boolean> = {};

  for (const [key, fieldValue] of Object.entries(input)) {
    if (!Object.hasOwn(fields, key) || typeof fieldValue !== fields[key]) return null;
    if (typeof fieldValue === "string" && fieldValue.length > 16_000) return null;
    result[key] = fieldValue as string | boolean;
  }

  return new TextEncoder().encode(JSON.stringify(result)).byteLength <= ACCOUNT_DRAFT_MAX_BYTES
    ? result
    : null;
}

export function accountDraftKey(userId: string, toolId: WorkspaceToolId) {
  return `genesis:account-draft:v${WORKSPACE_DRAFT_VERSION}:${userId}:${toolId}`;
}

export function decodeAccountDraft(value: unknown, toolId: WorkspaceToolId): AccountDraft | null {
  let parsed: unknown = value;
  if (typeof value === "string") {
    try { parsed = JSON.parse(value); } catch { return null; }
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const draft = parsed as Partial<AccountDraft>;
  const data = normalizeAccountDraftData(toolId, draft.data);
  if (
    draft.version !== WORKSPACE_DRAFT_VERSION || draft.toolId !== toolId ||
    typeof draft.revision !== "string" || !draft.revision ||
    typeof draft.createdAt !== "number" || !Number.isFinite(draft.createdAt) ||
    typeof draft.updatedAt !== "number" || !Number.isFinite(draft.updatedAt) ||
    typeof draft.expiresAt !== "number" || !Number.isFinite(draft.expiresAt) ||
    !data
  ) return null;
  return { ...draft, data } as AccountDraft;
}

export function draftsDiffer(
  local: Record<string, unknown>,
  remote: Record<string, unknown>,
  initial: Record<string, unknown>,
) {
  const changed = (draft: Record<string, unknown>) =>
    Object.keys(initial).some((key) => draft[key] !== initial[key]);
  return changed(local) && Object.keys(initial).some((key) => local[key] !== remote[key]);
}
