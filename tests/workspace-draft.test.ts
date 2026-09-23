import assert from "node:assert/strict";
import test from "node:test";
import {
  createWorkspaceDraft,
  readWorkspaceDraft,
  WORKSPACE_DRAFT_TTL_MS,
  workspaceDraftKey,
  writeWorkspaceDraft,
  type StorageLike,
} from "../lib/workspaceDraft.ts";

function memoryStorage() {
  const values = new Map<string, string>();
  const storage: StorageLike = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  return { storage, values };
}

test("workspace drafts use a versioned per-tool key", () => {
  assert.equal(workspaceDraftKey("deal-architect"), "genesis:workspace:draft:v2:deal-architect");
  assert.notEqual(workspaceDraftKey("deal-architect"), workspaceDraftKey("deal-packager"));
});

test("the blank-brief version does not load or erase an older sample-backed draft", () => {
  const { storage, values } = memoryStorage();
  const oldKey = "genesis:workspace:draft:v1:deal-architect";
  const oldDraft = '{"version":1,"data":{"projectName":"Older draft"}}';
  values.set(oldKey, oldDraft);

  assert.deepEqual(readWorkspaceDraft(storage, "deal-architect"), { state: "empty" });
  assert.equal(values.get(oldKey), oldDraft);
});

test("workspace draft expiry slides forward on every write", () => {
  const { storage } = memoryStorage();
  const first = writeWorkspaceDraft(storage, "capital-advisor", { totalUses: "250000" }, 1_000);
  const second = writeWorkspaceDraft(
    storage,
    "capital-advisor",
    { totalUses: "260000" },
    2_000,
    first.createdAt,
  );

  assert.equal(second.createdAt, 1_000);
  assert.equal(second.updatedAt, 2_000);
  assert.equal(second.expiresAt, 2_000 + WORKSPACE_DRAFT_TTL_MS);
});

test("expired and corrupt workspace drafts are removed", () => {
  const { storage, values } = memoryStorage();
  const key = workspaceDraftKey("deal-packager");
  values.set(key, JSON.stringify(createWorkspaceDraft("deal-packager", { title: "A" }, 10)));

  assert.deepEqual(readWorkspaceDraft(storage, "deal-packager", 10 + WORKSPACE_DRAFT_TTL_MS), {
    state: "expired",
  });
  assert.equal(values.has(key), false);

  values.set(key, "not-json");
  assert.deepEqual(readWorkspaceDraft(storage, "deal-packager", 11), { state: "invalid" });
  assert.equal(values.has(key), false);
});

test("a valid workspace draft is loaded only for its own tool", () => {
  const { storage, values } = memoryStorage();
  const key = workspaceDraftKey("deal-architect");
  values.set(key, JSON.stringify(createWorkspaceDraft("deal-packager", { project: "Wrong" }, 50)));

  assert.deepEqual(readWorkspaceDraft(storage, "deal-architect", 60), { state: "invalid" });
  assert.equal(values.has(key), false);
});
