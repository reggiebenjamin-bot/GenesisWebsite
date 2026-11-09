import { startManagedCheckoutFromLink, toPricing } from "@/lib/managedCheckoutStart";

export const dynamic = "force-dynamic";

/** Short direct checkout links: /start/750, /start/1750, /start/4500. */
export async function GET(request: Request, { params }: { params: Promise<{ tier: string }> }) {
  const { tier } = await params;
  return startManagedCheckoutFromLink(request, tier);
}

export async function HEAD(request: Request) {
  return toPricing(request);
}
