import { NextResponse } from "next/server";
import { intakeMessages, parseIntake, sendIntakeAlert } from "@/lib/onboardingIntake";
import { stripeServer } from "@/lib/stripeServer";

/**
 * Receives the onboarding intake. Validates the fields, then confirms the
 * checkout session with Stripe before posting the intake to the Sales channel.
 * A filled honeypot is accepted quietly without touching Stripe.
 */
export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try {
    data = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: intakeMessages.invalid }, { status: 400 });
  }

  const parsed = parseIntake(data);
  if (parsed.ok && parsed.honeypot) {
    return NextResponse.json({ ok: true });
  }
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.message }, { status: 400 });
  }

  const stripe = stripeServer();
  if (!stripe) {
    return NextResponse.json({ error: intakeMessages.unconfigured }, { status: 503 });
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(parsed.intake.sessionId);
  } catch {
    return NextResponse.json({ error: intakeMessages.error }, { status: 400 });
  }

  if (session.status !== "complete") {
    return NextResponse.json({ error: intakeMessages.error }, { status: 400 });
  }

  const metadata = (session.metadata ?? {}) as Record<string, unknown>;
  const plan = typeof metadata.plan === "string" ? metadata.plan : "";

  await sendIntakeAlert(parsed.intake, plan);

  return NextResponse.json({ ok: true });
}
