import { NextResponse } from "next/server";
import { validateBusinessCheck } from "@/lib/platform/config";
import { platformCopy } from "@/lib/platform/copy";

/**
 * STUB. Validates a Texas business check request and returns a not_run result.
 * It does not query a filing, send mail, or call a webhook.
 */
export async function POST(request: Request) {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: platformCopy.errors.check }, { status: 400 });
  }

  const parsed = validateBusinessCheck(data);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  return NextResponse.json({
    ok: true,
    stub: true,
    storage: "none",
    note: "STUB. This response is not stored.",
    result: {
      status: "not_run",
      business_name: parsed.value.businessName,
      city: parsed.value.city,
      note: platformCopy.check.confirm,
    },
  });
}
