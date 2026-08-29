"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SubmitButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { contact } from "@/lib/content";
import {
  infrastructureCatalog,
  isInfrastructurePlanSlug,
} from "@/lib/products";

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
    () => (isInfrastructurePlanSlug(initialPlan) ? initialPlan : ""),
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
      "Genesis Infrastructure consultation request",
      "",
      `Name: ${payload.name ?? ""}`,
      `Email: ${payload.email ?? ""}`,
      `Phone: ${payload.phone ?? ""}`,
      `Company / Operation: ${payload.company ?? ""}`,
      `Role: ${payload.vertical ?? ""}`,
      `Team Size: ${payload.monthly_leads ?? ""}`,
      `Operation Type: ${payload.operation_type ?? ""}`,
      `Plan: ${payload.plan ?? ""}`,
      `Current Setup: ${payload.notes ?? ""}`,
      `Page: ${payload.page ?? ""}`,
    ].join("\n");
    setFallbackHref(
      `mailto:${contact.email}?subject=${encodeURIComponent(
        "Genesis Infrastructure consultation",
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
          Thanks—we have it. Here is what happens next.
        </h2>
        <p className="mt-5 text-muted-dark">
          Genesis will reach out to confirm a time. The call is a working
          conversation about the operation, priorities, and existing tools. If
          it looks like a fit, we will recommend a specific starting point
          before anything is proposed in writing. For immediate assistance, email{" "}
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
      <div className="border-b border-line-light pb-7">
        <Eyebrow>Infrastructure intake</Eyebrow>
        <h2 className="mt-4 text-[clamp(1.7rem,3vw,2.55rem)]">
          Give Genesis enough context to make the first call useful.
        </h2>
        <p className="mt-4 text-[0.94rem] text-muted-dark">
          Your role, team, current systems, and the work creating the most drag
          help us prepare for the consultation. This form is not used for Mini
          signup, billing, or product provisioning.
        </p>
      </div>

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
          Phone for consultation follow-up <span aria-hidden="true">*</span>
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
          Company / Operation <span aria-hidden="true">*</span>
          <input
            name="company"
            autoComplete="organization"
            required
            className={control}
          />
        </label>
        <label className={field}>
          Your Role <span aria-hidden="true">*</span>
          <select name="vertical" defaultValue="" required className={control}>
            <option value="" disabled>
              Select
            </option>
            <option value="Owner">Owner</option>
            <option value="Principal">Principal</option>
            <option value="Broker-Owner">Broker-Owner</option>
            <option value="Founder">Founder</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <label className={field}>
          Team Size <span aria-hidden="true">*</span>
          <select name="monthly_leads" defaultValue="" required className={control}>
            <option value="" disabled>Select</option>
            <option value="Just me">Just me</option>
            <option value="2–4">2–4</option>
            <option value="5–50">5–50</option>
            <option value="50+">50+</option>
          </select>
        </label>
        <label className={field}>
          Operation Type <span aria-hidden="true">*</span>
          <select name="operation_type" defaultValue="" required className={control}>
            <option value="" disabled>Select</option>
            <option value="Brokerage">Brokerage</option>
            <option value="Private Lending">Private lending</option>
            <option value="Acquisitions / Builder">Acquisitions / builder</option>
            <option value="Other Property-Driven">Other property-driven</option>
          </select>
        </label>
      </div>

      <label className={field}>
        Infrastructure starting point
        <select name="plan" defaultValue={normalizedPlan} className={control}>
          <option value="">Not sure yet</option>
          {infrastructureCatalog.plans.map((plan) => (
            <option key={plan.key} value={plan.slug}>
                {plan.price.kind === "starting_at"
                  ? `${plan.name} — Starting at ${plan.price.display}`
                  : plan.name}
            </option>
          ))}
        </select>
      </label>

      <label className={field}>
        Where does work slow down today?
        <textarea
          name="notes"
          rows={6}
          placeholder="Describe the current email, Microsoft 365, CRM, document, follow-up, or administrative setup—and the manual handoff creating the most drag…"
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

      <SubmitButton
        type="submit"
        variant="secondary"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending request…" : "Request an Infrastructure consultation"}
      </SubmitButton>

      <p className="text-[0.8rem] text-muted-dark">
        Genesis uses these details only to evaluate fit, prepare for the call,
        and follow up about the Infrastructure request.
      </p>
    </form>
  );
}
