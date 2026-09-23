import { auth } from "@clerk/nextjs/server";
import { isWorkspaceToolId, normalizeAccountDraftData } from "@/lib/accountDraft";
import {
  accountDraftStoreConfigured,
  deleteAccountDraft,
  getAccountDraft,
  saveAccountDraft,
} from "@/lib/accountDraftStore";

export const runtime = "nodejs";

const noStore = { "Cache-Control": "private, no-store" };
type Context = { params: Promise<{ tool: string }> };

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: noStore });
}

async function identify(context: Context) {
  const { tool } = await context.params;
  if (!isWorkspaceToolId(tool)) return { error: json({ error: "Unknown product" }, 404) };
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    return { error: json({ error: "Account access is not configured" }, 503) };
  }
  const { userId } = await auth();
  if (!userId) return { error: json({ error: "Sign in to save this draft" }, 401) };
  if (!accountDraftStoreConfigured()) {
    return { error: json({ error: "Account storage is not configured" }, 503) };
  }
  return { tool, userId };
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

async function bodyFrom(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return null;
  if (Number(request.headers.get("content-length")) > 70_000) return null;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > 70_000) return null;
    const value: unknown = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

export async function GET(_request: Request, context: Context) {
  const identity = await identify(context);
  if ("error" in identity) return identity.error;
  try {
    return json({ draft: await getAccountDraft(identity.userId, identity.tool) });
  } catch {
    return json({ error: "Could not load your account draft" }, 503);
  }
}

export async function PUT(request: Request, context: Context) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin" }, 403);
  const identity = await identify(context);
  if ("error" in identity) return identity.error;
  const body = await bodyFrom(request);
  const data = normalizeAccountDraftData(identity.tool, body?.data);
  const revision = body?.expectedRevision;
  if (!data || !(revision === null || (typeof revision === "string" && /^[0-9a-f-]{36}$/.test(revision)))) {
    return json({ error: "Invalid draft" }, 400);
  }
  try {
    const result = await saveAccountDraft(identity.userId, identity.tool, data, revision);
    return json(result, result.state === "conflict" ? 409 : 200);
  } catch {
    return json({ error: "Could not save your account draft" }, 503);
  }
}

export async function DELETE(request: Request, context: Context) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin" }, 403);
  const identity = await identify(context);
  if ("error" in identity) return identity.error;
  const body = await bodyFrom(request);
  const revision = body?.expectedRevision;
  if (!(revision === null || (typeof revision === "string" && /^[0-9a-f-]{36}$/.test(revision)))) {
    return json({ error: "Invalid draft revision" }, 400);
  }
  try {
    const result = await deleteAccountDraft(identity.userId, identity.tool, revision);
    return json(result, result.state === "conflict" ? 409 : 200);
  } catch {
    return json({ error: "Could not clear your account draft" }, 503);
  }
}
