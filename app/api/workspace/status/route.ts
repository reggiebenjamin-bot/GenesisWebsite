import { NextResponse } from "next/server";
import { welcomeWorkspaceView } from "@/lib/welcomeView";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Owner status for one checkout. With the site's own sign in, a visitor who is
 * not the checkout owner gets no login URL. Without it (geai.us today), the
 * session holder is the owner; see siteHasOwnSignIn.
 */
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim() ?? "";
  if (!/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId)) {
    return NextResponse.json({ phase: "unconfirmed", loginUrl: null }, { headers: { "Cache-Control": "no-store" } });
  }
  const view = await welcomeWorkspaceView(sessionId);
  return NextResponse.json(
    { phase: view.phase, loginUrl: view.loginUrl, planName: view.phase === "sign_in" ? "" : view.planName },
    { headers: { "Cache-Control": "no-store" } },
  );
}
