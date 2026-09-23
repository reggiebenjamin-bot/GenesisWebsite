"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/Blocks";
import { SubmitButton } from "@/components/ui/Button";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { Eyebrow } from "@/components/ui/Section";
import { track } from "@/lib/analytics";
import {
  assessmentCopy,
  assessmentFindings,
  assessmentSteps,
  type Answers,
  type Question,
  type Step,
} from "@/lib/assessment";
import { contact } from "@/lib/content";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "error" | "done";

const CONTACT_STEP = assessmentSteps.length;
const TOTAL = CONTACT_STEP + 1;

const field =
  "grid gap-2 text-[0.72rem] tracking-[0.1em] text-muted-dark uppercase";
const control =
  "min-h-12 w-full border border-line-light bg-paper px-4 text-[0.95rem] tracking-normal text-ink normal-case transition-colors duration-200 focus-visible:border-gold-dark focus-visible:ring-2 focus-visible:ring-gold-dark/30";

/** A choice, as a chip that fills when it is chosen. */
function Chip({
  name,
  value,
  kind,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  kind: "single" | "multi";
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2 text-[0.92rem] transition-colors duration-200",
        "focus-within:border-gold-dark focus-within:ring-2 focus-within:ring-gold-dark/30",
        checked
          ? "border-ink bg-ink text-ivory"
          : "border-line-light bg-white/60 text-ink hover:border-gold-dark",
      )}
    >
      <input
        type={kind === "single" ? "radio" : "checkbox"}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "size-2 shrink-0 rounded-full border",
          checked ? "border-gold-light bg-gold-light" : "border-line-light bg-transparent",
        )}
      />
      {value}
    </label>
  );
}

function QuestionBlock({
  question,
  answers,
  onAnswer,
}: {
  question: Question;
  answers: Answers;
  onAnswer: (id: string, value: string | string[]) => void;
}) {
  const current = answers[question.id];

  if (question.kind === "text") {
    return (
      <div className="grid gap-3">
        <label className={field} htmlFor={question.id}>
          {question.label}
          <textarea
            id={question.id}
            name={question.id}
            rows={3}
            placeholder={question.placeholder}
            value={typeof current === "string" ? current : ""}
            onChange={(event) => onAnswer(question.id, event.target.value)}
            className={`${control} py-3.5`}
          />
        </label>
      </div>
    );
  }

  const selected = Array.isArray(current) ? current : current ? [current] : [];

  return (
    <fieldset className="grid gap-3.5">
      <legend className="text-[1.02rem] leading-snug tracking-[-0.01em]">
        {question.label}
        {question.kind === "multi" ? (
          <span className="ml-2 text-[0.82rem] text-muted-dark">Choose all that apply</span>
        ) : null}
      </legend>
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => (
          <Chip
            key={option.value}
            name={question.id}
            value={option.value}
            kind={question.kind}
            checked={selected.includes(option.value)}
            onChange={() => {
              if (question.kind === "single") {
                onAnswer(question.id, option.value);
                return;
              }
              onAnswer(
                question.id,
                selected.includes(option.value)
                  ? selected.filter((item) => item !== option.value)
                  : [...selected, option.value],
              );
            }}
          />
        ))}
      </div>
    </fieldset>
  );
}

/** Single-choice questions must be answered before the step can advance. */
const stepAnswered = (step: Step, answers: Answers) =>
  step.questions.every((question) => question.kind !== "single" || answers[question.id]);

