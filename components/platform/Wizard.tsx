"use client";

import { useEffect, useId, useRef, useState } from "react";
import { packs } from "@/packs";
import { buildClientConfig, validateSignup } from "@/lib/platform/config";
import { platformCopy } from "@/lib/platform/copy";
import { emptyDraft, type Draft } from "@/lib/platform/draft";
import { draftVertical } from "@/lib/platform/draft";
import {
  buildSteps,
  signupComplete,
  signupPayload,
  validateStep,
  viewDraft,
  type Step,
} from "@/lib/platform/flow";
import { usePlatformDraft } from "./usePlatformDraft";
import { cn } from "@/lib/utils";
import { Button, SubmitButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Blocks";
import { FundingDisclaimer, Notice, fieldLabel, textInput } from "./Chrome";

const wizard = platformCopy.wizard;

export function Wizard({
  entry,
  initialVertical = "",
}: {
  entry: "signup" | "onboarding";
  initialVertical?: string;
}) {
  const { hydrated, draft: stored, save } = usePlatformDraft();
  const [released, setReleased] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const heading = useRef<HTMLHeadingElement>(null);
  const errorId = useId();
  const draft = viewDraft(
    stored ?? emptyDraft(draftVertical(initialVertical)),
    entry,
    entry === "onboarding" && !released,
  );

  useEffect(() => {
    if (!hydrated) return;
    heading.current?.focus();
  }, [draft.stepId, hydrated]);

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-16" aria-busy="true">
        <Notice tone="loading" title={platformCopy.loading}>
          {platformCopy.saved}
        </Notice>
      </div>
    );
  }

  const steps = buildSteps(draft.answers.vertical);
  const step = steps.find((item) => item.id === draft.stepId) ?? steps[0];
  const index = Math.max(0, steps.findIndex((item) => item.id === step.id));
  const progress = Math.round(((index + 1) / steps.length) * 100);

  function commit(next: Draft) {
    save({ ...next, updatedAt: new Date().toISOString() });
  }

  function patched(partial: Partial<Draft["answers"]>): Draft {
    return { ...draft, answers: { ...draft.answers, ...partial } };
  }

  async function onContinue(event: React.FormEvent) {
    event.preventDefault();
    if (!step || step.phase === "review") return;
    const problem = validateStep(step, draft.answers);
    if (problem) {
      setError(problem);
      setStatus("idle");
      return;
    }
    setError(null);

    if (step.id === "consent") {
      setStatus("loading");
      try {
        const nextDraft = await ensureConfig(draft);
        const nextSteps = buildSteps(nextDraft.answers.vertical);
        const here = nextSteps.findIndex((item) => item.id === "consent");
        const following = nextSteps[here + 1];
        commit({ ...nextDraft, stepId: following?.id ?? "review" });
        setStatus("success");
      } catch (reason) {
        setStatus("idle");
        setError(reason instanceof Error ? reason.message : platformCopy.errors.network);
      }
      return;
    }

    const following = steps[index + 1];
    if (!following) return;
    commit({ ...refreshConfig(draft), stepId: following.id });
    setStatus("idle");
  }

  function onBack() {
    const previous = steps[index - 1];
    if (!previous) return;
    setError(null);
    setStatus("idle");
    setReleased(true);
    commit({ ...draft, stepId: previous.id });
  }

  const showReady = Boolean(draft.config) && step.phase !== "signup";
  const testId = step.phase === "review" ? "review-step" : step.phase === "onboarding" ? "onboarding-wizard" : "signup-wizard";

  return (
    <div className="mx-auto w-full max-w-xl px-4 pt-8" data-testid={testId}>
      <div
        className="h-2 overflow-hidden rounded-full bg-ink/10"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={index + 1}
        aria-label={platformCopy.progress}
      >
        <div
          className="h-full bg-gold transition-[width] duration-200 ease-editorial motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-4 font-display text-[0.69rem] tracking-[0.18em] text-gold-dark uppercase" aria-live="polite">
        {platformCopy.step} {index + 1} {platformCopy.of} {steps.length}
        <span className="sr-only">. </span>
        <span className="ml-4 normal-case tracking-normal text-ink/60">{platformCopy.saved}</span>
      </p>

      {entry === "onboarding" && !draft.config ? (
        <div className="mt-6">
          <Notice tone="error" title="Error">
            {wizard.basics}
          </Notice>
        </div>
      ) : null}

      <form className="mt-8 grid gap-6 pb-28 md:pb-0" onSubmit={onContinue}>
        <div className="grid gap-4">
          <h1
            ref={heading}
            tabIndex={-1}
            className="text-[clamp(2rem,4vw,3.15rem)] leading-[1.08] tracking-[-0.04em] text-balance outline-none"
          >
            {stepPrompt(step)}
          </h1>
          <p className="text-[1.125rem] leading-relaxed text-ink/75">{stepHelp(step)}</p>
        </div>

        {showReady ? (
          <Notice tone="success" title={platformCopy.ready}>
            {wizard.ready}
          </Notice>
        ) : null}
        {status === "loading" ? (
          <Notice tone="loading" title={platformCopy.preparing}>
            {platformCopy.preparing}
          </Notice>
        ) : null}
        {error ? (
          <Notice tone="error" title="Error">
            <span id={errorId}>{error}</span>
          </Notice>
        ) : null}

        <StepBody step={step} draft={draft} errorId={error ? errorId : undefined} onChange={commit} patch={patched} />

        {step.phase === "review" && draft.config ? <ReviewCard draft={draft} /> : null}

        {step.phase !== "review" ? (
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line-light bg-paper/95 p-4 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
            <div className="mx-auto flex w-full max-w-xl gap-2">
              {index > 0 ? (
                <SubmitButton type="button" variant="outline" className="min-h-14 flex-1 text-[1rem]" onClick={onBack}>
                  {platformCopy.back}
                </SubmitButton>
              ) : null}
              <SubmitButton type="submit" className="min-h-14 flex-1 text-[1rem]" disabled={status === "loading"}>
                {status === "loading" ? platformCopy.preparing : platformCopy.continue}
              </SubmitButton>
            </div>
          </div>
        ) : (
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line-light bg-paper/95 p-4 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
            <div className="mx-auto flex w-full max-w-xl gap-2">
              <SubmitButton type="button" variant="outline" className="min-h-14 flex-1 text-[1rem]" onClick={onBack}>
                {platformCopy.back}
              </SubmitButton>
              <Button href="/work" className="min-h-14 flex-1 text-[1rem]">
                {wizard.go}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function StepBody({
  step,
  draft,
  errorId,
  onChange,
  patch,
}: {
  step: Step;
  draft: Draft;
  errorId?: string;
  onChange: (next: Draft) => void;
  patch: (partial: Partial<Draft["answers"]>) => Draft;
}) {
  if (step.phase === "review") return null;
  if (step.phase === "onboarding") {
    return (
      <QuestionFields
        step={step}
        draft={draft}
        describedBy={errorId}
        onChange={onChange}
      />
    );
  }
  if (step.kind === "vertical") {
    return (
      <div role="radiogroup" aria-labelledby={errorId} className="grid gap-2">
        {packs.map((pack) => {
          const selected = draft.answers.vertical === pack.id;
          return (
            <button
              key={pack.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(patch({ vertical: pack.id }))}
              className={choiceClass(selected)}
            >
              <span className="block text-[1.125rem]">{pack.label}</span>
              <span className={cn("mt-1 block text-[1rem] leading-relaxed", selected ? "text-ivory/75" : "text-ink/70")}>
                {pack.promise}
              </span>
            </button>
          );
        })}
      </div>
    );
  }
  if (step.kind === "consent") {
    return (
      <label className="flex min-h-14 items-start gap-4 rounded-[6px] border border-line-light bg-white p-4 text-[1.05rem] leading-relaxed has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-ink">
        <input
          type="checkbox"
          className="mt-1 size-5 accent-gold-dark"
          checked={draft.answers.consent}
          aria-describedby={errorId}
          onChange={(event) => onChange(patch({ consent: event.target.checked }))}
        />
        <span>{wizard.consent}</span>
      </label>
    );
  }
  return (
    <label className="grid gap-2">
      <span className={fieldLabel}>{step.label}</span>
      <input
        className={textInput}
        type={step.kind === "email" ? "email" : "text"}
        inputMode={step.kind === "email" ? "email" : undefined}
        autoComplete={step.autoComplete}
        value={draft.answers[step.field]}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        onChange={(event) => onChange(patch({ [step.field]: event.target.value }))}
      />
    </label>
  );
}

function QuestionFields({
  step,
  draft,
  describedBy,
  onChange,
}: {
  step: Extract<Step, { phase: "onboarding" }>;
  draft: Draft;
  describedBy?: string;
  onChange: (next: Draft) => void;
}) {
  const question = step.question;
  const current = draft.answers.onboarding[question.id];
  function setValue(value: string | string[]) {
    onChange({
      ...draft,
      updatedAt: new Date().toISOString(),
      answers: {
        ...draft.answers,
        onboarding: { ...draft.answers.onboarding, [question.id]: value },
      },
    });
  }
  if (question.kind === "text") {
    return (
      <label className="grid gap-2">
        <span className={fieldLabel}>{question.prompt}</span>
        <input
          className={textInput}
          value={typeof current === "string" ? current : ""}
          aria-describedby={describedBy}
          onChange={(event) => setValue(event.target.value)}
        />
      </label>
    );
  }
  const options = question.options ?? [];
  return (
    <div className="grid gap-2" role={question.kind === "single" ? "radiogroup" : "group"} aria-describedby={describedBy}>
      {question.kind === "multi" ? <p className="text-[1.05rem] text-ink/70">{wizard.select}</p> : null}
      {options.map((option) => {
        const selected = Array.isArray(current) ? current.includes(option.value) : current === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role={question.kind === "single" ? "radio" : undefined}
            aria-checked={question.kind === "single" ? selected : undefined}
            aria-pressed={question.kind === "multi" ? selected : undefined}
            onClick={() => {
              if (question.kind === "single") setValue(option.value);
              else {
                const list = Array.isArray(current) ? current : [];
                setValue(selected ? list.filter((item) => item !== option.value) : [...list, option.value]);
              }
            }}
            className={choiceClass(selected)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ReviewCard({ draft }: { draft: Draft }) {
  const config = draft.config;
  if (!config) return null;
  const pack = packs.find((item) => item.id === config.vertical);
  const rows: { label: string; value: string }[] = [
    { label: wizard.fields.owner, value: config.owner_first_name },
    { label: wizard.fields.business, value: config.business_name },
    { label: wizard.fields.vertical, value: pack?.label ?? config.vertical },
    { label: wizard.fields.market, value: config.market },
    { label: wizard.fields.trade, value: config.trade },
    { label: wizard.fields.channels, value: config.channels.join(", ") || platformCopy.none },
    { label: wizard.fields.emailHours, value: wizard.hoursEmail },
    { label: wizard.fields.textHours, value: wizard.hoursText },
    { label: wizard.fields.texting, value: wizard.textingOff },
    { label: wizard.fields.caps, value: wizard.capsZero },
    { label: wizard.fields.outbound, value: wizard.outboundDry },
  ];
  if (config.vertical === "lending" && pack?.clientDesk) {
    rows.push({
      label: pack.clientDesk.modeLabel,
      value: config.broker_mode ? "On" : wizard.textingOff,
    });
  }
  return (
    <Card>
      <p className="text-[1.05rem] leading-relaxed text-ink/75">{wizard.stored}</p>
      <dl className="mt-6 grid gap-4">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-1 border-t border-line-light pt-4">
            <dt className={fieldLabel}>{row.label}</dt>
            <dd className="text-[1.125rem]">{row.value}</dd>
          </div>
        ))}
      </dl>
      {config.notices.map((notice) => (
        <div key={notice} className="mt-6">
          <FundingDisclaimer text={notice} />
        </div>
      ))}
      {config.vertical === "lending" && pack?.clientDesk ? (
        <p className="mt-4 text-[1.05rem] leading-relaxed text-ink/75">
          {config.broker_mode ? pack.clientDesk.modeHelp : pack.clientDesk.modeOffHelp}
        </p>
      ) : null}
      <details className="mt-6 border-t border-line-light pt-4">
        <summary className="min-h-12 cursor-pointer text-[1.05rem] font-medium">{wizard.file}</summary>
        <pre className="mt-4 overflow-x-auto rounded-[6px] bg-ink p-4 text-[0.85rem] leading-relaxed text-ivory">
          {JSON.stringify(config, null, 2)}
        </pre>
      </details>
    </Card>
  );
}

function stepPrompt(step: Step): string {
  return step.phase === "onboarding" ? step.question.prompt : step.prompt;
}

function stepHelp(step: Step): string {
  return step.phase === "onboarding" ? step.question.help : step.help;
}

function choiceClass(selected: boolean) {
  return cn(
    "min-h-14 rounded-[6px] border px-4 py-4 text-left text-[1.125rem] transition-colors duration-200 ease-editorial motion-reduce:transition-none",
    selected
      ? "border-ink bg-ink text-ivory"
      : "border-line-light bg-white text-ink hover:border-gold-dark",
  );
}

async function ensureConfig(draft: Draft): Promise<Draft> {
  const refreshed = refreshConfig(draft);
  if (refreshed.config) return refreshed;
  const response = await fetch("/api/platform/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(signupPayload(draft.answers)),
  });
  const body = (await response.json().catch(() => null)) as { error?: string; config?: Draft["config"] } | null;
  if (!response.ok || !body?.config) {
    throw new Error(body?.error || platformCopy.errors.request);
  }
  return { ...draft, config: body.config };
}

function refreshConfig(draft: Draft): Draft {
  if (!draft.config || !signupComplete(draft.answers)) return draft;
  const parsed = validateSignup(signupPayload(draft.answers));
  if (!parsed.ok) return draft;
  return {
    ...draft,
    config: buildClientConfig(
      parsed.value,
      draft.config.client_id,
      draft.answers.onboarding,
      draft.brokerModeOverride ?? undefined,
    ),
  };
}
