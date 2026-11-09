import { NextResponse } from "next/server";
import { isLinkPreviewAgent, planFromLink } from "@/lib/checkoutLink";
import {
  MANAGED_CHECKOUT_INTEGRATION_ID,
  checkoutLineItems,
  companyNameField,
  monthlyPriceId,
  setupPriceId,
} from "@/lib/managedCheckout";
import { isManagedPlanId } from "@/lib/offers";
import { stripeServer } from "@/lib/stripeServer";
import { checkoutOwnerId } from "@/lib/workspaceOwner";

export function back(request: Request, checkout: string) {
  const url = new URL("/pricing", request.url);
  url.searchParams.set("checkout", checkout);
  url.hash = "custom-infrastructure";
  return NextResponse.redirect(url, 303);
}

/** Opens the same Checkout Session for POST forms and GET links. */
export async function startManagedCheckout(request: Request, plan: string) {
  if (!isManagedPlanId(plan)) return back(request, "error");

  const stripe = stripeServer();
  if (!stripe) return back(request, "unavailable");

  const origin = new URL(request.url).origin;

  try {
    const ownerId = await checkoutOwnerId();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: checkoutLineItems(monthlyPriceId(plan), setupPriceId(plan)),
      custom_fields: companyNameField(),
      metadata: { plan, kind: "managed" },
      subscription_data: { metadata: { plan, kind: "managed" } },
      ...(ownerId ? { client_reference_id: ownerId } : {}),
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

export function toPricing(request: Request) {
  return NextResponse.redirect(new URL("/pricing#custom-infrastructure", request.url), 303);
}

/** Direct link entry. Unknown plans and link previews go to the pricing page. */
export async function startManagedCheckoutFromLink(request: Request, rawPlan: string | null) {
  const plan = planFromLink(rawPlan);
  if (!plan) return toPricing(request);
  if (isLinkPreviewAgent(request.headers.get("user-agent"))) return toPricing(request);
  const response = await startManagedCheckout(request, plan);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

