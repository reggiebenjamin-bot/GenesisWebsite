import { NextResponse } from "next/server";
import { assessmentQuestions } from "@/lib/assessment";

/*
 * The assessment's answers, forwarded only to its dedicated lead destination.
 * Every answer is sent as its own field so the operation
 * behind it can be queried later — which problems show up together, and for
 * whom — rather than arriving as one block of text nobody can group by.
 */

const WEBHOOK_URL = process.env.GENESIS_ASSESSMENT_WEBHOOK_URL;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** What each question will accept, so a forged payload cannot invent answers. */
const allowed = new Map(
  assessmentQuestions
    .filter((question) => question.kind !== "text")
    .map((question) => [
      question.id,
      new Set((question as { options: readonly { value: string }[] }).options.map((o) => o.value)),
    ]),
);

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Record<string, unknown>;

    if (data.website) return NextResponse.json({ ok: true });

    const email = asString(data.email);
    const firstName = asString(data.first_name);
    const lastName = asString(data.last_name);

    if (!firstName || !lastName || !emailPattern.test(email)) {
      return NextResponse.json({ error: "Invalid form submission" }, { status: 400 });
    }

    /* Answers are flattened to strings for the webhook, and anything that is
       not one of the offered choices is dropped rather than forwarded. */
    const answers: Record<string, string> = {};
    for (const question of assessmentQuestions) {
      const raw = data[question.id];
      if (raw === undefined || raw === null) continue;

      if (question.kind === "text") {
        const text = asString(raw).slice(0, 2000);
        if (text) answers[question.id] = text;
        continue;
      }

      const permitted = allowed.get(question.id);
      const values = (Array.isArray(raw) ? raw : [raw])
        .map(asString)
        .filter((value) => permitted?.has(value));
      if (values.length) answers[question.id] = values.join(", ");
    }

    /* Local review should exercise the complete form without sending a real
       lead. Production fails closed until its dedicated destination exists. */
    if (!WEBHOOK_URL) {
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json({ ok: true, preview: true });
      }

      return NextResponse.json(
        { error: "Assessment delivery is not configured" },
        { status: 503 },
      );
    }

    const outbound = new FormData();
    Object.entries({
      ...answers,
      first_name: firstName,
      last_name: lastName,
      name: `${firstName} ${lastName}`,
      email,
      phone: asString(data.phone),
      company: asString(data.company),
      assessment_result_categories: asString(data.assessment_result_categories),
      assessment_completed: "true",
      consultation_requested: data.consultation_requested ? "true" : "false",
      source: "Genesis Infrastructure Assessment",
      source_page: asString(data.source_page),
      referring_page: asString(data.referring_page),
      utm_source: asString(data.utm_source),
      utm_medium: asString(data.utm_medium),
      utm_campaign: asString(data.utm_campaign),
      utm_term: asString(data.utm_term),
      utm_content: asString(data.utm_content),
      gclid: asString(data.gclid),
      fbclid: asString(data.fbclid),
      submitted_at: new Date().toISOString(),
    }).forEach(([key, value]) => {
      if (value) outbound.append(key, value);
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
