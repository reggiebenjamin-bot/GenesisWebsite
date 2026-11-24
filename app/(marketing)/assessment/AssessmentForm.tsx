"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "@/components/hooks/useMotionPreference";
import { Card, Points, Sheet } from "@/components/ui/Blocks";
import { SubmitButton } from "@/components/ui/Button";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { Eyebrow } from "@/components/ui/Section";
import { track } from "@/lib/analytics";
import {
  ASSESSMENT_REVIEW_TOPIC,
  CHURCH_PERSONA,
  assessmentCopy,
  assessmentEdition,
  businessRecommendation,
  churchFindings,
  findingsFor,
  personaFromParams,
  stepsFor,
  suggestedMinistryPlan,
  toggleChoice,
  type Answers,
  type BusinessRecommendation,
  type EditionRecommendation,
  type Question,
  type Step,
  type SuggestedPlan,
} from "@/lib/assessment";
import { ASSESSMENT_HANDOFF_KEY, AUDIENCE_EVENT, type AssessmentHandoff } from "@/lib/assessmentHandoff";
import { contact } from "@/lib/content";
import { pricingPathForPersona } from "@/lib/editionPlans";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "error" | "done";

/* Sentence case labels, the same voice as the questions. Inputs are 16px so a
   phone never zooms in on a tapped field. */
const field = "grid gap-2 text-[0.92rem] text-ink";
const control =
  "min-h-12 w-full border border-line-light bg-paper px-4 text-base text-ink transition-colors duration-200 focus-visible:border-gold-dark focus-visible:ring-2 focus-visible:ring-gold-dark/30";

/* One button system: the gold primary, an outline secondary of the same height. */
const outlineAction =
  "inline-flex min-h-[53px] w-full items-center justify-center rounded-[6px] border border-ink/30 px-6 text-center text-[0.84rem] leading-[1.1] font-bold tracking-[0.025em] text-ink transition-colors duration-200 hover:bg-ink hover:text-ivory";
const inverseAction =
  "inline-flex min-h-[53px] w-full items-center justify-center rounded-[6px] border border-ivory/40 px-6 text-center text-[0.84rem] leading-[1.1] font-bold tracking-[0.025em] text-ivory transition-colors duration-200 hover:border-ivory";
/* Paired buttons share one width: full width and stacked on phones, two equal columns from sm up. */
const actionPair = "grid w-full gap-3 sm:max-w-[36rem] sm:grid-cols-2";

/**
 * The assessment page below the header: a short intro that speaks to a
 * business or, once a church says so, to a church, then the form. The intro
 * is kept short so the first question is on the first screen.
 */
export function AssessmentExperience() {
  const [church, setChurch] = useState(false);
  const copy = church ? assessmentCopy.church : assessmentCopy;

  return (
    <>
      <section className="border-b border-line-dark bg-ink pt-[calc(var(--header-height)+28px)] pb-16 text-ivory md:pt-[calc(var(--header-height)+44px)] md:pb-[72px]">
        <div className="shell max-w-[980px]">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h1 className="mt-4 max-w-[24ch] text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.04] text-balance">
            {copy.headline}
          </h1>
          <p className="mt-4 max-w-[60ch] text-[1rem] leading-relaxed text-ivory/72">{copy.summary[0]}</p>
        </div>
      </section>

      <Sheet surface="paper" rise className="pt-6! pb-[clamp(72px,9vw,120px)]! md:pt-8!">
        <AssessmentForm onChurchChange={setChurch} />
      </Sheet>
    </>
  );
}

