import { NextResponse } from "next/server";
import { applyProvisionReport, bearerMatches, workspaceLedger } from "@/lib/workspaceProvision";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Companion provisioner callback. It can only update a session this site
 * already entitled. A missing token keeps the route closed.
 */
export async function POST(request: Request) {
  const expected = process.env.WORKSPACE_PROVISIONER_TOKEN?.trim() ?? "";
  if (!expected) {
    return NextResponse.json({ error: "Provisioner is not configured" }, { status: 503 });
  }
  if (!bearerMatches(request.headers.get("authorization") ?? "", expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid report" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid report" }, { status: 400 });
  }

  const report = body as { session_id?: unknown; phase?: unknown; login_url?: unknown };
  const sessionId = typeof report.session_id === "string" ? report.session_id : "";
  const phase = report.phase === "ready" || report.phase === "failed" || report.phase === "pending" ? report.phase : null;
  if (!sessionId || !phase) {
    return NextResponse.json({ error: "Invalid report" }, { status: 400 });
  }

  const result = applyProvisionReport(workspaceLedger, {
    sessionId,
    phase,
    loginUrl: typeof report.login_url === "string" ? report.login_url : undefined,
  });
  return NextResponse.json(result.body, { status: result.status });
}
