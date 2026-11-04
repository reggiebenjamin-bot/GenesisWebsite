import { NextResponse } from "next/server";
import { genesisTools } from "@/lib/offers";
import { isToolId } from "@/lib/toolPages";
import { TOOLS_CHECKOUT_INTEGRATION_ID, toolLineItem } from "@/lib/toolsCheckout";
import { stripeServer } from "@/lib/stripeServer";

async function readTool(request: Request): Promise<string> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { tool?: unknown };
    return typeof body.tool === "string" ? body.tool : "";
  }
  const form = await request.formData();
  const tool = form.get("tool");
  return typeof tool === "string" ? tool : "";
}

function back(request: Request, tool: string, checkout: string) {
  const url = new URL(tool ? `/tools/${tool}` : "/tools", request.url);
  url.searchParams.set("checkout", checkout);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  let toolId = "";
  try {
    toolId = await readTool(request);
  } catch {
    return back(request, "", "error");
  }

  if (!isToolId(toolId)) return back(request, "", "error");
  const tool = genesisTools.find((candidate) => candidate.id === toolId);
  if (!tool) return back(request, "", "error");

  const stripe = stripeServer();
  if (!stripe) return back(request, toolId, "unavailable");

  const origin = new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [toolLineItem(tool)],
      metadata: { plan: tool.id, kind: "tool", source: "geai_site" },
      payment_intent_data: { metadata: { plan: tool.id, kind: "tool" } },
      success_url: `${origin}/workspace/${tool.id}?checkout=success`,
      cancel_url: `${origin}/tools/${tool.id}?checkout=closed`,
      integration_identifier: TOOLS_CHECKOUT_INTEGRATION_ID,
    });

    if (!session.url) return back(request, toolId, "error");
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("Tools checkout failed", error instanceof Error ? error.message : "unknown");
    return back(request, toolId, "error");
  }
}
