import { NextResponse } from "next/server";

/*
 * Retired Nov 9 2026. The AI Employees Single, Duo, and Full Fleet plans no
 * longer open a Stripe Checkout. Any old form or link that still posts here is
 * sent to the Genesis Managed AI levels on the pricing page, where checkout
 * happens. Existing subscriptions are untouched; the Stripe webhook still
 * resolves their plan ids.
 */
function toPricing(request: Request) {
  return NextResponse.redirect(new URL("/pricing#custom-infrastructure", request.url), 303);
}

export async function POST(request: Request) {
  return toPricing(request);
}

export async function GET(request: Request) {
  return toPricing(request);
}
