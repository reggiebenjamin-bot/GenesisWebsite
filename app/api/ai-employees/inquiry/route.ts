import { NextResponse } from "next/server";
import { inquiryMessages } from "@/lib/aiEmployees";
import { parseInquiry } from "@/lib/aiEmployeesInquiry";
import { mirrorToGenesis } from "@/lib/genesis-lead";

const WEBHOOK_URL = process.env.GENESIS_AI_EMPLOYEES_INQUIRY_WEBHOOK_URL;

function wantsJson(request: Request) {
  return (request.headers.get("content-type") ?? "").includes("application/json");
}

function redirectInquiry(request: Request, inquiry: string) {
  const url = new URL("/ai-employees", request.url);
  url.searchParams.set("inquiry", inquiry);
  url.hash = "enterprise";
  return NextResponse.redirect(url, 303);
}

async function readData(request: Request): Promise<Record<string, unknown>> {
  if (wantsJson(request)) return (await request.json()) as Record<string, unknown>;
  const form = await request.formData();
  return Object.fromEntries(
    [...form.entries()].map(([key, value]) => [key, typeof value === "string" ? value : ""]),
  );
}

export async function POST(request: Request) {
  const json = wantsJson(request);

  let data: Record<string, unknown>;
  try {
    data = await readData(request);
  } catch {
    return json
      ? NextResponse.json({ error: inquiryMessages.invalid }, { status: 400 })
      : redirectInquiry(request, "invalid");
  }

  const parsed = parseInquiry(data);
  if (!parsed.ok) {
    return json
      ? NextResponse.json({ error: parsed.message }, { status: 400 })
      : redirectInquiry(request, "invalid");
  }

  if (parsed.honeypot) {
    return json ? NextResponse.json({ ok: true }) : redirectInquiry(request, "sent");
  }

  if (!WEBHOOK_URL) {
    if (process.env.NODE_ENV !== "production") {
      return json
        ? NextResponse.json({ ok: true, preview: true })
        : redirectInquiry(request, "sent");
    }
    return json
      ? NextResponse.json({ error: inquiryMessages.unconfigured }, { status: 503 })
      : redirectInquiry(request, "unconfigured");
  }

  await mirrorToGenesis(
    {
      name: parsed.inquiry.name,
      phone: parsed.inquiry.phone,
      email: parsed.inquiry.email,
      message: parsed.inquiry.message,
      want: "other",
    },
    "geai.us:ai-employees-inquiry",
  );

  const outbound = new FormData();
  Object.entries({
    ...parsed.inquiry,
    source: "Genesis AI Employees Done For You",
    submitted_at: new Date().toISOString(),
  }).forEach(([key, value]) => outbound.append(key, value));

  const webhookResponse = await fetch(WEBHOOK_URL, {
    method: "POST",
    body: outbound,
    cache: "no-store",
  });

  if (!webhookResponse.ok) {
    return json
      ? NextResponse.json({ error: inquiryMessages.unconfigured }, { status: 502 })
      : redirectInquiry(request, "unconfigured");
  }

  return json ? NextResponse.json({ ok: true }) : redirectInquiry(request, "sent");
}
