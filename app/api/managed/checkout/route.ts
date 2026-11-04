import { NextResponse } from "next/server";
import { isManagedPlanId } from "@/lib/offers";
import {
  MANAGED_CHECKOUT_INTEGRATION_ID,
  checkoutLineItems,
  monthlyPriceId,
  setupPriceId,
} from "@/lib/managedCheckout";
import { stripeServer } from "@/lib/stripeServer";

async function readPlan(request: Request): Promise<string> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { plan?: unknown };
    return typeof body.plan === "string" ? body.plan : "";
  }
  const form = await request.formData();
  const plan = form.get("plan");
  return typeof plan === "string" ? plan : "";
}

function back(request: Request, checkout: string) {
  const url = new URL("/pricing", request.url);
  url.searchParams.set("checkout", checkout);
  url.hash = "custom-infrastructure";
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  let plan = "";
  try {
    plan = await readPlan(request);
  } catch {
    return back(request, "error");
  }

  if (!isManagedPlanId(plan)) return back(request, "error");

  const stripe = stripeServer();
  if (!stripe) return back(request, "unavailable");

  const origin = new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: checkoutLineItems(monthlyPriceId(plan), setupPriceId(plan)),
      metadata: { plan, kind: "managed" },
      subscription_data: { metadata: { plan, kind: "managed" } },
      success_url: `${origin}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?checkout=closed#custom-infrastructure`,
      integration_identifier: MANAGED_CHECKOUT_INTEGRATION_ID,
    });

    if (!session.url) return back(request, "error");
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error(
      "Managed checkout failed",
      error instanceof Error ? error.message : "unknown",
    );
    return back(request, "error");
  }
}
