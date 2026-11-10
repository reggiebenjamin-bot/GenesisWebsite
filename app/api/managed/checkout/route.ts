import {
  back,
  startManagedCheckout,
  startManagedCheckoutFromLink,
  toPricing,
} from "@/lib/managedCheckoutStart";

async function readPlan(request: Request): Promise<{ plan: string; edition: string }> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { plan?: unknown; edition?: unknown };
    return {
      plan: typeof body.plan === "string" ? body.plan : "",
      edition: typeof body.edition === "string" ? body.edition : "",
    };
  }
  const form = await request.formData();
  const plan = form.get("plan");
  const edition = form.get("edition");
  return {
    plan: typeof plan === "string" ? plan : "",
    edition: typeof edition === "string" ? edition : "",
  };
}

export async function POST(request: Request) {
  let choice = { plan: "", edition: "" };
  try {
    choice = await readPlan(request);
  } catch {
    return back(request, "error");
  }
  return startManagedCheckout(request, choice.plan, choice.edition);
}

export async function GET(request: Request) {
  return startManagedCheckoutFromLink(request, new URL(request.url).searchParams.get("plan"));
}

export async function HEAD(request: Request) {
  return toPricing(request);
}