/** A choice, as a chip that fills when it is chosen. Radios get a round marker, checkboxes a square one. */
function Chip({
  name,
  value,
  kind,
  checked,
  onChange,
  describedBy,
}: {
  name: string;
  value: string;
  kind: "single" | "multi";
  checked: boolean;
  onChange: () => void;
  describedBy?: string;
}) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-3 rounded-[6px] border px-4 py-2 text-[0.92rem] leading-snug transition-colors duration-200 sm:inline-flex",
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
        aria-describedby={describedBy}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "grid size-4 shrink-0 place-items-center border-[1.5px]",
          kind === "single" ? "rounded-full" : "rounded-[3px]",
          checked ? "border-gold-light bg-gold-light" : "border-ink/45 bg-transparent",
        )}
      >
        {checked && kind === "multi" ? (
          <svg viewBox="0 0 12 12" className="size-3 text-ink">
            <path d="M2.5 6.2 5 8.6l4.6-5.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
        {checked && kind === "single" ? <span className="size-1.5 rounded-full bg-ink" /> : null}
      </span>
      {value}
    </label>
  );
}

function QuestionBlock({
  question,
  answers,
  onAnswer,
  missing,
}: {
  question: Question;
  answers: Answers;
  onAnswer: (id: string, value: string | string[]) => void;
  missing: boolean;
}) {
  const current = answers[question.id];
  const errorId = `${question.id}-error`;

  if (question.kind === "text") {
    return (
      <label className="grid gap-3" htmlFor={question.id}>
        <span className="text-[1.02rem] leading-snug tracking-[-0.01em]">
          {question.label} <span className="text-[0.85rem] text-muted-dark">(optional)</span>
        </span>
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
    );
  }

  const selected = Array.isArray(current) ? current : current ? [current] : [];
  /* Short answers sit two to a row on a phone; long ones take the full width. */
  const short = question.options.every((option) => option.label.length <= 16);

  return (
    <fieldset
      id={`q-${question.id}`}
      aria-invalid={missing || undefined}
      aria-describedby={missing ? errorId : undefined}
      className={cn(
        "grid scroll-mt-4 gap-3.5 rounded-[6px] transition-colors duration-200",
        missing && "-m-3 border border-gold-dark bg-gold-light/12 p-3",
      )}
    >
      <legend className="text-[1.02rem] leading-snug tracking-[-0.01em]">
        {question.label}
        {question.kind === "multi" ? (
          <span className="ml-2 text-[0.85rem] text-muted-dark">Optional. Choose all that apply.</span>
        ) : null}
      </legend>
      {missing ? (
        <p id={errorId} className="text-[0.88rem] font-semibold text-gold-dark">
          Choose one answer to continue.
        </p>
      ) : null}
      <div className={cn("grid gap-2 sm:flex sm:flex-wrap", short ? "grid-cols-2" : "grid-cols-1")}>
        {question.options.map((option) => (
          <Chip
            key={option.value}
            name={question.id}
            value={option.value}
            kind={question.kind}
            checked={selected.includes(option.value)}
            describedBy={missing ? errorId : undefined}
            onChange={() =>
              onAnswer(
                question.id,
                question.kind === "single" ? option.value : toggleChoice(question, selected, option.value),
              )
            }
          />
        ))}
      </div>
    </fieldset>
  );
}

/** The single-choice questions on a step still waiting for an answer. Only those are required. */
const unanswered = (step: Step, answers: Answers) =>
  step.questions.filter((question) => question.kind === "single" && !answers[question.id]).map((question) => question.id);

