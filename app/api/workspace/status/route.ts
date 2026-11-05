import { NextResponse } from "next/server";
import { statusForSession, workspaceLedger } from "@/lib/workspaceProvision";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One buyer's workspace state. The Checkout Session id is the capability.
 * The body never includes another session, a customer, or the shared pod.
 */
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim() ?? "";
  const status = statusForSession(workspaceLedger, sessionId);
  return NextResponse.json(status, {
    headers: { "Cache-Control": "no-store" },
  });
}
