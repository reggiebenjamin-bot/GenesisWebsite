import { NextResponse } from "next/server";
import { aiEmployeePlans, type CheckoutPlanId } from "@/lib/aiEmployees";
import {
  AI_EMPLOYEES_CHECKOUT_INTEGRATION_ID,
  checkoutLineItems,
  checkoutPriceId,
  setupPriceId,
} from "@/lib/aiEmployeesCheckout";
import { stripeServer } from "@/lib/stripeServer";

function isPlan(value: string): value is CheckoutPlanId {
  return aiEmployeePlans.some((plan) => plan.id === value);
}

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
  const url = new URL("/ai-employees", request.url);
  url.searchParams.set("checkout", checkout);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  let plan = "";
  try {
    plan = await readPlan(request);
  } catch {
    return back(request, "error");
  }

  if (!isPlan(plan)) return back(request, "error");

  const price = checkoutPriceId(plan);
  const stripe = stripeServer();
  if (!price || !stripe) return back(request, "unavailable");

  const origin = new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: checkoutLineItems(price, setupPriceId(plan)),
      metadata: { plan },
      subscription_data: { metadata: { plan } },
      success_url: `${origin}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/ai-employees?checkout=closed`,
      integration_identifier: AI_EMPLOYEES_CHECKOUT_INTEGRATION_ID,
    });

    if (!session.url) return back(request, "error");
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error(
      "AI employees checkout failed",
      error instanceof Error ? error.message : "unknown",
    );
    return back(request, "error");
  }
}
