"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Points } from "@/components/ui/Blocks";
import { SubmitButton } from "@/components/ui/Button";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { Eyebrow } from "@/components/ui/Section";
import { track } from "@/lib/analytics";
import {
  assessmentCopy,
  assessmentEdition,
  findingsFor,
  stepsFor,
  type Answers,
  type EditionRecommendation,
  type Question,
  type Step,
} from "@/lib/assessment";
import { contact } from "@/lib/content";
import { pricingPathForPersona } from "@/lib/editionPlans";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "error" | "done";

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
        "inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-[6px] border px-4 py-2 text-[0.92rem] transition-colors duration-200",
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

  const persona = typeof answers.persona === "string" ? answers.persona : undefined;
  /* A church walks the church path from step two on; everyone else the business one. */
  const steps = stepsFor(persona);
  const CONTACT_STEP = steps.length;
  const TOTAL = CONTACT_STEP + 1;
  const step = steps[index];
  const findings = useMemo(() => findingsFor(answers), [answers]);
  const recommended = assessmentEdition(persona);

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
    if (recommended) track("assessment_edition_recommended", { edition: recommended.edition });
  }, [status, findings.length, recommended]);

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
    /* Only the answers to the path they finished: a visitor who switched
       persona on step one does not send the other path's answers too. */
    const asked = steps.flatMap((group) => group.questions);
    const answered = Object.fromEntries(
      asked.filter((question) => answers[question.id] !== undefined).map((question) => [question.id, answers[question.id]]),
    );
    const payload = {
      ...answered,
      ...entries,
      consultation_requested: Boolean(entries.consultation_requested),
      assessment_result_categories: findings.map((finding) => finding.title).join(", "),
      ...context.current,
    };

    /* Composed first, so a network failure still leaves them a way to reach
       us that carries everything they just typed. */
    const lines = asked.map((question) => {
      const value = answers[question.id];
      return `${question.label} ${Array.isArray(value) ? value.join(", ") : (value ?? "")}`;
    });
    setFallbackHref(
      `mailto:${contact.email}?subject=${encodeURIComponent(
        recommended ? "Genesis Ministry Assessment" : "Genesis Infrastructure Assessment",
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

  if (status === "done") {
    return (
      <Results
        findings={findings}
        resultRef={resultRef}
        pricingHref={pricingPathForPersona(persona)}
        recommended={recommended}
        attendance={typeof answers.weekly_attendance === "string" ? answers.weekly_attendance : undefined}
      />
    );
  }

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

          {index === 0 && recommended ? (
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[6px] border border-gold/50 bg-gold-light/12 p-5">
              <Image src="/brand/mark-gold-on-light.svg" alt="" width={30} height={24} className="h-6 w-auto shrink-0" />
              <p className="min-w-0 flex-1 text-[0.95rem] leading-relaxed">
                {recommended.stepNote}{" "}
                <Link
                  href={recommended.page.href}
                  className="font-bold underline decoration-ink/30 underline-offset-4 hover:text-gold-dark"
                  onClick={() => track("assessment_edition_link_clicked", { edition: recommended.edition, from: "step_one" })}
                >
                  {recommended.page.label}
                </Link>
              </p>
            </div>
          ) : null}

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
              {recommended ? "Email" : "Work Email"} <span aria-hidden="true">*</span>
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
            {recommended ? "Church Name" : "Company / Team Name"}
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

type ResultFinding = { id: string; title: string; body: string; fit?: string };

/** Weekend sizes outside the 100 to 1,000 Genesis Ministry is built for. */
const OUTSIDE_MINISTRY_SIZE = new Set(["Under 100", "More than 1,000"]);

function Results({
  findings,
  resultRef,
  pricingHref,
  recommended,
  attendance,
}: {
  findings: readonly ResultFinding[];
  resultRef: React.RefObject<HTMLDivElement | null>;
  pricingHref: string;
  recommended: EditionRecommendation | null;
  attendance?: string;
}) {
  if (recommended) {
    return (
      <ChurchResults
        findings={findings}
        resultRef={resultRef}
        recommended={recommended}
        attendance={attendance}
      />
    );
  }

  const { results } = assessmentCopy;

  return (
    <div ref={resultRef} tabIndex={-1} role="status" className="mx-auto max-w-[56rem]">
      <Card>
        <Eyebrow>{results.eyebrow}</Eyebrow>
        <p className="mt-4 max-w-[60ch] text-[1.05rem] leading-relaxed">
          {findings.length ? results.intro : results.clear}
        </p>

        {findings.length ? <FindingList findings={findings} /> : null}

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
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <ConsultationButton
            href="/contact"
            onClick={() => track("infrastructure_review_cta_clicked", { from: "assessment_results" })}
          >
            {results.ctaPrimary}
          </ConsultationButton>
          <Link href={pricingHref} className={inverseLink}>
            See pricing
          </Link>
        </div>
      </Card>
    </div>
  );
}

const inverseLink =
  "inline-flex min-h-[52px] items-center justify-center rounded-[6px] border border-ivory/40 px-6 text-[0.84rem] leading-[1.1] font-bold tracking-[0.025em] text-ivory transition-colors duration-200 hover:border-ivory";

function FindingList({ findings }: { findings: readonly ResultFinding[] }) {
  return (
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
          {finding.fit ? (
            <p className="mt-3 border-l-2 border-gold/60 pl-3 text-[0.9rem] leading-relaxed">{finding.fit}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * A church's results open in a church's words: Genesis Ministry, its plans
 * and the call first, then what the answers point to, then the call again.
 */
function ChurchResults({
  findings,
  resultRef,
  recommended,
  attendance,
}: {
  findings: readonly ResultFinding[];
  resultRef: React.RefObject<HTMLDivElement | null>;
  recommended: EditionRecommendation;
  attendance?: string;
}) {
  const { results } = assessmentCopy;
  const bookCall = (from: string) => () => track("ministry_call_cta_clicked", { from });

  return (
    <div ref={resultRef} tabIndex={-1} role="status" className="mx-auto max-w-[56rem]">
      <Card>
        <div className="flex items-center gap-3">
          <Image src="/brand/mark-gold-on-light.svg" alt="" width={30} height={24} className="h-6 w-auto" />
          <Eyebrow>{results.churchEyebrow}</Eyebrow>
        </div>
        <h2 className="mt-4 text-[clamp(1.6rem,3vw,2.3rem)] leading-[1.08] tracking-[-0.035em] text-balance">
          {results.churchHeadline}
        </h2>
        <p className="mt-4 max-w-[62ch] text-[1.02rem] leading-relaxed">
          {findings.length ? results.churchIntro : results.churchClear}
        </p>

        <div className="mt-7 rounded-[6px] border border-gold/50 bg-gold-light/12 p-5 sm:p-6">
          <p className="font-display text-[0.66rem] font-semibold tracking-[0.16em] text-gold-dark uppercase">
            {recommended.eyebrow}
          </p>
          <p className="mt-2 text-[1.5rem] font-light tracking-[-0.03em]">{recommended.name}</p>
          <p className="mt-2 max-w-[64ch] text-[0.95rem] leading-relaxed text-muted-dark">{recommended.body}</p>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <Points items={recommended.points} />
            <div>
              <ul className="grid gap-2.5 text-[0.95rem]">
                {recommended.plans.map((plan) => (
                  <li key={plan} className="border-b border-line-light pb-2.5 last:border-b-0">
                    {plan}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[0.85rem] leading-relaxed text-muted-dark">{recommended.enterprise}</p>
            </div>
          </div>
          {attendance && OUTSIDE_MINISTRY_SIZE.has(attendance) ? (
            <p className="mt-5 text-[0.9rem] leading-relaxed">{results.churchSizeNote}</p>
          ) : null}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ConsultationButton href={recommended.call.href} onClick={bookCall("assessment_results_top")}>
              {recommended.call.label}
            </ConsultationButton>
            <Link
              href={recommended.page.href}
              className="inline-flex min-h-11 items-center text-[0.95rem] font-bold underline decoration-ink/30 underline-offset-4 hover:text-gold-dark"
              onClick={() => track("assessment_edition_link_clicked", { edition: recommended.edition, from: "results" })}
            >
              {recommended.page.label}
            </Link>
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <Eyebrow>{results.churchFindingsTitle}</Eyebrow>
        {findings.length ? (
          <FindingList findings={findings} />
        ) : (
          <p className="mt-4 max-w-[60ch] text-[0.98rem] leading-relaxed text-muted-dark">{results.churchClear}</p>
        )}
        <p className="mt-7 border-t border-line-light pt-5 text-[0.84rem] leading-relaxed text-muted-dark">
          {results.churchCaveat}
        </p>
      </Card>

      <Card tone="inverse" className="mt-4 text-center">
        <h2 className="mx-auto max-w-[22ch] text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.06] tracking-[-0.035em] text-balance">
          {results.churchCtaHeadline}
        </h2>
        <p className="mx-auto mt-4 max-w-[52ch] text-[0.98rem] leading-relaxed text-ivory/70">
          {results.churchCtaBody}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <ConsultationButton href={recommended.call.href} onClick={bookCall("assessment_results")}>
            {recommended.call.label}
          </ConsultationButton>
          <Link href={recommended.plansLink.href} className={inverseLink}>
            {recommended.plansLink.label}
          </Link>
        </div>
      </Card>
    </div>
  );
}