export function AssessmentForm({ onChurchChange }: { onChurchChange?: (church: boolean) => void } = {}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [status, setStatus] = useState<Status>("idle");
  const [missing, setMissing] = useState<readonly string[]>([]);
  const [fallbackHref, setFallbackHref] = useState(`mailto:${contact.email}`);
  const [who, setWho] = useState<{ firstName: string; review: boolean }>({ firstName: "", review: false });
  const startedRef = useRef(false);
  const movedRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const context = useRef<Record<string, string>>({});
  const reduced = useReducedMotion();

  const persona = typeof answers.persona === "string" ? answers.persona : undefined;
  const church = persona === CHURCH_PERSONA;
  const path = church ? "church" : "business";
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
    /* /assessment?for=church (or ?persona=lending from an edition page) opens on that path. */
    const preset = personaFromParams(params);
    if (!preset) return;
    /* Applied on the next frame, after hydration, so the server and first client render agree. */
    const frame = requestAnimationFrame(() =>
      setAnswers((previous) => (previous.persona ? previous : { ...previous, persona: preset })),
    );
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    onChurchChange?.(church);
    /* The header's call to action follows the path: a church books a call, not a business assessment. */
    window.dispatchEvent(new CustomEvent(AUDIENCE_EVENT, { detail: church ? "church" : "business" }));
  }, [church, onChurchChange]);

  /* Leaving the page puts the header back. */
  useEffect(() => () => void window.dispatchEvent(new CustomEvent(AUDIENCE_EVENT, { detail: "business" })), []);

  /* A new step brings the card to the top of the screen, under the header,
     and moves focus to its heading so a screen reader lands on it. The first
     step is left where it is: nothing has moved yet. */
  useEffect(() => {
    if (status === "done") return;
    if (!movedRef.current) return;
    const card = cardRef.current;
    if (card) {
      const top = card.getBoundingClientRect().top;
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 88;
      if (top < 0 || top > header + 48) card.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
    }
    headingRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    if (status !== "done") return;
    resultRef.current?.focus({ preventScroll: true });
    resultRef.current?.closest("[data-results]")?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
    track("assessment_result_viewed", { findings: findings.length, path });
    if (recommended) track("assessment_edition_recommended", { edition: recommended.edition, path });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function answer(id: string, value: string | string[]) {
    if (!startedRef.current) {
      startedRef.current = true;
      track("assessment_started", { path });
    }
    setMissing((previous) => previous.filter((item) => item !== id));
    setAnswers((previous) => ({ ...previous, [id]: value }));
  }

  function goTo(next: number) {
    movedRef.current = true;
    setMissing([]);
    setIndex(next);
  }

  function next() {
    if (step) {
      const waiting = unanswered(step, answers);
      if (waiting.length) {
        setMissing(waiting);
        /* Point at the first question still waiting: bring it into view and focus its first choice. */
        const first = waiting[0];
        requestAnimationFrame(() => {
          document.getElementById(`q-${first}`)?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
          document.querySelector<HTMLInputElement>(`input[name="${first}"]`)?.focus({ preventScroll: true });
        });
        return;
      }
    }
    track("assessment_step_completed", { step: index + 1, id: step?.id ?? "contact", path });
    goTo(Math.min(index + 1, CONTACT_STEP));
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
      track("assessment_completed", { findings: findings.length, path });
      track("assessment_lead_captured", { path });
      /* Held for this tab only, never in a URL: the contact form fills in
         what they just typed, so booking the call does not ask twice. */
      const handoff: AssessmentHandoff = {
        path,
        name: `${String(entries.first_name ?? "")} ${String(entries.last_name ?? "")}`.trim(),
        email: String(entries.email ?? ""),
        phone: String(entries.phone ?? ""),
        company: String(entries.company ?? ""),
        staff: typeof answers.church_staff === "string" ? answers.church_staff : "",
      };
      try {
        window.sessionStorage.setItem(ASSESSMENT_HANDOFF_KEY, JSON.stringify(handoff));
      } catch {
        /* Private windows may refuse storage; the contact form then starts empty. */
      }
      setWho({ firstName: String(entries.first_name ?? "").trim(), review: Boolean(entries.consultation_requested) });
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
        persona={persona}
        answers={answers}
        recommended={recommended}
        who={who}
      />
    );
  }

  return (
    <div ref={cardRef} className="scroll-mt-2">
      <Card className="mx-auto max-w-[56rem]">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line-light pb-4">
          <Eyebrow>{church ? assessmentCopy.church.eyebrow : assessmentCopy.cardEyebrow}</Eyebrow>
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
          <div className="mt-6 md:mt-8">
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.1] tracking-[-0.03em] text-balance"
            >
              {step.heading}
            </h2>

            <div className="mt-7 grid gap-9">
              {step.questions.map((question) => (
                <QuestionBlock
                  key={question.id}
                  question={question}
                  answers={answers}
                  onAnswer={answer}
                  missing={missing.includes(question.id)}
                />
              ))}
            </div>

            {index === 0 && recommended ? (
              <div className="mt-8 flex items-start gap-4 rounded-[6px] border border-gold/50 bg-gold-light/12 p-5">
                <Image src="/brand/mark-gold-on-light.svg" alt="" width={30} height={24} className="mt-0.5 h-6 w-auto shrink-0" />
                <p className="min-w-0 flex-1 text-[0.95rem] leading-relaxed">{recommended.stepNote}</p>
              </div>
            ) : null}

            {/* The line is always there, so the button below never jumps when it fills. */}
            <p role="alert" className="mt-6 min-h-[1.5rem] text-[0.9rem] font-semibold text-gold-dark">
              {missing.length ? "Please choose an answer for the highlighted question." : ""}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-line-light pt-6">
              {index > 0 ? (
                <button
                  type="button"
                  onClick={() => goTo(Math.max(index - 1, 0))}
                  className="inline-flex min-h-11 items-center gap-2 text-[0.9rem] font-bold transition-colors duration-200 hover:text-gold-dark"
                >
                  <span aria-hidden="true">←</span> Back
                </button>
              ) : (
                <span />
              )}
              <SubmitButton type="button" onClick={next} className="min-w-[180px] shrink-0 max-sm:flex-1">
                Continue
              </SubmitButton>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 grid gap-6 md:mt-8">
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.1] tracking-[-0.03em] text-balance"
            >
              {assessmentCopy.contact.heading}
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={field}>
                <span>
                  First name <span aria-hidden="true" className="text-gold-dark">*</span>
                </span>
                <input name="first_name" autoComplete="given-name" required className={control} />
              </label>
              <label className={field}>
                <span>
                  Last name <span aria-hidden="true" className="text-gold-dark">*</span>
                </span>
                <input name="last_name" autoComplete="family-name" required className={control} />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={field}>
                <span>
                  {recommended ? "Email" : "Work email"} <span aria-hidden="true" className="text-gold-dark">*</span>
                </span>
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
                <span>
                  Phone <span className="text-muted-dark">(optional)</span>
                </span>
                <input name="phone" type="tel" autoComplete="tel" className={control} />
              </label>
            </div>

            <label className={field}>
              <span>
                {recommended ? "Church name" : "Company or team name"} <span className="text-muted-dark">(optional)</span>
              </span>
              <input name="company" autoComplete="organization" className={control} />
            </label>

            <label className="flex min-h-11 cursor-pointer items-center gap-3 py-2 text-[0.95rem] leading-snug">
              <input
                type="checkbox"
                name="consultation_requested"
                className="size-5 shrink-0 accent-[var(--color-gold-dark)]"
              />
              {assessmentCopy.contact.consent}
            </label>

            {/* Honeypot: hidden from people, irresistible to bots. */}
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
                <a href={fallbackHref} className="mt-2 inline-flex min-h-11 items-center border-b border-ink/30">
                  Open email fallback
                </a>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line-light pt-6">
              <button
                type="button"
                onClick={() => goTo(CONTACT_STEP - 1)}
                className="inline-flex min-h-11 items-center gap-2 text-[0.9rem] font-bold transition-colors duration-200 hover:text-gold-dark"
              >
                <span aria-hidden="true">←</span> Back
              </button>
              <SubmitButton type="submit" disabled={status === "submitting"} className="min-w-[180px] max-sm:flex-1">
                {status === "submitting" ? "Preparing…" : assessmentCopy.contact.submit}
              </SubmitButton>
            </div>

            <p className="text-[0.8rem] leading-relaxed text-muted-dark">
              Genesis uses these details to follow up about your results. Completing the assessment
              does not create an account or commit either party to an engagement.
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}

