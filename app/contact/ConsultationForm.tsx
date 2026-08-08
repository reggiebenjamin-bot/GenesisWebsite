"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { contact, pricingPlans } from "@/lib/content";

type FormStatus = "idle" | "submitting" | "success" | "error";

type ConsultationFormProps = {
  initialPlan?: string;
};

export function ConsultationForm({ initialPlan = "" }: ConsultationFormProps) {
  const normalizedPlan = useMemo(
    () => (pricingPlans.some((plan) => plan.slug === initialPlan) ? initialPlan : ""),
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

    const formData = new FormData(form);
    const payload = {
      ...Object.fromEntries(formData.entries()),
      ...context.current,
    };
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
      `mailto:${contact.email}?subject=${encodeURIComponent("Website Contact Intake")}&body=${encodeURIComponent(fallbackBody)}`,
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

      if (!response.ok) throw new Error("Unable to submit the consultation request.");
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
      <div className="form-success" role="status" tabIndex={-1} ref={successRef}>
        <p className="eyebrow">Request received</p>
        <h2>Thank you. Genesis will follow up about your consultation.</h2>
        <p>
          If you need immediate assistance, email{" "}
          <a href={`mailto:${contact.email}`}>{contact.email}</a>.
        </p>
      </div>
    );
  }

  return (
    <form className="consultation-form" onSubmit={handleSubmit}>
      <label>
        Full Name <span aria-hidden="true">*</span>
        <input name="name" autoComplete="name" required />
      </label>
      <div className="form-row">
        <label>
          Work Email <span aria-hidden="true">*</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Phone <span aria-hidden="true">*</span>
          <input name="phone" type="tel" autoComplete="tel" required />
        </label>
      </div>
      <div className="form-row">
        <label>
          Company / Brokerage
          <input name="company" autoComplete="organization" />
        </label>
        <label>
          Your Role <span aria-hidden="true">*</span>
          <select name="vertical" defaultValue="" required>
            <option value="" disabled>Select</option>
            <option value="Solo Agent">Solo Agent</option>
            <option value="Team Lead">Team Lead</option>
            <option value="Broker / Brokerage">Broker / Brokerage</option>
            <option value="Investor / Operator">Investor / Operator</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>
      <div className="form-row">
        <label>
          Team Size
          <select name="monthly_leads" defaultValue="">
            <option value="">Select</option>
            <option value="Just me">Just me</option>
            <option value="2-5">2–5</option>
            <option value="6-20">6–20</option>
            <option value="20+">20+</option>
          </select>
        </label>
        <label>
          Plan of Interest
          <select name="plan" defaultValue={normalizedPlan}>
            <option value="">Not sure yet</option>
            {pricingPlans.map((plan) => (
              <option key={plan.slug} value={plan.slug}>
                {plan.name} — starting at {plan.monthlyPrice}/month
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        What does your current setup look like?
        <textarea
          name="notes"
          rows={6}
          placeholder="Current email setup, CRM (if any), team size, and what you want AI to handle…"
        />
      </label>
      <input name="website" className="honeypot" tabIndex={-1} autoComplete="off" />
      {status === "error" ? (
        <div className="form-error" role="alert">
          <p>{errorMessage}</p>
          <a href={fallbackHref}>Open email fallback</a>
        </div>
      ) : null}
      <button
        className="button button--gold form-submit"
        type="submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Request a Consultation"}
      </button>
      <p className="form-privacy">
        Submitted information is used only to evaluate fit and schedule your
        consultation.
      </p>
    </form>
  );
}
