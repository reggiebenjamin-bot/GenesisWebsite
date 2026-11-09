import {
  back,
  startManagedCheckout,
  startManagedCheckoutFromLink,
  toPricing,
} from "@/lib/managedCheckoutStart";

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

export async function POST(request: Request) {
  let plan = "";
  try {
    plan = await readPlan(request);
  } catch {
    return back(request, "error");
  }
  return startManagedCheckout(request, plan);
}

export async function GET(request: Request) {
  return startManagedCheckoutFromLink(request, new URL(request.url).searchParams.get("plan"));
}

export async function HEAD(request: Request) {
  return toPricing(request);
}
