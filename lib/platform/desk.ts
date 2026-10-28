import { getPack } from "../../packs/index.ts";
import type { Pack } from "../../packs/types.ts";
import { platformCopy } from "./copy.ts";
import type { Draft } from "./draft.ts";

export type CheckItem = {
  id: string;
  label: string;
  detail: string;
  state: "Ready" | "Next" | "Waiting";
};

export type BorrowerView = {
  title: string;
  lede: string;
  sampleTitle: string;
  disclaimer: string;
  stages: { id: string; label: string; state: "done" | "current" | "upcoming" }[];
};

export type LenderMatch = {
  title: string;
  help: string;
  privacy: string;
  lenders: { id: string; name: string; note: string }[];
};

export function effectiveBrokerMode(pack: Pack, override: boolean | null): boolean {
  if (pack.id !== "lending") return false;
  if (typeof override === "boolean") return override;
  return pack.broker_mode === true;
}

/**
 * Customer view. Built only from stage labels and borrower copy.
 * Lender names are not read and cannot appear here.
 */
export function borrowerView(): BorrowerView {
  const pack = getPack("lending");
  if (!pack?.borrower || !pack.fundingDisclaimer) {
    throw new Error("Lending pack is missing a customer status view");
  }
  const current = pack.stages.findIndex((stage) => stage.id === pack.borrower?.currentStage);
  return {
    title: pack.borrower.title,
    lede: pack.borrower.lede,
    sampleTitle: pack.borrower.sampleTitle,
    disclaimer: pack.fundingDisclaimer,
    stages: pack.stages.map((stage, index) => ({
      id: stage.id,
      label: stage.label,
      state: index < current ? "done" : index === current ? "current" : "upcoming",
    })),
  };
}

/** Private panel. Null unless broker mode is on, so customer UI never imports it. */
export function lenderMatch(pack: Pack, brokerMode: boolean): LenderMatch | null {
  if (!brokerMode || pack.id !== "lending" || !pack.clientDesk) return null;
  const desk = pack.clientDesk;
  return {
    title: desk.panelTitle,
    help: desk.panelHelp,
    privacy: desk.panelPrivate,
    lenders: desk.lenders.map((lender) => ({ id: lender.id, name: lender.name, note: lender.note })),
  };
}

export function setupChecklist(draft: Draft, pack: Pack, questionsDone: boolean): CheckItem[] {
  return [
    {
      id: "profile",
      label: platformCopy.work.profile,
      detail: draft.config?.business_name || platformCopy.work.emptyWorkspaceTitle,
      state: draft.config ? "Ready" : "Waiting",
    },
    {
      id: "pack",
      label: platformCopy.work.pack,
      detail: pack.label,
      state: draft.config ? "Ready" : "Waiting",
    },
    {
      id: "questions",
      label: platformCopy.work.questions,
      detail: questionsDone ? platformCopy.work.questionsDone : platformCopy.work.questionsLeft,
      state: questionsDone ? "Ready" : "Next",
    },
    {
      id: "text",
      label: platformCopy.work.textChannel,
      detail: platformCopy.work.textChannelDetail,
      state: "Waiting",
    },
    {
      id: "outbound",
      label: platformCopy.work.outbound,
      detail: platformCopy.work.outboundDetail,
      state: "Next",
    },
    {
      id: "genesis_next",
      label: pack.nextStep,
      detail: platformCopy.work.lede,
      state: "Next",
    },
  ];
}

export const workSectionIds = ["overview", "leads", "inbox", "approvals", "settings"] as const;

export type WorkSection = (typeof workSectionIds)[number];

export function isWorkSection(value: string): value is WorkSection {
  return (workSectionIds as readonly string[]).includes(value);
}

export function parseWorkSection(parts: string[] | undefined): WorkSection | null {
  if (!parts || parts.length === 0) return "overview";
  if (parts.length > 1) return null;
  const value = parts[0] ?? "";
  return isWorkSection(value) ? value : null;
}

export function sectionTitle(section: WorkSection): string {
  const titles: Record<WorkSection, string> = {
    overview: platformCopy.nav.overview,
    leads: "Leads",
    inbox: "Inbox",
    approvals: "Approvals",
    settings: platformCopy.work.settingsTitle,
  };
  return titles[section];
}
