import { getPack } from "../../packs/index.ts";
import type { PackQuestion } from "../../packs/types.ts";
import { platformCopy } from "./copy.ts";
import type { Answers } from "./draft.ts";
import type { Draft } from "./draft.ts";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SignupTextStep = {
  id: "name" | "email" | "business" | "trade" | "city";
  phase: "signup";
  kind: "text" | "email";
  field: "name" | "email" | "businessName" | "trade" | "city";
  prompt: string;
  help: string;
  label: string;
  autoComplete: string;
};

export type Step =
  | SignupTextStep
  | { id: "vertical"; phase: "signup"; kind: "vertical"; prompt: string; help: string }
  | { id: "consent"; phase: "signup"; kind: "consent"; prompt: string; help: string }
  | { id: string; phase: "onboarding"; kind: PackQuestion["kind"]; question: PackQuestion }
  | { id: "review"; phase: "review"; prompt: string; help: string };

const prompts = platformCopy.wizard.prompts;

const signupSteps: Step[] = [
  {
    id: "name",
    phase: "signup",
    kind: "text",
    field: "name",
    prompt: prompts.name,
    help: prompts.nameHelp,
    label: prompts.nameLabel,
    autoComplete: "name",
  },
  {
    id: "email",
    phase: "signup",
    kind: "email",
    field: "email",
    prompt: prompts.email,
    help: prompts.emailHelp,
    label: prompts.emailLabel,
    autoComplete: "email",
  },
  {
    id: "business",
    phase: "signup",
    kind: "text",
    field: "businessName",
    prompt: prompts.business,
    help: prompts.businessHelp,
    label: prompts.businessLabel,
    autoComplete: "organization",
  },
  {
    id: "vertical",
    phase: "signup",
    kind: "vertical",
    prompt: prompts.vertical,
    help: prompts.verticalHelp,
  },
  {
    id: "trade",
    phase: "signup",
    kind: "text",
    field: "trade",
    prompt: prompts.trade,
    help: prompts.tradeHelp,
    label: prompts.tradeLabel,
    autoComplete: "off",
  },
  {
    id: "city",
    phase: "signup",
    kind: "text",
    field: "city",
    prompt: prompts.city,
    help: prompts.cityHelp,
    label: prompts.cityLabel,
    autoComplete: "address-level2",
  },
  {
    id: "consent",
    phase: "signup",
    kind: "consent",
    prompt: prompts.consent,
    help: prompts.consentHelp,
  },
];

export function buildSteps(vertical: string): Step[] {
  const pack = getPack(vertical);
  const onboard: Step[] = (pack?.questions ?? []).map((question) => ({
    id: question.id,
    phase: "onboarding" as const,
    kind: question.kind,
    question,
  }));
  return [
    ...signupSteps,
    ...onboard,
    {
      id: "review",
      phase: "review",
      prompt: platformCopy.wizard.reviewTitle,
      help: platformCopy.wizard.reviewHelp,
    },
  ];
}

export function signupComplete(answers: Answers): boolean {
  return Boolean(
    answers.name.trim() &&
      emailPattern.test(answers.email.trim()) &&
      answers.businessName.trim() &&
      getPack(answers.vertical) &&
      answers.trade.trim() &&
      answers.city.trim() &&
      answers.consent,
  );
}

export function onboardingComplete(answers: Answers): boolean {
  const pack = getPack(answers.vertical);
  if (!pack) return false;
  return pack.questions.every((question) => {
    const value = answers.onboarding[question.id];
    if (question.kind === "text") return typeof value === "string" && value.trim().length > 0;
    if (question.kind === "single") return typeof value === "string" && value.length > 0;
    return Array.isArray(value) && value.length > 0;
  });
}

export function validateStep(step: Step, answers: Answers): string | null {
  if (step.phase === "review") return null;
  if (step.phase === "onboarding") {
    const value = answers.onboarding[step.question.id];
    if (step.question.kind === "text") {
      return typeof value === "string" && value.trim() ? null : platformCopy.errors.text;
    }
    if (step.question.kind === "single") {
      return typeof value === "string" && value ? null : platformCopy.errors.choice;
    }
    return Array.isArray(value) && value.length > 0 ? null : platformCopy.errors.choice;
  }
  if (step.kind === "vertical") {
    return getPack(answers.vertical) ? null : platformCopy.errors.vertical;
  }
  if (step.kind === "consent") {
    return answers.consent ? null : platformCopy.errors.consent;
  }
  const value = answers[step.field].trim();
  if (step.field === "email") return emailPattern.test(value) ? null : platformCopy.errors.email;
  if (!value) {
    if (step.field === "name") return platformCopy.errors.name;
    if (step.field === "businessName") return platformCopy.errors.business;
    if (step.field === "trade") return platformCopy.errors.trade;
    return platformCopy.errors.city;
  }
  return null;
}

/** Shows a valid step. The onboarding entry moves forward once, until the reader goes back. */
export function viewDraft(draft: Draft, entry: "signup" | "onboarding", adjustEntry: boolean): Draft {
  const steps = buildSteps(draft.answers.vertical);
  let next = draft;
  if (!steps.some((step) => step.id === next.stepId)) {
    next = { ...next, stepId: steps[0]?.id ?? "name" };
  }
  if (adjustEntry && entry === "onboarding") next = preferOnboarding(next);
  return next;
}

export function preferOnboarding(draft: Draft): Draft {
  if (!signupComplete(draft.answers) || !draft.config) {
    const steps = buildSteps(draft.answers.vertical);
    const consent = steps.find((step) => step.id === "consent");
    return { ...draft, stepId: consent?.id ?? "name" };
  }
  const steps = buildSteps(draft.answers.vertical);
  const current = steps.findIndex((step) => step.id === draft.stepId);
  const onboard = steps.find((step) => step.phase === "onboarding");
  const onboardIndex = onboard ? steps.findIndex((step) => step.id === onboard.id) : -1;
  if (onboard && (current < onboardIndex || current === -1)) {
    return { ...draft, stepId: onboard.id };
  }
  return draft;
}

export function signupPayload(answers: Answers) {
  return {
    name: answers.name.trim(),
    email: answers.email.trim(),
    business_name: answers.businessName.trim(),
    vertical: answers.vertical,
    trade: answers.trade.trim(),
    city: answers.city.trim(),
    consent: true as const,
  };
}
