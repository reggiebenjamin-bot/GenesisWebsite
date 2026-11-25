"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SubmitButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { track } from "@/lib/analytics";
import { contact } from "@/lib/content";
import { ASSESSMENT_HANDOFF_KEY, readAssessmentHandoff } from "@/lib/assessmentHandoff";
import { MINISTRY_OPERATION_TYPE, ministryContact, ministryPlanFromTopic } from "@/lib/ministryPage";
import { managedPlans } from "@/lib/offers";

type FormStatus = "idle" | "submitting" | "success" | "error";

/** Who the form is speaking to: a business (the default) or a church, from a Ministry link. */
export type ConsultationAudience = "business" | "church";

const churchForm = ministryContact.form;
/* The assessment's team sizes, so a business answers once, one way. */
const BUSINESS_TEAM_SIZES = ["Just me", "2 to 5", "6 to 25", "26 to 50", "More than 50"] as const;
const checkForm = ministryContact.websiteCheck.form;

/* The same labels as the assessment's contact step: sentence case, the asterisk on the label
   line. Inputs are 16px at every width, so no phone zooms in on a tapped field. */
const field = "flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[0.92rem] text-ink";
const control =
  "min-h-12 w-full border border-line-light bg-paper px-4 text-base text-ink transition-colors duration-200 focus:border-gold-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark/60";
/* The same 16px field, drawn with its own chevron instead of the system one. */
const selectControl = `${control} select-field`;
const optional = <span className="text-muted-dark">(optional)</span>;
const required = (
  <span aria-hidden="true" className="text-gold-dark">
    *
  </span>
);

