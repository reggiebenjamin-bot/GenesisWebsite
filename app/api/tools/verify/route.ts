import { NextResponse } from "next/server";
import { isWorkspaceToolId } from "@/lib/toolWorkspace";
import { stripeServer } from "@/lib/stripeServer";

export const dynamic = "force-dynamic";

/**
 * Confirms a completed Genesis Tools Checkout Session so the workspace can
 * unlock the paid result. It returns the tool id only, never any customer
 * detail, and is never cached.
 */
export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim() ?? "";

  if (!sessionId) return NextResponse.json({ paid: false }, { headers });

  const stripe = stripeServer();
  if (!stripe) return NextResponse.json({ paid: false }, { headers });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const tool = typeof session.metadata?.plan === "string" ? session.metadata.plan : "";

    if (
      session.status === "complete" &&
      session.payment_status === "paid" &&
      session.metadata?.kind === "tool" &&
      isWorkspaceToolId(tool)
    ) {
      return NextResponse.json({ paid: true, tool }, { headers });
    }

    return NextResponse.json({ paid: false }, { headers });
  } catch {
    return NextResponse.json({ paid: false }, { headers });
  }
}
