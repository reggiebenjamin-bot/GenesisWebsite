"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SubmitButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { contact, pricingPlans } from "@/lib/content";

type FormStatus = "idle" | "submitting" | "success" | "error";

const field =
  "grid gap-2 text-[0.78rem] tracking-[0.08em] text-muted-dark uppercase";
const control =
  "min-h-13 w-full border border-line-light bg-paper px-4 text-[0.95rem] tracking-normal text-ink normal-case transition-colors duration-200 focus:border-gold-dark focus:outline-none";

export function ConsultationForm({
  initialPlan = "",
}: {
  initialPlan?: string;
}) {
  const normalizedPlan = useMemo(
    () =>
      pricingPlans.some((plan) => plan.slug === initialPlan) ? initialPlan : "",
    [initialPlan],
  );

  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fallbackHref, setFallbackHref] = useState(`mailto:${contact.email}`);
  const context = useRef<Record<string, string>>({});
  const submittedRef = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tracked: Record<string, string> = {
      page: window.location.href,
      referring_page: document.referrer,
    };
    for (const [key, value] of params.entries()) {
      if (key.startsWith("utm_") || ["gclid", "fbclid"].includes(key)) {
        tracked[key] = value;
      }
    }
    context.current = tracked;
  }, []);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittedRef.current || status === "submitting") return;

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = {
      ...Object.fromEntries(new FormData(form).entries()),
      ...context.current,
    };

    /* Composed before the request so a network failure still leaves the
       visitor with a way to reach us that carries their answers. */
    const fallbackBody = [
      "Genesis AI consultation request",
      "",
      `Name: ${payload.name ?? ""}`,
      `Email: ${payload.email ?? ""}`,
      `Phone: ${payload.phone ?? ""}`,
      `Company / Brokerage: ${payload.company ?? ""}`,
      `Role: ${payload.vertical ?? ""}`,
      `Team Size: ${payload.monthly_leads ?? ""}`,
      `Plan: ${payload.plan ?? ""}`,
      `Current Setup: ${payload.notes ?? ""}`,
      `Page: ${payload.page ?? ""}`,
    ].join("\n");
    setFallbackHref(
      `mailto:${contact.email}?subject=${encodeURIComponent(
        "Website Contact Intake",
      )}&body=${encodeURIComponent(fallbackBody)}`,
    );

    submittedRef.current = true;
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Unable to submit.");
      form.reset();
      setStatus("success");
    } catch {
      submittedRef.current = false;
      setStatus("error");
      setErrorMessage(
        `We could not send the form. Please email ${contact.email} or call ${contact.phoneDisplay}.`,
      );
    }
  }

  if (status === "success") {
    return (
      <div
        ref={successRef}
        role="status"
        tabIndex={-1}
        className="border border-line-light bg-paper p-[clamp(32px,4vw,56px)]"
      >
        <Eyebrow>Request received</Eyebrow>
        <h2 className="mt-4 text-[clamp(1.7rem,3vw,2.6rem)]">
          Thank you. Genesis will follow up about your consultation.
        </h2>
        <p className="mt-5 text-muted-dark">
          If you need immediate assistance, email{" "}
          <a
            href={`mailto:${contact.email}`}
            className="border-b border-ink/30 text-ink"
          >
            {contact.email}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 border border-line-light bg-paper p-[clamp(28px,3.5vw,48px)]"
    >
      <label className={field}>
        Full Name <span aria-hidden="true">*</span>
        <input name="name" autoComplete="name" required className={control} />
      </label>

      <div className="grid gap-6 md:grid-cols-2">
        <label className={field}>
          Work Email <span aria-hidden="true">*</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className={control}
          />
        </label>
        <label className={field}>
          Phone <span aria-hidden="true">*</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            className={control}
          />
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <label className={field}>
          Company / Brokerage
          <input
            name="company"
            autoComplete="organization"
            className={control}
          />
        </label>
        <label className={field}>
          Your Role <span aria-hidden="true">*</span>
          <select name="vertical" defaultValue="" required className={control}>
            <option value="" disabled>
              Select
            </option>
            <option value="Solo Agent">Solo Agent</option>
            <option value="Team Lead">Team Lead</option>
            <option value="Broker / Brokerage">Broker / Brokerage</option>
            <option value="Investor / Operator">Investor / Operator</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <label className={field}>
          Team Size
          <select name="monthly_leads" defaultValue="" className={control}>
            <option value="">Select</option>
            <option value="Just me">Just me</option>
            <option value="2-5">2–5</option>
            <option value="6-20">6–20</option>
            <option value="20+">20+</option>
          </select>
        </label>
        <label className={field}>
          Plan of Interest
          <select name="plan" defaultValue={normalizedPlan} className={control}>
            <option value="">Not sure yet</option>
            {pricingPlans.map((plan) => (
              <option key={plan.slug} value={plan.slug}>
                {plan.name} — starting at {plan.monthlyPrice}/month
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={field}>
        What does your current setup look like?
        <textarea
          name="notes"
          rows={6}
          placeholder="Current email setup, CRM (if any), team size, and what you want AI to handle…"
          className={`${control} py-4`}
        />
      </label>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-px w-px opacity-0"
      />

      {status === "error" ? (
        <div
          role="alert"
          className="border border-gold-dark/40 bg-gold-light/12 p-5 text-[0.92rem]"
        >
          <p>{errorMessage}</p>
          <a href={fallbackHref} className="mt-2 inline-block border-b border-ink/30">
            Open email fallback
          </a>
        </div>
      ) : null}

      <SubmitButton type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Request a Consultation"}
      </SubmitButton>

      <p className="text-[0.8rem] text-muted-dark">
        Submitted information is used only to evaluate fit and schedule your
        consultation.
      </p>
    </form>
  );
}