export function AssessmentForm() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [status, setStatus] = useState<Status>("idle");
  const [showRequired, setShowRequired] = useState(false);
  const [fallbackHref, setFallbackHref] = useState(`mailto:${contact.email}`);
  const startedRef = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const context = useRef<Record<string, string>>({});

  const step = assessmentSteps[index];
  const findings = useMemo(() => assessmentFindings(answers), [answers]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tracked: Record<string, string> = {
      source_page: window.location.href,
      referring_page: document.referrer,
    };
    for (const [key, value] of params.entries()) {
      if (key.startsWith("utm_") || ["gclid", "fbclid"].includes(key)) tracked[key] = value;
    }
    context.current = tracked;
  }, []);

  /* The heading moves focus so a screen reader lands on the new step. */
  useEffect(() => {
    if (status !== "done") headingRef.current?.focus();
  }, [index, status]);

  useEffect(() => {
    if (status !== "done") return;
    resultRef.current?.focus();
    track("assessment_result_viewed", { findings: findings.length });
  }, [status, findings.length]);

  function answer(id: string, value: string | string[]) {
    if (!startedRef.current) {
      startedRef.current = true;
      track("assessment_started");
    }
    setShowRequired(false);
    setAnswers((previous) => ({ ...previous, [id]: value }));
  }

  function next() {
    if (step && !stepAnswered(step, answers)) {
      setShowRequired(true);
      return;
    }
    track("assessment_step_completed", { step: index + 1, id: step?.id ?? "contact" });
    setIndex((value) => Math.min(value + 1, CONTACT_STEP));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const entries = Object.fromEntries(new FormData(form).entries());
    const payload = {
      ...answers,
      ...entries,
      consultation_requested: Boolean(entries.consultation_requested),
      assessment_result_categories: findings.map((finding) => finding.title).join(", "),
      ...context.current,
    };

    /* Composed first, so a network failure still leaves them a way to reach
       us that carries everything they just typed. */
    const lines = assessmentSteps.flatMap((group) =>
      group.questions.map((question) => {
        const value = answers[question.id];
        return `${question.label} ${Array.isArray(value) ? value.join(", ") : (value ?? "")}`;
      }),
    );
    setFallbackHref(
      `mailto:${contact.email}?subject=${encodeURIComponent(
        "Genesis Infrastructure Assessment",
      )}&body=${encodeURIComponent(
        [`${entries.first_name} ${entries.last_name}`, String(entries.email), "", ...lines].join(
          "\n",
        ),
      )}`,
    );

    setStatus("submitting");
    try {
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Unable to submit.");
      track("assessment_completed", { findings: findings.length });
      track("assessment_lead_captured");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") return <Results findings={findings} resultRef={resultRef} />;

  return (
    <Card className="mx-auto max-w-[56rem]">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line-light pb-4">
        <Eyebrow>{assessmentCopy.eyebrow}</Eyebrow>
        <p className="text-[0.82rem] text-muted-dark">
          Step {index + 1} of {TOTAL}
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={TOTAL}
        aria-label="Assessment progress"
        className="mt-4 h-0.5 w-full bg-line-light"
      >
        <span
          className="block h-full bg-gold-dark transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${((index + 1) / TOTAL) * 100}%` }}
        />
      </div>

      {step ? (
        <div className="mt-8">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.1] tracking-[-0.03em] text-balance"
          >
            {step.heading}
          </h2>

          <div className="mt-8 grid gap-9">
            {step.questions.map((question) => (
              <QuestionBlock
                key={question.id}
                question={question}
                answers={answers}
                onAnswer={answer}
              />
            ))}
          </div>

          {showRequired ? (
            <p role="alert" className="mt-6 text-[0.9rem] text-gold-dark">
              Please answer every question on this step to continue.
            </p>
          ) : null}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line-light pt-6">
            {index > 0 ? (
              <button
                type="button"
                onClick={() => setIndex((value) => Math.max(value - 1, 0))}
                className="inline-flex min-h-11 items-center gap-2 text-[0.9rem] font-bold transition-colors duration-200 hover:text-gold-dark"
              >
                <span aria-hidden="true">←</span> Back
              </button>
            ) : (
              <span />
            )}
            <SubmitButton type="button" onClick={next} variant="secondary" className="shrink-0">
              Continue
            </SubmitButton>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.1] tracking-[-0.03em] text-balance"
          >
            {assessmentCopy.contact.heading}
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <label className={field}>
              First Name <span aria-hidden="true">*</span>
              <input name="first_name" autoComplete="given-name" required className={control} />
            </label>
            <label className={field}>
              Last Name <span aria-hidden="true">*</span>
              <input name="last_name" autoComplete="family-name" required className={control} />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className={field}>
              Work Email <span aria-hidden="true">*</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                required
                className={control}
              />
            </label>
            <label className={field}>
              Phone <span className="normal-case">(optional)</span>
              <input name="phone" type="tel" autoComplete="tel" className={control} />
            </label>
          </div>

          <label className={field}>
            Company / Team Name
            <input name="company" autoComplete="organization" className={control} />
          </label>

          <label className="flex items-start gap-3 text-[0.92rem] leading-snug">
            <input
              type="checkbox"
              name="consultation_requested"
              className="mt-1 size-4 accent-[var(--color-gold-dark)]"
            />
            {assessmentCopy.contact.consent}
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
            <div role="alert" className="border border-gold-dark/40 bg-gold-light/12 p-5 text-[0.92rem]">
              <p>
                We could not send your answers. Please email {contact.email} or call{" "}
                {contact.phoneDisplay}.
              </p>
              <a href={fallbackHref} className="mt-2 inline-block border-b border-ink/30">
                Open email fallback
              </a>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line-light pt-6">
            <button
              type="button"
              onClick={() => setIndex(CONTACT_STEP - 1)}
              className="inline-flex min-h-11 items-center gap-2 text-[0.9rem] font-bold transition-colors duration-200 hover:text-gold-dark"
            >
              <span aria-hidden="true">←</span> Back
            </button>
            <SubmitButton type="submit" variant="secondary" disabled={status === "submitting"}>
              {status === "submitting" ? "Preparing…" : assessmentCopy.contact.submit}
            </SubmitButton>
          </div>

          <p className="text-[0.8rem] leading-relaxed text-muted-dark">
            Genesis uses these details to send your assessment and follow up about it. Completing
            the assessment does not create an account or commit either party to an engagement.
          </p>
        </form>
      )}
    </Card>
  );
}

