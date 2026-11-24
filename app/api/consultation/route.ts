import { NextResponse } from "next/server";
import { mirrorToGenesis } from "@/lib/genesis-lead";
import { MINISTRY_OPERATION_TYPE, ministryContact } from "@/lib/ministryPage";
import { managedPlans } from "@/lib/offers";

const WEBHOOK_URL =
  process.env.GENESIS_CONSULTATION_WEBHOOK_URL ||
  "https://services.leadconnectorhq.com/hooks/xFA4eosJIjIpJqvXZJtS/webhook-trigger/018af955-79ee-4cd6-b2c1-2c43c2025716";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedPlans = new Set<string>([
  "",
  "done-for-you",
  ...managedPlans.map((plan) => plan.id),
  // Legacy infrastructure slugs still accepted if an old link sends them.
  "foundation",
  "growth",
  "custom-infrastructure",
]);
const allowedRoles = new Set([
  "Owner",
  "Principal",
  "Broker-Owner",
  "Founder",
  // The church roles the form offers on a Genesis Ministry link.
  ...ministryContact.form.roles,
  "Other",
]);
const allowedTeamSizes = new Set([
  "Just me",
  // The sizes the form and the assessment offer today.
  "2 to 5",
  "6 to 25",
  "26 to 50",
  "More than 50",
  // Earlier sizes, still accepted if an old page sends them.
  "2–4",
  "5–50",
  "50+",
  // The church staff sizes the form offers on a Genesis Ministry link.
  ...ministryContact.form.staffSizes,
]);
const allowedOperationTypes = new Set([
  "Brokerage",
  "Private Lending",
  "Acquisitions / Builder",
  "Service business / trades",
  "Other Property-Driven",
  // Sent by the church version of the form.
  MINISTRY_OPERATION_TYPE,
  "Other",
]);

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Record<string, unknown>;

    if (data.website) return NextResponse.json({ ok: true });

    /* A church may leave its name out; every business request names its company. */
    const church = String(data.operation_type ?? "").trim() === MINISTRY_OPERATION_TYPE;
    const required = ["name", "email", "phone", ...(church ? [] : ["company"]), "vertical", "monthly_leads", "operation_type"];
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

    await mirrorToGenesis(
      { name: String(data.name), phone: String(data.phone), email, want: "other" },
      "geai.us:consultation",
    );

    const outbound = new FormData();
    Object.entries({
      ...data,
      source: "Website Infrastructure Consultation",
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