type ResultFinding = { id: string; title: string; body: string; fit?: string };

/** Weekend sizes outside the 100 to 1,000 Genesis Ministry is built for. */
const OUTSIDE_MINISTRY_SIZE = new Set(["Under 100", "More than 1,000"]);

function Received({ who }: { who: { firstName: string; review: boolean } }) {
  const { results } = assessmentCopy;
  return (
    <p className="mt-4 max-w-[62ch] text-[1.02rem] leading-relaxed">
      {who.firstName ? `Thanks, ${who.firstName}. ` : "Thanks. "}
      {results.received}
      {who.review ? ` ${results.reviewRequested}` : ""}
    </p>
  );
}

function PrintLink() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mt-4 inline-flex min-h-11 items-center text-[0.88rem] font-bold underline decoration-ink/30 underline-offset-4 hover:text-gold-dark print:hidden"
    >
      {assessmentCopy.results.print}
    </button>
  );
}

function Results({
  findings,
  resultRef,
  persona,
  answers,
  recommended,
  who,
}: {
  findings: readonly ResultFinding[];
  resultRef: React.RefObject<HTMLHeadingElement | null>;
  persona: string | undefined;
  answers: Answers;
  recommended: EditionRecommendation | null;
  who: { firstName: string; review: boolean };
}) {
  if (recommended) {
    const attendance = typeof answers.weekly_attendance === "string" ? answers.weekly_attendance : undefined;
    return (
      <ChurchResults
        findings={findings}
        resultRef={resultRef}
        recommended={recommended}
        attendance={attendance}
        suggested={suggestedMinistryPlan(answers, churchFindings(answers))}
        who={who}
      />
    );
  }

  const { results } = assessmentCopy;
  const edition = businessRecommendation(persona, typeof answers.team_size === "string" ? answers.team_size : undefined);
  const pricingHref = pricingPathForPersona(persona);

  return (
    <div data-results className="mx-auto max-w-[56rem] scroll-mt-2">
      <p role="status" className="sr-only">
        Your snapshot is ready.
      </p>
      <Card>
        <div className="flex items-center gap-3">
          <Image src="/brand/mark-gold-on-light.svg" alt="" width={30} height={24} className="h-6 w-auto" />
          <Eyebrow>{results.eyebrow}</Eyebrow>
        </div>
        <h2
          ref={resultRef}
          tabIndex={-1}
          className="mt-4 text-[clamp(1.6rem,3vw,2.3rem)] leading-[1.08] tracking-[-0.035em] text-balance"
        >
          {results.headline}
        </h2>
        <Received who={who} />
        <p className="mt-3 max-w-[62ch] text-[1rem] leading-relaxed text-muted-dark">
          {findings.length ? results.intro : results.clear}
        </p>

        {findings.length ? <FindingList findings={findings} /> : null}

        {edition ? <BusinessEditionCard edition={edition} /> : null}

        <p className="mt-7 border-t border-line-light pt-5 text-[0.84rem] leading-relaxed text-muted-dark">
          {results.caveat}
        </p>
        <PrintLink />
      </Card>

      <Card tone="inverse" className="mt-4 text-center">
        <h2 className="mx-auto max-w-[22ch] text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.06] tracking-[-0.035em] text-balance">
          {results.ctaHeadline}
        </h2>
        <p className="mx-auto mt-4 max-w-[52ch] text-[0.98rem] leading-relaxed text-ivory/70">
          {results.ctaBody}
        </p>
        <div className={cn(actionPair, "mx-auto mt-8")}>
          <ConsultationButton
            href={`/contact?topic=${ASSESSMENT_REVIEW_TOPIC}#consultation-form`}
            className="w-full"
            onClick={() => track("infrastructure_review_cta_clicked", { from: "assessment_results", path: "business" })}
          >
            {results.ctaPrimary}
          </ConsultationButton>
          <Link href={pricingHref} className={inverseAction}>
            See Pricing
          </Link>
        </div>
      </Card>
    </div>
  );
}

