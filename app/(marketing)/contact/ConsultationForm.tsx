"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SubmitButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { contact } from "@/lib/content";
import { MINISTRY_OPERATION_TYPE, ministryContact } from "@/lib/ministryPage";
import { managedPlans } from "@/lib/offers";

type FormStatus = "idle" | "submitting" | "success" | "error";

/** Who the form is speaking to: a business (the default) or a church, from a Ministry link. */
export type ConsultationAudience = "business" | "church";

const churchForm = ministryContact.form;
const checkForm = ministryContact.websiteCheck.form;

const field =
  "flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[0.78rem] tracking-[0.08em] text-muted-dark uppercase";
const control =
  "min-h-12 w-full border border-line-light bg-paper px-4 text-[0.95rem] tracking-normal text-ink normal-case transition-colors duration-200 focus:border-gold-dark focus:outline-none";

export function ConsultationForm({
  initialPlan = "",
  initialNote = "",
  audience = "business",
  websiteCheck = false,
}: {
  initialPlan?: string;
  /** A starting note for the notes field, from a known topic link. */
  initialNote?: string;
  /**
   * "church" when the visitor came from a Genesis Ministry link: church
   * labels and roles, the operation type sent as Church, and no plan select,
   * because the business plans carry prices and Ministry pricing is set with
   * Genesis on a call.
   */
  audience?: ConsultationAudience;
  /**
   * The free Church Website Check (church audience only): the form asks for
   * the church's website first, and its title, button and notes say so.
   */
  websiteCheck?: boolean;
}) {
  const church = audience === "church";
  const check = church && websiteCheck;
  const allowedPlanValues = useMemo(
    () => new Set(["", "done-for-you", ...managedPlans.map((plan) => plan.id)]),
    [],
  );
  const normalizedPlan = useMemo(
    () => (allowedPlanValues.has(initialPlan) ? initialPlan : ""),
    [allowedPlanValues, initialPlan],
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

    const payload: Record<string, FormDataEntryValue> = {
      ...Object.fromEntries(new FormData(form).entries()),
      ...context.current,
    };
    /* The Website Check's address also leads the notes, so whoever reads the
       request sees it first, whatever the receiving system does with extra fields. */
    const site = typeof payload.church_website === "string" ? payload.church_website.trim() : "";
    if (site) payload.notes = `Church website: ${site}\n${payload.notes ?? ""}`.trim();

    /* Composed before the request so a network failure still leaves the
       visitor with a way to reach us that carries their answers. */
    const subject = check
      ? "Church Website Check"
      : church
        ? "Genesis Ministry consultation"
        : "Genesis Infrastructure consultation";
    const fallbackBody = [
      `${subject} request`,
      "",
      ...(site ? [`Church Website: ${site}`] : []),
      `Name: ${payload.name ?? ""}`,
      `Email: ${payload.email ?? ""}`,
      `Phone: ${payload.phone ?? ""}`,
      `${church ? "Church" : "Company / Operation"}: ${payload.company ?? ""}`,
      `Role: ${payload.vertical ?? ""}`,
      `Team Size: ${payload.monthly_leads ?? ""}`,
      `Operation Type: ${payload.operation_type ?? ""}`,
      `Plan: ${payload.plan ?? ""}`,
      `Current Setup: ${payload.notes ?? ""}`,
      `Page: ${payload.page ?? ""}`,
    ].join("\n");
    setFallbackHref(
      `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fallbackBody)}`,
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
          Thanks, we have it. Here is what happens next.
        </h2>
        <p className="mt-5 text-muted-dark">
          {check
            ? checkForm.success
            : church
            ? churchForm.success
            : "Genesis will reach out to confirm a time. The call is a working conversation about the operation, priorities, and existing tools. If it looks like a fit, we will recommend a specific starting point before anything is proposed in writing."}{" "}
          For immediate assistance, email{" "}
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
      className="grid gap-5 border border-line-light bg-paper p-[clamp(22px,2.6vw,34px)]"
    >
      <div className="border-b border-line-light pb-5">
        <Eyebrow>{check ? checkForm.eyebrow : "Consultation request"}</Eyebrow>
        <h2 className="mt-3 text-[clamp(1.45rem,2.4vw,2rem)]">
          {check ? checkForm.title : church ? churchForm.title : "Tell us about the operation."}
        </h2>
        <p className="mt-3 text-[0.9rem] text-muted-dark">
          {check
            ? checkForm.lede
            : church
            ? churchForm.lede
            : "Give us enough context to understand the business and the workflow you want to improve. Detailed technical documentation is not required for the first conversation."}
        </p>
      </div>

      {check ? (
        /* Not named "website": that name is the honeypot below. */
        <label className={field}>
          {checkForm.website} <span aria-hidden="true">*</span>
          <input
            name="church_website"
            type="text"
            inputMode="url"
            autoComplete="url"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={checkForm.websitePlaceholder}
            required
            className={control}
          />
        </label>
      ) : null}

      <label className={field}>
        Full Name <span aria-hidden="true">*</span>
        <input name="name" autoComplete="name" required className={control} />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className={field}>
          {church ? "Email" : "Work Email"} <span aria-hidden="true">*</span>
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

      <div className="grid gap-5 md:grid-cols-2">
        <label className={field}>
          {church ? churchForm.company : "Company / Operation"} <span aria-hidden="true">*</span>
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
            {church ? (
              churchForm.roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))
            ) : (
              <>
                <option value="Owner">Owner</option>
                <option value="Principal">Principal</option>
                <option value="Broker-Owner">Broker-Owner</option>
                <option value="Founder">Founder</option>
              </>
            )}
            <option value="Other">Other</option>
          </select>
        </label>
      </div>

      <div className={church ? "grid gap-5" : "grid gap-5 md:grid-cols-2"}>
        <label className={field}>
          {church ? churchForm.teamSize : "Team Size"} <span aria-hidden="true">*</span>
          <select name="monthly_leads" defaultValue="" required className={control}>
            <option value="" disabled>Select</option>
            {church ? (
              churchForm.staffSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))
            ) : (
              <>
                <option value="Just me">Just me</option>
                <option value="2–4">2–4</option>
                <option value="5–50">5–50</option>
                <option value="50+">50+</option>
              </>
            )}
          </select>
        </label>
        {church ? (
          /* A church is a church: no business categories to choose from. */
          <input type="hidden" name="operation_type" value={MINISTRY_OPERATION_TYPE} />
        ) : (
          <label className={field}>
            Operation Type <span aria-hidden="true">*</span>
            <select name="operation_type" defaultValue="" required className={control}>
              <option value="" disabled>Select</option>
              <option value="Brokerage">Brokerage</option>
              <option value="Private Lending">Private lending</option>
              <option value="Acquisitions / Builder">Acquisitions / builder</option>
              <option value="Service business / trades">Service business / trades</option>
              <option value="Other Property-Driven">Other property-driven</option>
              <option value="Other">Other</option>
            </select>
          </label>
        )}
      </div>

      {church ? (
        /* The business plans carry prices; Ministry pricing is set with Genesis on a call. */
        <input type="hidden" name="plan" value="" />
      ) : (
        <label className={field}>
          Where are you starting?
          <select name="plan" defaultValue={normalizedPlan} className={control}>
            <option value="">Not sure yet</option>
            {managedPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {`Level ${plan.step} ${plan.name}, ${plan.userLimit}, ${plan.priceDisplay} a month ${plan.setupLine}`}
              </option>
            ))}
            <option value="done-for-you">Done For You, scoped on a call</option>
          </select>
        </label>
      )}

      <label className={field}>
        {church ? churchForm.notes : "Where does work slow down today?"}
        <textarea
          name="notes"
          rows={4}
          defaultValue={initialNote}
          placeholder={
            church
              ? churchForm.notesPlaceholder
              : "Describe the current email, Microsoft 365, CRM, document, follow-up, or administrative setup, and the manual handoff creating the most drag…"
          }
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
        {status === "submitting"
          ? "Sending request…"
          : check
            ? checkForm.submit
            : church
              ? churchForm.submit
              : "Book a Consultation"}
      </SubmitButton>

      <div className="grid gap-2 text-[0.8rem] text-muted-dark">
        {church ? (
          (check ? checkForm.footnotes : churchForm.footnotes).map((line) => <p key={line}>{line}</p>)
        ) : (
          <>
            <p>
              Your inquiry starts a fit conversation. It does not create a managed
              account, finalize implementation scope, or commit either party to a
              deployment.
            </p>
            <p>
              Genesis uses these details only to evaluate fit, prepare for the call,
              and follow up about the request.
            </p>
          </>
        )}
      </div>
    </form>
  );
}
