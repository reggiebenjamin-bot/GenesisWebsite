import type { VerticalId } from "../../packs/types.ts";
import { isVerticalId } from "../../packs/types.ts";
import type { ClientConfig, OnboardingAnswers } from "./config.ts";

export const DRAFT_KEY = "genesis.platform.flow.v1";

export type Answers = {
  name: string;
  email: string;
  businessName: string;
  vertical: VerticalId | "";
  trade: string;
  city: string;
  consent: boolean;
  onboarding: OnboardingAnswers;
};

export type Draft = {
  stepId: string;
  updatedAt: string;
  answers: Answers;
  config: ClientConfig | null;
  /** Null uses the pack boolean. Only the lending client desk reads this. */
  brokerModeOverride: boolean | null;
};

export function emptyAnswers(vertical: VerticalId | "" = ""): Answers {
  return {
    name: "",
    email: "",
    businessName: "",
    vertical,
    trade: "",
    city: "",
    consent: false,
    onboarding: {},
  };
}

export function emptyDraft(vertical: VerticalId | "" = ""): Draft {
  return {
    stepId: "name",
    updatedAt: new Date(0).toISOString(),
    answers: emptyAnswers(vertical),
    config: null,
    brokerModeOverride: null,
  };
}

export function draftVertical(value: string): VerticalId | "" {
  return isVerticalId(value) ? value : "";
}
