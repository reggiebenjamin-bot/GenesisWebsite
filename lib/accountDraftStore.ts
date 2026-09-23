import { Redis } from "@upstash/redis";
import {
  ACCOUNT_DRAFT_TTL_SECONDS,
  accountDraftKey,
  decodeAccountDraft,
  type AccountDraft,
} from "./accountDraft";
import type { WorkspaceToolId } from "./toolWorkspace";

const saveIfCurrent = `
  local current = redis.call('GET', KEYS[1])
  if current then
    local existing = cjson.decode(current)
    if existing.revision ~= ARGV[1] then return 0 end
  elseif ARGV[1] ~= '' then
    return 0
  end
  redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])
  return 1
`;

const deleteIfCurrent = `
  local current = redis.call('GET', KEYS[1])
  if current then
    local existing = cjson.decode(current)
    if existing.revision ~= ARGV[1] then return 0 end
    redis.call('DEL', KEYS[1])
  elseif ARGV[1] ~= '' then
    return 0
  end
  return 1
`;

let redis: Redis | null = null;

export function accountDraftStoreConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getRedis() {
  if (!accountDraftStoreConfigured()) throw new Error("Account draft storage is not configured");
  redis ??= Redis.fromEnv();
  return redis;
}

export async function getAccountDraft(userId: string, toolId: WorkspaceToolId) {
  const value = await getRedis().get<unknown>(accountDraftKey(userId, toolId));
  if (value === null) return null;
  const draft = decodeAccountDraft(value, toolId);
  if (!draft) throw new Error("Stored account draft is invalid");
  return draft;
}

export async function saveAccountDraft(
  userId: string,
  toolId: WorkspaceToolId,
  data: AccountDraft["data"],
  expectedRevision: string | null,
): Promise<{ state: "saved"; draft: AccountDraft } | { state: "conflict"; draft: AccountDraft | null }> {
  const current = await getAccountDraft(userId, toolId);
  const now = Date.now();
  const draft: AccountDraft = {
    version: 2,
    toolId,
    revision: crypto.randomUUID(),
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
    expiresAt: now + ACCOUNT_DRAFT_TTL_SECONDS * 1000,
    data,
  };
  const result = await getRedis().eval(
    saveIfCurrent,
    [accountDraftKey(userId, toolId)],
    [expectedRevision ?? "", JSON.stringify(draft), ACCOUNT_DRAFT_TTL_SECONDS],
  );
  return result === 1
    ? { state: "saved", draft }
    : { state: "conflict", draft: await getAccountDraft(userId, toolId) };
}

export async function deleteAccountDraft(
  userId: string,
  toolId: WorkspaceToolId,
  expectedRevision: string | null,
): Promise<{ state: "deleted" } | { state: "conflict"; draft: AccountDraft | null }> {
  const result = await getRedis().eval(
    deleteIfCurrent,
    [accountDraftKey(userId, toolId)],
    [expectedRevision ?? ""],
  );
  return result === 1
    ? { state: "deleted" }
    : { state: "conflict", draft: await getAccountDraft(userId, toolId) };
}
