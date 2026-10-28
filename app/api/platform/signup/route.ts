import { NextResponse } from "next/server";
import { buildClientConfig, newClientId, validateSignup } from "@/lib/platform/config";

/**
 * STUB. Validates the signup and returns the client config a later
 * provisioning script can consume. It does not write a database, send mail,
 * or call a webhook.
 */
export async function POST(request: Request) {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid form submission" }, { status: 400 });
  }

  const parsed = validateSignup(data);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const config = buildClientConfig(parsed.value, newClientId());
  return NextResponse.json({
    ok: true,
    stub: true,
    storage: "none",
    note: "STUB. This response is not stored.",
    config,
  });
}