export function ConsultationForm({
  initialPlan = "",
  initialNote = "",
  audience = "business",
  websiteCheck = false,
  interest = "",
  topic = "",
}: {
  initialPlan?: string;
  /** A starting note for the notes field, from a known topic link. */
  initialNote?: string;
  /**
   * "church" when the visitor came from a Genesis Ministry link: church
   * labels and roles, the operation type sent as Church, and no plan select,
   * because that select lists the business plans and their prices. A church
   * plan (Care, Shepherd or Plus) arrives in the starting note instead.
   */
  audience?: ConsultationAudience;
  /**
   * The free Church Website Check (church audience only): the form asks for
   * the church's website first, and its title, button and notes say so.
   */
  websiteCheck?: boolean;
  /** Which consult this request came from, forwarded with the existing form. */
  interest?: string;
  /** The /contact topic, reported with the booking. */
  topic?: string;
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
  const formRef = useRef<HTMLFormElement>(null);
  const [fromAssessment, setFromAssessment] = useState(false);

  /* Someone who just finished the assessment in this tab does not type the
     same details again: name, email, phone, church or company, and a
     church's staff size, from sessionStorage (never the URL). */
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = window.sessionStorage.getItem(ASSESSMENT_HANDOFF_KEY);
    } catch {
      return;
    }
    const handoff = readAssessmentHandoff(raw);
    const form = formRef.current;
    if (!handoff || !form || check || handoff.path !== audience) return;
    const fill = (name: string, value: string) => {
      const input = form.elements.namedItem(name);
      if (value && (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) && !input.value) input.value = value;
    };
    /* What the assessment found leads into the notes, under whatever the topic already said. */
    const notes = form.elements.namedItem("notes");
    if (handoff.summary && notes instanceof HTMLTextAreaElement && !notes.value.includes(handoff.summary)) {
      notes.value = `${notes.value.trim()}${notes.value.trim() ? "\n" : ""}${handoff.summary}`;
    }
    fill("name", handoff.name);
    fill("email", handoff.email);
    fill("phone", handoff.phone);
    fill("company", handoff.company);
    if (church && (churchForm.staffSizes as readonly string[]).includes(handoff.staff)) fill("monthly_leads", handoff.staff);
    if (!church && (BUSINESS_TEAM_SIZES as readonly string[]).includes(handoff.staff)) fill("monthly_leads", handoff.staff);
    setFromAssessment(true);
  }, [audience, church, check]);

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
      `Interest: ${payload.interest ?? ""}`,
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
      /* The conversion itself: the review booked from the assessment, or any other call. */
      if (topic === "classes") track("classes_notify_requested", { from: "contact" });
      track(topic === "assessment-review" ? "infrastructure_review_booked" : "direct_consultation_booked", {
        topic: topic || (church ? "ministry" : "general"),
        plan: String(payload.plan ?? "") || (/^ministry-([a-z]+)$/.exec(topic)?.[1] ?? ""),
        from_assessment: fromAssessment,
        path: church ? "church" : "business",
      });
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
          {/* A call request books no time by itself, so the heading says what happens to set one. */}
          {check ? "Thanks, we have it. Here is what happens next." : "Thanks, we have it. We reply within one business day to set a time."}
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
      ref={formRef}
      id="consultation-form"
      onSubmit={handleSubmit}
      className="grid gap-5 border border-line-light bg-paper p-[clamp(22px,2.6vw,34px)]"
    >
      <div className="border-b border-line-light pb-5">
        <Eyebrow>{check ? checkForm.eyebrow : topic === "classes" ? "Genesis Classes" : "Book a call"}</Eyebrow>
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
          {checkForm.website} {required}
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
        Your name {required}
        <input name="name" autoComplete="name" required className={control} />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className={field}>
          {church ? "Email" : "Work email"} {required}
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className={control}
          />
        </label>
        {/* A church can be reached by email alone, as on the assessment; a business call needs a phone. */}
        <label className={field}>
          Phone {church ? optional : required}
          {church ? null : <span className="text-muted-dark">(so we can set a time)</span>}
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            required={!church}
            className={control}
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* A church can skip its name (the assessment made it optional too); a business cannot. */}
        <label className={field}>
          {church ? churchForm.company : "Company or operation"} {church ? optional : required}
          <input
            name="company"
            autoComplete="organization"
            required={!church}
            className={control}
          />
        </label>
        <label className={field}>
          Your role {required}
          <select name="vertical" defaultValue="" required className={selectControl}>
            <option value="" disabled>
              Choose one
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
          {church ? churchForm.teamSize : "Team size"} {church ? optional : required}
          <select name="monthly_leads" defaultValue="" required={!church} className={selectControl}>
            <option value="" disabled={!church}>Choose one</option>
            {church ? (
              churchForm.staffSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))
            ) : (
              <>
                {BUSINESS_TEAM_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </>
            )}
          </select>
        </label>
        {church ? (
          /* A church is a church: no business categories to choose from. */
          <input type="hidden" name="operation_type" value={MINISTRY_OPERATION_TYPE} />
        ) : (
          <label className={field}>
            Operation type {required}
            <select name="operation_type" defaultValue="" required className={selectControl}>
              <option value="" disabled>Choose one</option>
              <option value="Brokerage">Brokerage</option>
              <option value="Private Lending">Private lending</option>
              <option value="Acquisitions / Builder">Acquisitions or builder</option>
              <option value="Service business / trades">Service business or trade</option>
              <option value="Other Property-Driven">Other property business</option>
              <option value="Other">Other</option>
            </select>
          </label>
        )}
      </div>

      {church ? (
        /* The select lists the business plans; a church plan (Care, Shepherd, Plus or Enterprise)
           comes from the topic, so the CRM can filter church leads by plan. */
        <input type="hidden" name="plan" value={ministryPlanFromTopic(topic)} />
      ) : (
        <label className={field}>
          Where are you starting? {optional}
          <select name="plan" defaultValue={normalizedPlan} className={selectControl}>
            <option value="">Not sure yet</option>
            {managedPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {`Level ${plan.step} ${plan.name}, ${plan.userLimit}, ${plan.priceDisplay} a month ${plan.setupLine}`}
              </option>
            ))}
            <option value="done-for-you">Done for you, scoped on a call</option>
          </select>
        </label>
      )}

      <label className={field}>
        {church ? churchForm.notes : "Where does work slow down today?"} {optional}
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

      {interest ? <input type="hidden" name="interest" value={interest} /> : null}
      {/* Links this request to the assessment just finished, for whoever reads both. */}
      {fromAssessment ? <input type="hidden" name="from_assessment" value="true" /> : null}

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

      {/* The gold primary, the same as every button that led here. */}
      <SubmitButton type="submit" disabled={status === "submitting"}>
        {status === "submitting"
          ? "Sending request…"
          : check
            ? checkForm.submit
            : church
              ? churchForm.submit
              : topic === "classes"
                ? "Notify Me About the Next Class"
                : "Book a Call"}
      </SubmitButton>
      {check || topic === "classes" ? null : (
        <p className="-mt-2 text-[0.9rem] font-medium text-ink">
          Genesis will email you to set a time that works for you.
        </p>
      )}

      <div className="grid gap-2 text-[0.875rem] text-muted-dark">
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
