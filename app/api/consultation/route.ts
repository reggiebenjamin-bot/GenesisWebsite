import { NextResponse } from "next/server";

const WEBHOOK_URL =
  process.env.GENESIS_CONSULTATION_WEBHOOK_URL ||
  "https://services.leadconnectorhq.com/hooks/xFA4eosJIjIpJqvXZJtS/webhook-trigger/018af955-79ee-4cd6-b2c1-2c43c2025716";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedPlans = new Set(["", "foundation", "growth", "flagship"]);
const allowedRoles = new Set([
  "Owner",
  "Principal",
  "Broker-Owner",
  "Founder",
  "Other",
]);
const allowedTeamSizes = new Set(["Just me", "2–4", "5–50", "50+"]);
const allowedOperationTypes = new Set([
  "Brokerage",
  "Private Lending",
  "Acquisitions / Builder",
  "Other Property-Driven",
]);

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Record<string, unknown>;

    if (data.website) return NextResponse.json({ ok: true });

    const required = ["name", "email", "phone", "company", "vertical", "monthly_leads", "operation_type"];
    const missing = required.some(
      (field) => typeof data[field] !== "string" || !String(data[field]).trim(),
    );
    const email = String(data.email ?? "").trim();
    const role = String(data.vertical ?? "").trim();
    const plan = String(data.plan ?? "").trim();
    const teamSize = String(data.monthly_leads ?? "").trim();
    const operationType = String(data.operation_type ?? "").trim();

    if (
      missing ||
      !emailPattern.test(email) ||
      !allowedRoles.has(role) ||
      !allowedTeamSizes.has(teamSize) ||
      !allowedOperationTypes.has(operationType) ||
      !allowedPlans.has(plan)
    ) {
      return NextResponse.json({ error: "Invalid form submission" }, { status: 400 });
    }

    const outbound = new FormData();
    Object.entries({
      ...data,
      source: "Website Contact Intake",
      submitted_at: new Date().toISOString(),
    }).forEach(([key, value]) => {
      if (key !== "website" && typeof value === "string") outbound.append(key, value);
    });

    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: "POST",
      body: outbound,
      cache: "no-store",
    });

    if (!webhookResponse.ok) {
      return NextResponse.json({ error: "Webhook rejected submission" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to process request" }, { status: 500 });
  }
}
