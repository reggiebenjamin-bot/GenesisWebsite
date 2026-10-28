import { getPack } from "../../packs/index.ts";
import type { Pack, PackQuestion, VerticalId } from "../../packs/types.ts";
import { isVerticalId } from "../../packs/types.ts";
import { fundingDisclaimer, platformCopy } from "./copy.ts";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const contractHours = {
  days: "Mon to Sat",
  email: "6 AM to 8 PM CT",
  text: "9 AM to 8 PM CT",
} as const;

export type OnboardingAnswers = Record<string, string | string[]>;

export type SignupInput = {
  name: string;
  email: string;
  businessName: string;
  vertical: VerticalId;
  trade: string;
  city: string;
  consent: true;
};

export type ClientConfig = {
  client_id: string;
  business_name: string;
  vertical: VerticalId;
  market: string;
  owner_first_name: string;
  channels: string[];
  hours: {
    days: "Mon to Sat";
    email: "6 AM to 8 PM CT";
    text: "9 AM to 8 PM CT";
  };
  sms_live: false;
  caps: 0;
  dry_run: true;
  storage: "none";
  stub: true;
  owner_email: string;
  trade: string;
  onboarding: OnboardingAnswers;
  broker_mode?: boolean;
  notices: string[];
};

export type SignupResult =
  | { ok: true; value: SignupInput }
  | { ok: false; error: string };

export type CheckInput = {
  businessName: string;
  city: string;
  email: string;
  note: string;
};

export type CheckResult = { ok: true; value: CheckInput } | { ok: false; error: string };

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export function ownerFirstName(name: string): string {
  const [first] = name.trim().split(/\s+/);
  return first ?? "";
}

export function newClientId(): string {
  return `stub_${crypto.randomUUID().replaceAll("-", "")}`;
}

function optionOk(question: PackQuestion, value: string): boolean {
  return question.options?.some((option) => option.value === value) ?? false;
}

export function cleanOnboarding(pack: Pack, raw: OnboardingAnswers): OnboardingAnswers {
  const out: OnboardingAnswers = {};
  for (const question of pack.questions) {
    const value = raw[question.id];
    if (question.kind === "text" && typeof value === "string") {
      const text = value.trim().slice(0, 500);
      if (text) out[question.id] = text;
      continue;
    }
    if (question.kind === "single" && typeof value === "string" && optionOk(question, value)) {
      out[question.id] = value;
      continue;
    }
    if (question.kind === "multi" && Array.isArray(value)) {
      const picked = value.filter((item) => optionOk(question, item));
      if (picked.length) out[question.id] = picked;
    }
  }
  return out;
}

export function channelsFrom(pack: Pack, onboarding: OnboardingAnswers): string[] {
  const question = pack.questions.find((item) => item.mapsTo === "channels");
  if (!question) return [];
  const value = onboarding[question.id];
  if (Array.isArray(value)) return value.filter((item) => optionOk(question, item));
  if (typeof value === "string" && optionOk(question, value)) return [value];
  return [];
}

export function buildClientConfig(
  input: SignupInput,
  clientId: string,
  onboarding: OnboardingAnswers = {},
  brokerMode?: boolean,
): ClientConfig {
  const pack = getPack(input.vertical);
  if (!pack) throw new Error("Unknown vertical");
  const answers = cleanOnboarding(pack, onboarding);
  const lending = pack.id === "lending";
  const mode = lending ? (brokerMode ?? pack.broker_mode === true) : undefined;
  return {
    client_id: clientId,
    business_name: input.businessName,
    vertical: input.vertical,
    market: input.city,
    owner_first_name: ownerFirstName(input.name),
    channels: channelsFrom(pack, answers),
    hours: { ...contractHours },
    sms_live: false,
    caps: 0,
    dry_run: true,
    storage: "none",
    stub: true,
    owner_email: input.email,
    trade: input.trade,
    onboarding: answers,
    ...(lending ? { broker_mode: mode } : {}),
    notices: lending ? [fundingDisclaimer] : [],
  };
}

export function validateSignup(data: unknown): SignupResult {
  if (!data || typeof data !== "object") {
    return { ok: false, error: platformCopy.errors.request };
  }
  const body = data as Record<string, unknown>;
  const name = asString(body.name).slice(0, 120);
  const email = asString(body.email).slice(0, 160);
  const businessName = asString(body.business_name).slice(0, 160);
  const vertical = asString(body.vertical);
  const trade = asString(body.trade).slice(0, 160);
  const city = asString(body.city).slice(0, 120);

  if (!name) return { ok: false, error: platformCopy.errors.name };
  if (!emailPattern.test(email)) return { ok: false, error: platformCopy.errors.email };
  if (!businessName) return { ok: false, error: platformCopy.errors.business };
  if (!isVerticalId(vertical)) return { ok: false, error: platformCopy.errors.vertical };
  if (!trade) return { ok: false, error: platformCopy.errors.trade };
  if (!city) return { ok: false, error: platformCopy.errors.city };
  if (body.consent !== true) return { ok: false, error: platformCopy.errors.consent };

  return {
    ok: true,
    value: { name, email, businessName, vertical, trade, city, consent: true },
  };
}

export function validateBusinessCheck(data: unknown): CheckResult {
  if (!data || typeof data !== "object") {
    return { ok: false, error: platformCopy.errors.check };
  }
  const body = data as Record<string, unknown>;
  const businessName = asString(body.business_name).slice(0, 160);
  const city = asString(body.city).slice(0, 120);
  const email = asString(body.email).slice(0, 160);
  const note = asString(body.note).slice(0, 500);
  if (!businessName) return { ok: false, error: platformCopy.errors.business };
  if (!city) return { ok: false, error: platformCopy.errors.city };
  if (!emailPattern.test(email)) return { ok: false, error: platformCopy.errors.email };
  return { ok: true, value: { businessName, city, email, note } };
}
