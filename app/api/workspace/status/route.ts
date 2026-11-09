import { NextResponse } from "next/server";
import { openConfiguredStore, ownerWorkspaceView } from "@/lib/workspaceProvision";
import { readClerkPrincipal } from "@/lib/workspaceOwner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Owner status for one checkout. The session id selects the row. It does not
 * authorize the login. A visitor who is not the checkout owner gets no login
 * URL and this route does not call the workspace status host for them.
 */
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim() ?? "";
  if (!/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId)) {
    return NextResponse.json({ phase: "unconfirmed", loginUrl: null }, { headers: { "Cache-Control": "no-store" } });
  }
  const store = openConfiguredStore();
  if (!store) {
    return NextResponse.json(
      { phase: "unconfirmed", loginUrl: null },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  try {
    const principal = await readClerkPrincipal();
    const view = await ownerWorkspaceView({
      store,
      sessionId,
      principal,
      fetchImpl: principal ? fetch : undefined,
    });
    return NextResponse.json(
      { phase: view.phase, loginUrl: view.loginUrl, planName: view.phase === "sign_in" ? "" : view.planName },
      { headers: { "Cache-Control": "no-store" } },
    );
  } finally {
    store.close();
  }
}
