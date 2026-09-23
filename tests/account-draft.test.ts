import assert from "node:assert/strict";
import test from "node:test";
import {
  ACCOUNT_DRAFT_MAX_BYTES,
  ACCOUNT_DRAFT_TTL_SECONDS,
  accountDraftKey,
  decodeAccountDraft,
  draftsDiffer,
  isWorkspaceToolId,
  normalizeAccountDraftData,
} from "../lib/accountDraft.ts";

test("account draft keys isolate users, products, and schema version", () => {
  assert.match(accountDraftKey("user_a", "deal-architect"), /^genesis:account-draft:v2:/);
  assert.notEqual(accountDraftKey("user_a", "deal-architect"), accountDraftKey("user_b", "deal-architect"));
  assert.notEqual(accountDraftKey("user_a", "deal-architect"), accountDraftKey("user_a", "deal-packager"));
  assert.equal(ACCOUNT_DRAFT_TTL_SECONDS, 365 * 24 * 60 * 60);
});

test("only the three known products can be stored", () => {
  assert.equal(isWorkspaceToolId("capital-advisor"), true);
  assert.equal(isWorkspaceToolId("unknown"), false);
});

test("draft fields are type checked and limited to the correct product", () => {
  assert.deepEqual(normalizeAccountDraftData("deal-packager", { projectName: "Oak", photosReady: true }), {
    projectName: "Oak", photosReady: true,
  });
  assert.equal(normalizeAccountDraftData("deal-architect", { photosReady: true }), null);
  assert.equal(normalizeAccountDraftData("deal-packager", { photosReady: "true" }), null);
  assert.equal(normalizeAccountDraftData("deal-packager", { projectName: "x".repeat(16_001) }), null);
  assert.ok(ACCOUNT_DRAFT_MAX_BYTES > 16_000);
});

test("stored records must match the requested product and schema", () => {
  const record = {
    version: 2, toolId: "capital-advisor", revision: "revision", createdAt: 100,
    updatedAt: 200, expiresAt: 300, data: { projectName: "Oak", projectBudget: true },
  };
  assert.deepEqual(decodeAccountDraft(JSON.stringify(record), "capital-advisor"), record);
  assert.equal(decodeAccountDraft(record, "deal-architect"), null);
  assert.equal(decodeAccountDraft({ ...record, version: 1 }, "capital-advisor"), null);
  assert.equal(decodeAccountDraft({ ...record, data: { unknown: "value" } }, "capital-advisor"), null);
});

test("a differing device draft requires an explicit choice", () => {
  const initial = { projectName: "", strategy: "Flip" };
  assert.equal(draftsDiffer(initial, { projectName: "Account", strategy: "Flip" }, initial), false);
  assert.equal(draftsDiffer({ projectName: "Account", strategy: "Flip" }, { projectName: "Account", strategy: "Flip" }, initial), false);
  assert.equal(draftsDiffer({ projectName: "Device", strategy: "Flip" }, { projectName: "Account", strategy: "Flip" }, initial), true);
});
