"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { announceAudience } from "@/components/hooks/useAssessingChurch";
import { useReducedMotion } from "@/components/hooks/useMotionPreference";
import { Card, Sheet } from "@/components/ui/Blocks";
import { SubmitButton } from "@/components/ui/Button";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { Eyebrow } from "@/components/ui/Section";
import { track } from "@/lib/analytics";
import {
  ASSESSMENT_REVIEW_TOPIC,
  CHURCH_PERSONA,
  assessmentCopy,
  assessmentEdition,
  assessmentSummary,
  businessRecommendation,
  churchFindings,
  findingsFor,
  levelGapNote,
  levelLabel,
  planLabelBeside,
  questionLabel,
  questionOptions,
  stepsFor,
  suggestedMinistryPlan,
  toggleChoice,
  type Answers,
  type BusinessRecommendation,
  type EditionRecommendation,
  type MinistryPlanId,
  type Question,
  type Step,
  type SuggestedPlan,
} from "@/lib/assessment";
import { ASSESSMENT_HANDOFF_KEY, type AssessmentHandoff } from "@/lib/assessmentHandoff";
import { contact } from "@/lib/content";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "error" | "done";

/* Sentence case labels, the same voice as the questions. Inputs are 16px so a
   phone never zooms in on a tapped field. */
const field = "grid gap-2 text-[0.92rem] text-ink";
const control =
  "min-h-12 w-full border border-line-light bg-paper px-4 text-base text-ink transition-colors duration-200 focus-visible:border-gold-dark focus-visible:ring-2 focus-visible:ring-gold-dark/30";

/* One button system: the gold primary, an outline secondary of the same height. */
const outlineAction =
  "inline-flex min-h-[52px] w-full items-center justify-center rounded-[6px] border border-ink/30 px-6 text-center text-[0.94rem] leading-[1.15] font-bold tracking-[0.01em] text-ink transition-colors duration-200 hover:bg-ink hover:text-ivory";
const inverseAction =
  "inline-flex min-h-[52px] w-full items-center justify-center rounded-[6px] border border-ivory/40 px-6 text-center text-[0.94rem] leading-[1.15] font-bold tracking-[0.01em] text-ivory transition-colors duration-200 hover:border-ivory";
/* Paired buttons share one width: full width and stacked on phones, two equal columns from sm up. */
const actionPair = "grid w-full gap-3 sm:max-w-[36rem] sm:grid-cols-2";
/* Back and Continue under each step: two equal columns on a phone, two 180px buttons from sm up. */
const stepPair =
  "mt-4 grid grid-cols-2 gap-3 border-t border-line-light pt-6 sm:flex sm:items-center sm:justify-between";
const backAction =
  "inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[6px] border border-ink/30 px-4 text-[0.94rem] font-bold text-ink transition-colors duration-200 hover:bg-ink hover:text-ivory sm:w-auto sm:min-w-[180px]";

/* A step heading that takes focus when the step changes: a soft gold underline, never a hard box. */
const stepHeading =
  "rounded-[4px] text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.1] tracking-[-0.03em] text-balance outline-none focus-visible:underline focus-visible:decoration-gold focus-visible:decoration-2 focus-visible:underline-offset-8 [@media(max-height:500px)]:text-[1.25rem]";

/* The quiet hint after a question that may be skipped. It never breaks from the label's last
   word, so it never starts a line of its own with a stray indent. */
function Optional({ multi = false }: { multi?: boolean }) {
  return (
    <span className="text-[0.85rem] whitespace-nowrap text-muted-dark">
      {"\u00a0"}
      {multi ? "(optional, choose any)" : "(optional)"}
    </span>
  );
}

/**
 * The assessment page below the header: a short intro that speaks to a
 * business or, once a church says so, to a church, then the form. The intro
 * is kept short so the first question is on the first screen, and the
 * assessment's name is said once, on the card.
 *
 * `initialPersona` comes from the link (?for=church or ?persona=...), read on
 * the server, so the first render is already on the right path.
 */