function Results({
  findings,
  resultRef,
}: {
  findings: readonly { id: string; title: string; body: string }[];
  resultRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { results } = assessmentCopy;

  return (
    <div ref={resultRef} tabIndex={-1} role="status" className="mx-auto max-w-[56rem]">
      <Card>
        <Eyebrow>{results.eyebrow}</Eyebrow>
        <p className="mt-4 max-w-[60ch] text-[1.05rem] leading-relaxed">
          {findings.length ? results.intro : results.clear}
        </p>

        {findings.length ? (
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {findings.map((finding, position) => (
              <li key={finding.id} className="border-t border-line-light pt-5">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-[0.7rem] tracking-[0.14em] text-gold-dark">
                    {String(position + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[1.08rem] leading-snug tracking-[-0.015em]">{finding.title}</p>
                </div>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-dark">{finding.body}</p>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-7 border-t border-line-light pt-5 text-[0.84rem] leading-relaxed text-muted-dark">
          {results.caveat}
        </p>
      </Card>

      <Card tone="inverse" className="mt-4 text-center">
        <h2 className="mx-auto max-w-[22ch] text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.06] tracking-[-0.035em] text-balance">
          {results.ctaHeadline}
        </h2>
        <p className="mx-auto mt-4 max-w-[52ch] text-[0.98rem] leading-relaxed text-ivory/70">
          {results.ctaBody}
        </p>
        <div className="mt-8 flex justify-center">
          <ConsultationButton
            href="/contact"
            onClick={() => track("infrastructure_review_cta_clicked", { from: "assessment_results" })}
          >
            {results.ctaPrimary}
          </ConsultationButton>
        </div>
      </Card>
    </div>
  );
}