/** The edition built for this business, with its Levels and its own disclaimer. */
function BusinessEditionCard({ edition }: { edition: BusinessRecommendation }) {
  return (
    <div className="mt-8 rounded-[6px] border border-gold/50 bg-gold-light/12 p-5 sm:p-6">
      <p className="font-display text-[0.66rem] font-semibold tracking-[0.16em] text-gold-dark uppercase">
        {assessmentCopy.results.editionEyebrow}
      </p>
      <p className="mt-2 text-[1.5rem] font-light tracking-[-0.03em]">{edition.name}</p>
      <p className="mt-2 max-w-[64ch] text-[0.95rem] leading-relaxed text-muted-dark">{edition.body}</p>
      <div className="mt-5 grid gap-6 md:grid-cols-2 md:items-start">
        <Points items={edition.points} />
        <ul className="grid gap-2.5 text-[0.92rem]">
          {edition.levels.map((level) => (
            <li key={level} className="border-b border-line-light pb-2.5 last:border-b-0">
              {level}
            </li>
          ))}
        </ul>
      </div>
      {edition.enterpriseNote ? (
        <p className="mt-4 text-[0.9rem] leading-relaxed">{edition.enterpriseNote}</p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1">
        <Link
          href={edition.href}
          className="inline-flex min-h-11 items-center text-[0.95rem] font-bold underline decoration-ink/30 underline-offset-4 hover:text-gold-dark"
        >
          See {edition.name}
        </Link>
      </div>
      <p className="mt-3 text-[0.8rem] text-muted-dark">{edition.disclaimer}</p>
    </div>
  );
}

function FindingList({ findings }: { findings: readonly ResultFinding[] }) {
  return (
    <ol className="mt-7 grid">
      {findings.map((finding, position) => (
        <li key={finding.id} className="grid gap-x-4 border-t border-line-light py-5 sm:grid-cols-[2.25rem_minmax(0,1fr)]">
          <span aria-hidden="true" className="font-display text-[0.78rem] tracking-[0.14em] text-gold-dark sm:pt-1">
            {String(position + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="text-[1.12rem] leading-snug tracking-[-0.015em]">{finding.title}</p>
            <p className="mt-2 max-w-[66ch] text-[0.95rem] leading-relaxed text-muted-dark">{finding.body}</p>
            {finding.fit ? (
              <p className="mt-3 max-w-[66ch] border-l-2 border-gold/60 pl-3 text-[0.92rem] leading-relaxed">{finding.fit}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * A church's results open in a church's words: Genesis Ministry with the
 * plan the answers point to, then what the answers point to, then the call.
 */
function ChurchResults({
  findings,
  resultRef,
  recommended,
  attendance,
  suggested,
  who,
}: {
  findings: readonly ResultFinding[];
  resultRef: React.RefObject<HTMLHeadingElement | null>;
  recommended: EditionRecommendation;
  attendance?: string;
  suggested: SuggestedPlan | null;
  who: { firstName: string; review: boolean };
}) {
  const { results } = assessmentCopy;
  const outside = attendance ? OUTSIDE_MINISTRY_SIZE.has(attendance) : false;
  const callHref = `${suggested?.href ?? recommended.call.href}#consultation-form`;
  const bookCall = (from: string) => () =>
    track("ministry_call_cta_clicked", { from, plan: suggested?.id ?? "", path: "church" });

  return (
    <div data-results className="mx-auto max-w-[56rem] scroll-mt-2">
      <p role="status" className="sr-only">
        Your church snapshot is ready.
      </p>
      <Card>
        <div className="flex items-center gap-3">
          <Image src="/brand/mark-gold-on-light.svg" alt="" width={30} height={24} className="h-6 w-auto" />
          <Eyebrow>{results.churchEyebrow}</Eyebrow>
        </div>
        <h2
          ref={resultRef}
          tabIndex={-1}
          className="mt-4 text-[clamp(1.6rem,3vw,2.3rem)] leading-[1.08] tracking-[-0.035em] text-balance"
        >
          {results.churchHeadline}
        </h2>
        <Received who={who} />
        <p className="mt-3 max-w-[62ch] text-[1rem] leading-relaxed text-muted-dark">
          {findings.length ? results.churchIntro : results.churchClear}
        </p>

        <div className="mt-7 rounded-[6px] border border-gold/50 bg-gold-light/12 p-5 sm:p-6">
          <p className="font-display text-[0.66rem] font-semibold tracking-[0.16em] text-gold-dark uppercase">
            {outside ? results.churchOutsideEyebrow : recommended.eyebrow}
          </p>
          <p className="mt-2 text-[1.5rem] font-light tracking-[-0.03em]">{recommended.name}</p>
          <p className="mt-2 max-w-[64ch] text-[0.95rem] leading-relaxed text-muted-dark">{recommended.body}</p>
          {outside ? <p className="mt-3 text-[0.92rem] leading-relaxed">{results.churchSizeNote}</p> : null}
          <div className="mt-5 grid gap-6 md:grid-cols-2 md:items-start">
            <Points items={recommended.points} />
            <div>
              <ul className="grid gap-2 text-[0.95rem]">
                {recommended.plans.map((plan) => {
                  const fits = suggested ? plan.startsWith(`${suggested.name},`) : false;
                  return (
                    <li
                      key={plan}
                      className={cn(
                        "rounded-[4px] border-l-2 py-2 pl-3",
                        fits ? "border-gold-dark bg-white/70 font-semibold" : "border-line-light",
                      )}
                    >
                      {plan}
                      {fits ? (
                        <span className="mt-0.5 block font-display text-[0.62rem] font-semibold tracking-[0.14em] text-gold-dark uppercase">
                          Fits what you told us
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-[0.85rem] leading-relaxed text-muted-dark">{recommended.enterprise}</p>
            </div>
          </div>
          {suggested ? (
            <p className="mt-5 text-[0.95rem] leading-relaxed">
              <span className="font-semibold">
                {results.churchSuggested}: {suggested.name}, {suggested.price} a month.
              </span>{" "}
              {suggested.reason}
            </p>
          ) : null}
          <div className={cn(actionPair, "mt-6")}>
            <ConsultationButton href={callHref} className="w-full" onClick={bookCall("assessment_results_top")}>
              {recommended.call.label}
            </ConsultationButton>
            <Link
              href={recommended.page.href}
              className={outlineAction}
              onClick={() => track("assessment_edition_link_clicked", { edition: recommended.edition, from: "results", path: "church" })}
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
          <p className="mt-4 max-w-[60ch] text-[0.98rem] leading-relaxed text-muted-dark">{results.churchNothing}</p>
        )}
        <p className="mt-7 border-t border-line-light pt-5 text-[0.84rem] leading-relaxed text-muted-dark">
          {results.churchCaveat}
        </p>
        <PrintLink />
      </Card>

      <Card tone="inverse" className="mt-4 text-center">
        <h2 className="mx-auto max-w-[22ch] text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.06] tracking-[-0.035em] text-balance">
          {suggested ? `Talk through ${suggested.name} for your church.` : results.churchCtaHeadline}
        </h2>
        <p className="mx-auto mt-4 max-w-[52ch] text-[0.98rem] leading-relaxed text-ivory/70">
          {results.churchCtaBody}
        </p>
        <div className={cn(actionPair, "mx-auto mt-8")}>
          <ConsultationButton href={callHref} className="w-full" onClick={bookCall("assessment_results")}>
            {recommended.call.label}
          </ConsultationButton>
          <Link href={recommended.plansLink.href} className={inverseAction}>
            {recommended.plansLink.label}
          </Link>
        </div>
      </Card>
    </div>
  );
}