export function AssessmentExperience({ initialPersona }: { initialPersona?: string }) {
  const [church, setChurch] = useState(initialPersona === CHURCH_PERSONA);
  const [done, setDone] = useState(false);
  const copy = church ? assessmentCopy.church : assessmentCopy;

  return (
    <>
      {/* The hero and the card share one column, so their left edges line up. Once the results
          show, the hero says so in one line. On a phone with the path already chosen by the
          link, the hero is the headline alone, so the first question starts high. */}
      <section className="border-b border-line-dark bg-ink pt-[calc(var(--header-height)+28px)] pb-16 text-ivory md:pt-[calc(var(--header-height)+44px)] md:pb-[72px] [@media(max-height:500px)]:pt-[calc(var(--header-height)+12px)] [@media(max-height:500px)]:pb-10">
        <div className="shell max-w-[56rem]">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h1 className="mt-4 max-w-[24ch] font-light text-[clamp(2.1rem,4.2vw,3.4rem)] leading-[1.04] text-balance [@media(max-height:500px)]:text-[1.6rem]">
            {done ? (church ? assessmentCopy.churchDoneHeadline : assessmentCopy.doneHeadline) : copy.headline}
          </h1>
          {done ? null : (
            <p
              className={cn(
                "mt-4 max-w-[60ch] text-[1rem] leading-relaxed text-ivory/72 [@media(max-height:500px)]:hidden",
                initialPersona && "max-sm:hidden",
              )}
            >
              {copy.summary[0]}
            </p>
          )}
        </div>
      </section>

      <Sheet surface="paper" rise className="pt-6! pb-[clamp(72px,9vw,120px)]! md:pt-8! [@media(max-height:500px)]:pt-3!">
        <AssessmentForm onChurchChange={setChurch} onDone={() => setDone(true)} initialPersona={initialPersona} />
      </Sheet>
    </>
  );
}

/** A choice, as a chip that fills when it is chosen. Radios get a round marker, checkboxes a square one. */
function Chip({
  name,
  value,
  label,
  kind,
  checked,
  onChange,
  describedBy,
  wide = false,
}: {
  name: string;
  value: string;
  label: string;
  wide?: boolean;
  kind: "single" | "multi";
  checked: boolean;
  onChange: () => void;
  describedBy?: string;
}) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-3 rounded-[6px] border px-4 py-2 text-[0.92rem] leading-snug transition-colors duration-200 sm:inline-flex",
        wide && "col-span-2",
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
      <Marker round={kind === "single"} checked={checked} />
      {label}
    </label>
  );
}

/** The drawn marker for a chip or a checkbox: never the browser's own, which follows the dark page theme. */
function Marker({ round = false, checked }: { round?: boolean; checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-4 shrink-0 place-items-center border-[1.5px]",
        round ? "rounded-full" : "rounded-[3px]",
        checked ? "border-gold-light bg-gold-light" : "border-ink/55 bg-white",
      )}
    >
      {checked && !round ? (
        <svg viewBox="0 0 12 12" className="size-3 text-ink">
          <path d="M2.5 6.2 5 8.6l4.6-5.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
      {checked && round ? <span className="size-1.5 rounded-full bg-ink" /> : null}
    </span>
  );
}

function QuestionBlock({
  question,
  answers,
  onAnswer,
  missing,
  collapsed,
  onExpand,
  persona,
}: {
  question: Question;
  persona: string | undefined;
  answers: Answers;
  onAnswer: (id: string, value: string | string[]) => void;
  missing: boolean;
  /** The persona came from the link: one summary row, with a way to change it. */
  collapsed?: boolean;
  onExpand?: () => void;
}) {
  const current = answers[question.id];
  const errorId = `${question.id}-error`;
  const label = questionLabel(question, persona);

  if (question.kind === "text") {
    return (
      <label className="grid gap-3" htmlFor={question.id}>
        <span className="text-[1.02rem] leading-snug tracking-[-0.01em]">
          {question.label}
          <Optional />
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

  if (collapsed && question.kind === "single" && typeof current === "string") {
    const chosen = question.options.find((option) => option.value === current);
    return (
      <div
        id={`q-${question.id}`}
        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-[6px] border border-gold/50 bg-gold-light/12 px-4 py-2"
      >
        <p className="text-[0.95rem]">
          <span>
            <span className="text-muted-dark">{assessmentCopy.answeringFor}: </span>
            <span className="font-semibold">{chosen?.label ?? current}</span>
          </span>
        </p>
        <button
          type="button"
          onClick={onExpand}
          aria-label={`${assessmentCopy.change}: ${label}`}
          className="inline-flex min-h-11 items-center text-[0.9rem] font-bold underline decoration-ink/30 underline-offset-4 hover:text-gold-dark"
        >
          {assessmentCopy.change}
        </button>
      </div>
    );
  }

  /* On a phone, each short answer (16 characters or fewer) takes half a row and each long one
     the whole row, judged answer by answer. A short answer left alone at the end of a run of
     short ones takes the whole row too, so no tile sits orphaned in half a row. */
  const options = questionOptions(question, persona);
  const short = (text: string) => text.length <= 16;
  const wideAt = options.map((option, at) => {
    if (!short(option.label)) return true;
    let run = 0;
    for (let back = at; back >= 0 && short(options[back].label); back -= 1) run += 1;
    const lastOfRun = at === options.length - 1 || !short(options[at + 1].label);
    return lastOfRun && run % 2 === 1;
  });

  return (
    <fieldset
      id={`q-${question.id}`}
      aria-invalid={missing || undefined}
      aria-describedby={missing ? errorId : undefined}
      className={cn(
        "grid scroll-mt-4 gap-3 rounded-[6px] transition-colors duration-200",
        missing && "-m-3 border border-gold-dark bg-gold-light/12 p-3",
      )}
    >
      <legend className="mb-3 text-[1.02rem] leading-snug tracking-[-0.01em]">
        {label}
        {question.kind === "multi" ? <Optional multi /> : question.optional ? <Optional /> : null}
      </legend>
      {missing ? (
        <p id={errorId} className="text-[0.88rem] font-semibold text-gold-dark">
          Choose one answer to continue.
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {options.map((option, at) => (
          <Chip
            key={option.value}
            wide={wideAt[at]}
            name={question.id}
            value={option.value}
            label={option.label}
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
  step.questions
    .filter((question) => question.kind === "single" && !question.optional && !answers[question.id])
    .map((question) => question.id);

type Who = { firstName: string; review: boolean };

export function AssessmentForm({
  onChurchChange,
  onDone,
  initialPersona,
}: { onChurchChange?: (church: boolean) => void; onDone?: () => void; initialPersona?: string } = {}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() => (initialPersona ? { persona: initialPersona } : {}));
  /* A persona that came with the link is shown as one row until the visitor asks to change it. */
  const [personaCollapsed, setPersonaCollapsed] = useState(Boolean(initialPersona));
  const [status, setStatus] = useState<Status>("idle");
  const [missing, setMissing] = useState<readonly string[]>([]);
  const [fallbackHref, setFallbackHref] = useState(`mailto:${contact.email}`);
  const [who, setWho] = useState<Who>({ firstName: "", review: false });
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
  }, []);

  useEffect(() => {
    onChurchChange?.(church);
    /* The header and footer follow the path: a church books a call and reads the Ministry line. */
    announceAudience(church ? "church" : "business");
  }, [church, onChurchChange]);

  /* Leaving the page puts the header and footer back. */
  useEffect(() => () => announceAudience("business"), []);

  /* A new step brings the card to the top of the screen, under the header,
     and moves focus to its heading so a screen reader lands on it. The first
     step is left where it is: nothing has moved yet. */
  useEffect(() => {
    if (status === "done") return;
    if (!movedRef.current) return;
    /* Every step change lands the card at the same place: its top just under the header. */
    headingRef.current?.focus({ preventScroll: true });
    /* After the new step has painted, so nothing that settles in the same frame cancels the scroll. */
    const frame = requestAnimationFrame(() => {
      const card = cardRef.current;
      if (!card) return;
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 88;
      const target = Math.max(window.scrollY + card.getBoundingClientRect().top - header - 8, 0);
      if (Math.abs(window.scrollY - target) > 4) window.scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    if (status !== "done") return;
    onDone?.();
    resultRef.current?.focus({ preventScroll: true });
    resultRef.current?.closest("[data-results]")?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
    track("assessment_result_viewed", { findings: findings.length, path });
    const edition =
      recommended?.edition ?? businessRecommendation(persona, typeof answers.team_size === "string" ? answers.team_size : undefined)?.edition;
    if (edition) track("assessment_edition_recommended", { edition, path });
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
      return `${questionLabel(question, persona)} ${Array.isArray(value) ? value.join(", ") : (value ?? "")}`;
    });
    setFallbackHref(
      `mailto:${contact.email}?subject=${encodeURIComponent(
        recommended ? "Genesis Ministry Assessment" : "Genesis Assessment",
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
         what they just typed and what the assessment found, so booking the
         call does not ask twice. */
      const handoff: AssessmentHandoff = {
        path,
        name: `${String(entries.first_name ?? "")} ${String(entries.last_name ?? "")}`.trim(),
        email: String(entries.email ?? ""),
        phone: String(entries.phone ?? ""),
        company: String(entries.company ?? ""),
        staff:
          typeof (church ? answers.church_staff : answers.team_size) === "string"
            ? String(church ? answers.church_staff : answers.team_size)
            : "",
        summary: assessmentSummary(answers, findings),
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
      <Card className="mx-auto max-w-[56rem] [@media(max-height:500px)]:py-4">
        {/* The assessment's name, said once, beside the step count. On a phone held sideways the
            two share one short row so the question starts high on the screen. */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-line-light pb-4 [@media(max-height:500px)]:flex-nowrap [@media(max-height:500px)]:pb-2">
          <p className="text-[0.88rem] text-muted-dark">{assessmentCopy.reassurance}</p>
          <p className="text-[0.88rem] font-semibold whitespace-nowrap">
            Step {index + 1} of {TOTAL}
          </p>
        </div>
        <div
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={TOTAL}
          aria-label="Assessment progress"
          className="mt-4 h-0.5 w-full bg-line-light [@media(max-height:500px)]:mt-2"
        >
          <span
            className="block h-full bg-gold-dark transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${((index + 1) / TOTAL) * 100}%` }}
          />
        </div>

        {step ? (
          <div className="mt-6 md:mt-8 [@media(max-height:500px)]:mt-3">
            <h2 ref={headingRef} tabIndex={-1} className={stepHeading}>
              {step.heading}
            </h2>

            <div className="mt-7 grid gap-8 [@media(max-height:500px)]:mt-4 [@media(max-height:500px)]:gap-6">
              {step.questions.map((question) => (
                <QuestionBlock
                  key={question.id}
                  question={question}
                  persona={persona}
                  answers={answers}
                  onAnswer={answer}
                  missing={missing.includes(question.id)}
                  collapsed={question.id === "persona" && personaCollapsed}
                  onExpand={() => setPersonaCollapsed(false)}
                />
              ))}
            </div>

            {index === 0 && recommended && !personaCollapsed ? (
              <div className="mt-8 rounded-[6px] border border-gold/50 bg-gold-light/12 p-5">
                <p className="text-[0.95rem] leading-relaxed">{recommended.stepNote}</p>
              </div>
            ) : null}

            {/* The line is always there, so the button below never jumps when it fills. */}
            <p role="alert" className="mt-6 min-h-[1.5rem] text-[0.9rem] font-semibold text-gold-dark">
              {missing.length ? "Please choose an answer for the highlighted question." : ""}
            </p>

            {/* Back and Continue are one even pair: the same height and the same width, an outlined
                Back beside the gold Continue. */}
            <div className={cn(stepPair, index === 0 && "max-sm:grid-cols-1")}>
              {index > 0 ? (
                <button type="button" onClick={() => goTo(Math.max(index - 1, 0))} className={backAction}>
                  <span aria-hidden="true">←</span> Back
                </button>
              ) : (
                <span className="max-sm:hidden" />
              )}
              <SubmitButton type="button" onClick={next} className="w-full sm:w-auto sm:min-w-[180px]">
                Continue <span aria-hidden="true">→</span>
              </SubmitButton>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 grid gap-6 md:mt-8">
            <div>
              <h2 ref={headingRef} tabIndex={-1} className={stepHeading}>
                {recommended ? assessmentCopy.contact.churchHeading : assessmentCopy.contact.heading}
              </h2>
              <p className="mt-3 max-w-[60ch] text-[0.95rem] leading-relaxed text-muted-dark">{assessmentCopy.contact.lede}</p>
            </div>

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

            {/* Drawn, not the browser's checkbox: the page's dark color scheme would paint an
                unchecked native box as a solid dark square on this light card. */}
            <label className="group flex min-h-11 cursor-pointer items-center gap-3 py-2 text-[0.95rem] leading-snug">
              <input type="checkbox" name="consultation_requested" className="peer sr-only" />
              <span
                aria-hidden="true"
                className="grid size-5 shrink-0 place-items-center rounded-[4px] border-[1.5px] border-ink/55 bg-white transition-colors duration-200 group-hover:border-gold-dark peer-checked:border-gold-dark peer-checked:bg-gold-light peer-focus-visible:ring-2 peer-focus-visible:ring-gold-dark/40 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
              >
                <svg viewBox="0 0 12 12" className="size-3.5 text-ink">
                  <path d="M2.5 6.2 5 8.6l4.6-5.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
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

            {/* The last step's label is longer: on a phone the two stack full width, the snapshot first. */}
            <div className={cn(stepPair, "mt-0 max-sm:grid-cols-1")}>
              <button type="button" onClick={() => goTo(CONTACT_STEP - 1)} className={cn(backAction, "max-sm:order-last")}>
                <span aria-hidden="true">←</span> Back
              </button>
              <SubmitButton type="submit" disabled={status === "submitting"} className="w-full sm:w-auto sm:min-w-[180px]">
                {status === "submitting" ? "Preparing…" : recommended ? assessmentCopy.contact.churchSubmit : assessmentCopy.contact.submit}
                {status === "submitting" ? null : <span aria-hidden="true">→</span>}
              </SubmitButton>
            </div>

            <p className="text-[0.875rem] leading-relaxed text-muted-dark">
              Genesis uses these details to follow up about your results. Completing the assessment
              does not create an account. {recommended ? "It does not sign your church up for anything." : "It does not sign you up for anything."}
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}

type ResultFinding = { id: string; title: string; body: string; fit?: string; plan?: MinistryPlanId; level?: "01" | "02" | "03" };

/** Weekend sizes outside the 100 to 1,000 Genesis Ministry is built for. */
const OUTSIDE_MINISTRY_SIZE = new Set(["Under 100", "More than 1,000"]);

function Received({ who }: { who: Who }) {
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

/** The results' opening card: the mark, the snapshot heading, the thanks and one line of intro. */
function SnapshotHeader({
  eyebrow,
  headline,
  intro,
  resultRef,
  who,
  children,
}: {
  eyebrow: string;
  headline: string;
  intro: string;
  resultRef: React.RefObject<HTMLHeadingElement | null>;
  who: Who;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        ref={resultRef}
        tabIndex={-1}
        className="mt-4 text-[clamp(1.6rem,3vw,2.3rem)] leading-[1.08] tracking-[-0.035em] text-balance outline-none"
      >
        {headline}
      </h2>
      <Received who={who} />
      <p className="mt-3 max-w-[62ch] text-[1rem] leading-relaxed text-muted-dark max-sm:hidden">{intro}</p>
      {children}
    </Card>
  );
}

/**
 * The two actions under a recommendation. Once they have asked us to review
 * the results with them, a second "Book a Call" would ask twice: the primary
 * becomes adding details for that call instead.
 */
function RecommendationActions({
  callHref,
  callLabel,
  secondary,
  review,
  onCall,
}: {
  callHref: string;
  callLabel: string;
  secondary: { label: string; href: string; onClick?: () => void };
  review: boolean;
  onCall: () => void;
}) {
  return (
    <div className="mt-6">
      {review ? <p className="mb-3 text-[0.95rem] leading-relaxed">{assessmentCopy.results.onTheList}</p> : null}
      <div className={actionPair}>
        <ConsultationButton href={callHref} className="w-full" onClick={onCall}>
          {review ? assessmentCopy.results.addDetails : callLabel}
        </ConsultationButton>
        <Link href={secondary.href} className={outlineAction} onClick={secondary.onClick}>
          {secondary.label}
        </Link>
      </div>
    </div>
  );
}

/** What the answers point to, in its own card, the same on both paths. */
function FindingsCard({
  title,
  lead,
  findings,
  nothing,
  caveat,
  labelFor,
}: {
  title: string;
  /** One intro line inside the card, under its label. */
  lead?: string;
  findings: readonly ResultFinding[];
  nothing: string;
  caveat: string;
  /** The small label beside a fit line, or null when the suggestion already says it. */
  labelFor: (finding: ResultFinding) => string | null;
}) {
  return (
    <Card className="mt-4">
      <Eyebrow>{title}</Eyebrow>
      {lead ? <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-dark">{lead}</p> : null}
      {findings.length ? (
        <ol className="mt-4 grid">
          {findings.map((finding, position) => (
            <li key={finding.id} className="grid gap-x-4 border-t border-line-light py-5 first:border-t-0 sm:grid-cols-[2.25rem_minmax(0,1fr)]">
              <span aria-hidden="true" className="font-display text-[0.8rem] tracking-[0.12em] text-gold-dark sm:pt-1">
                {String(position + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-[1.12rem] leading-snug tracking-[-0.015em]">{finding.title}</p>
                <p className="mt-2 max-w-[66ch] text-[0.95rem] leading-relaxed text-muted-dark">{finding.body}</p>
                {finding.fit ? (
                  <div className="mt-3 max-w-[66ch] border-l-2 border-gold/60 pl-3 text-[0.92rem] leading-relaxed">
                    {labelFor(finding) ? (
                      <p className="mb-1 font-display text-[0.75rem] font-semibold tracking-[0.12em] text-gold-dark uppercase">
                        {labelFor(finding)}
                      </p>
                    ) : null}
                    <p>{finding.fit}</p>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 max-w-[60ch] text-[0.98rem] leading-relaxed text-muted-dark">{nothing}</p>
      )}
      <p className="mt-7 border-t border-line-light pt-5 text-[0.84rem] leading-relaxed text-muted-dark">{caveat}</p>
      <PrintLink />
    </Card>
  );
}

/** The dark closing band: one headline, one line, the call and the plans. */
function CloseBand({
  headline,
  body,
  callHref,
  callLabel,
  secondary,
  onCall,
}: {
  headline: string;
  body: string;
  callHref: string;
  callLabel: string;
  secondary: { label: string; href: string };
  onCall: () => void;
}) {
  return (
    <Card tone="inverse" className="mt-4 text-center">
      <h2 className="mx-auto max-w-[22ch] text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.06] tracking-[-0.035em] text-balance">
        {headline}
      </h2>
      <p className="mx-auto mt-4 max-w-[52ch] text-[0.98rem] leading-relaxed text-ivory/70">{body}</p>
      <div className={cn(actionPair, "mx-auto mt-8")}>
        <ConsultationButton href={callHref} className="w-full" onClick={onCall}>
          {callLabel}
        </ConsultationButton>
        <Link href={secondary.href} className={inverseAction}>
          {secondary.label}
        </Link>
      </div>
    </Card>
  );
}

/** The plans or Levels as a short list, with the one that fits marked and its reason under it. */
function OptionList({
  items,
  fits,
  reason,
}: {
  items: readonly string[];
  fits: (item: string) => boolean;
  reason?: string;
}) {
  return (
    <ul className="grid gap-2 text-[0.95rem]">
      {items.map((item) => {
        const match = fits(item);
        return (
          <li
            key={item}
            className={cn(
              "rounded-[4px] border-l-2 py-2 pl-3",
              match ? "border-gold-dark bg-white/70 font-semibold" : "border-line-light",
            )}
          >
            {item}
            {match ? (
              <span className="mt-0.5 block font-display text-[0.72rem] font-semibold tracking-[0.12em] text-gold-dark uppercase">
                {assessmentCopy.results.suggestedLabel}
              </span>
            ) : null}
            {match && reason ? <span className="mt-1 block text-[0.88rem] font-normal text-muted-dark">{reason}</span> : null}
          </li>
        );
      })}
    </ul>
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
  who: Who;
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

  const edition = businessRecommendation(persona, typeof answers.team_size === "string" ? answers.team_size : undefined);
  return <BusinessResults findings={findings} resultRef={resultRef} edition={edition} who={who} />;
}

/**
 * A business's results, in the same order as a church's: the snapshot with the
 * edition built for them and the Level their team fits, then what the answers
 * point to, then the review.
 */
function BusinessResults({
  findings,
  resultRef,
  edition,
  who,
}: {
  findings: readonly ResultFinding[];
  resultRef: React.RefObject<HTMLHeadingElement | null>;
  edition: BusinessRecommendation | null;
  who: Who;
}) {
  const { results } = assessmentCopy;
  const reviewHref = `/contact?topic=${ASSESSMENT_REVIEW_TOPIC}#consultation-form`;
  const bookReview = (from: string) => () =>
    track("infrastructure_review_cta_clicked", { from, path: "business", edition: edition?.edition ?? "" });
  const suggested = edition?.suggested ?? null;
  const gap = levelGapNote(findings, suggested?.step);

  return (
    <div data-results className="mx-auto max-w-[56rem] scroll-mt-2">
      <p role="status" className="sr-only">
        Your snapshot is ready.
      </p>
      <SnapshotHeader
        eyebrow={results.eyebrow}
        headline={results.headline}
        intro={findings.length ? results.intro : results.clear}
        resultRef={resultRef}
        who={who}
      >
        {edition ? (
          <div className="mt-7 rounded-[6px] border border-gold/50 bg-gold-light/12 p-5 sm:p-6">
            <p className="font-display text-[0.75rem] font-semibold tracking-[0.12em] text-gold-dark uppercase">
              {results.editionEyebrow}
            </p>
            <p className="mt-2 text-[1.5rem] font-light tracking-[-0.03em]">{edition.name}</p>
            {suggested ? (
              <p className="mt-2 text-[1rem] leading-relaxed">
                <span className="font-semibold">Where we would start: {suggested.label}.</span>
              </p>
            ) : null}
            {gap ? <p className="mt-2 text-[0.95rem] leading-relaxed">{gap}</p> : null}
            <RecommendationActions
              callHref={reviewHref}
              callLabel={results.ctaPrimary}
              secondary={
                suggested?.step
                  ? { label: `See Level ${suggested.step} Pricing`, href: edition.pricingHref }
                  : { label: `See ${edition.name}`, href: edition.href }
              }
              review={who.review}
              onCall={bookReview("assessment_results_top")}
            />
            <div className="mt-6 border-t border-line-light pt-5">
              <OptionList
                items={edition.levels}
                fits={(level) => Boolean(suggested?.step) && level.startsWith(`Level ${suggested?.step},`)}
                reason={suggested?.reason}
              />
              {suggested && !suggested.step ? (
                <p className="mt-3 text-[0.92rem] leading-relaxed font-semibold">{suggested.reason}</p>
              ) : null}
            </div>

          </div>
        ) : null}
      </SnapshotHeader>

      <FindingsCard
        title={results.findingsTitle}
        findings={findings}
        nothing={results.nothing}
        caveat={results.caveat}
        labelFor={(finding) =>
          finding.level && finding.level !== (suggested?.step ?? "") ? levelLabel(finding.level) : null
        }
      />

      <CloseBand
        headline={results.ctaHeadline}
        body={results.ctaBody}
        callHref={reviewHref}
        callLabel={who.review ? results.addDetails : results.ctaPrimary}
        secondary={{ label: "See Pricing", href: edition?.pricingHref ?? "/pricing" }}
        onCall={bookReview("assessment_results")}
      />
    </div>
  );
}

/**
 * A church's results open in a church's words: where we would start, with
 * the call beside it, then the three plans, then what the answers point to,
 * then the call again.
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
  who: Who;
}) {
  const { results } = assessmentCopy;
  const outside = attendance ? OUTSIDE_MINISTRY_SIZE.has(attendance) : false;
  const callHref = suggested?.href ?? recommended.call.href;
  const bookCall = (from: string) => () =>
    track("ministry_call_cta_clicked", { from, plan: suggested?.id ?? "", path: "church" });

  return (
    <div data-results className="mx-auto max-w-[56rem] scroll-mt-2">
      <p role="status" className="sr-only">
        Your church snapshot is ready.
      </p>
      <SnapshotHeader
        eyebrow={results.churchEyebrow}
        headline={results.churchHeadline}
        intro={findings.length ? results.churchIntro : results.churchClear}
        resultRef={resultRef}
        who={who}
      >
        <div className="mt-7 rounded-[6px] border border-gold/50 bg-gold-light/12 p-5 sm:p-6">
          <p className="font-display text-[0.75rem] font-semibold tracking-[0.12em] text-gold-dark uppercase">
            {outside ? results.churchOutsideEyebrow : recommended.eyebrow}
          </p>
          <p className="mt-2 text-[1.5rem] font-light tracking-[-0.03em]">{recommended.name}</p>
          {suggested ? (
            <p className="mt-2 text-[1rem] leading-relaxed">
              <span className="font-semibold">
                {results.churchSuggested}: {suggested.name}, {suggested.price} a month.
              </span>{" "}
              {suggested.reason}
            </p>
          ) : null}
          {outside ? <p className="mt-3 text-[0.92rem] leading-relaxed">{results.churchSizeNote}</p> : null}
          <RecommendationActions
            callHref={callHref}
            callLabel={recommended.call.label}
            secondary={{
              label: recommended.page.label,
              href: recommended.page.href,
              onClick: () =>
                track("assessment_edition_link_clicked", { edition: recommended.edition, from: "results", path: "church" }),
            }}
            review={who.review}
            onCall={bookCall("assessment_results_top")}
          />
          <div className="mt-6 border-t border-line-light pt-5">
            <OptionList items={recommended.plans} fits={(plan) => Boolean(suggested) && plan.startsWith(`${suggested?.name},`)} />
            {suggested?.later ? <p className="mt-3 text-[0.9rem] leading-relaxed text-muted-dark">{suggested.later}</p> : null}
            <p className="mt-3 text-[0.88rem] leading-relaxed text-muted-dark">{recommended.enterprise}</p>
          </div>
        </div>
      </SnapshotHeader>

      <FindingsCard
        lead={
          suggested && findings.length && findings.every((finding) => finding.plan === suggested.id)
            ? `Everything below is in ${suggested.name}.`
            : undefined
        }
        title={results.churchFindingsTitle}
        findings={findings}
        nothing={results.churchNothing}
        caveat={results.churchCaveat}
        labelFor={(finding) => (finding.plan ? planLabelBeside(finding.plan, suggested?.id) : null)}
      />

      <CloseBand
        headline={suggested ? `Talk through ${suggested.name} for your church.` : results.churchCtaHeadline}
        body={results.churchCtaBody}
        callHref={callHref}
        callLabel={who.review ? results.addDetails : recommended.call.label}
        secondary={recommended.plansLink}
        onCall={bookCall("assessment_results")}
      />
    </div>
  );
}
