/**
 * One core product. A vertical pack changes copy, questions, and the desk.
 * Adding a vertical is a new file plus one line in packs/index.ts.
 */

export const verticalIds = ["general", "real_estate", "lending"] as const;

export type VerticalId = (typeof verticalIds)[number];

export function isVerticalId(value: string): value is VerticalId {
  return (verticalIds as readonly string[]).includes(value);
}

export type Choice = { value: string; label: string };

export type PackQuestion = {
  id: string;
  prompt: string;
  help: string;
  kind: "single" | "multi" | "text";
  mapsTo?: "channels";
  options?: readonly Choice[];
};

export type StageItem = { id: string; title: string; meta: string };

export type Stage = {
  id: string;
  label: string;
  items: readonly StageItem[];
};

export type Kpi = { id: string; label: string; value: string; note: string };

export type Activity = { id: string; title: string; detail: string };

export type SampleLead = { id: string; title: string; source: string; status: string };

export type SampleThread = { id: string; from: string; subject: string; body: string };

export type SampleApproval = { id: string; title: string; detail: string };

export type SampleLender = { id: string; name: string; note: string };

/**
 * Client desk copy. The word broker is allowed here because this object
 * renders only on the client desk, never in Genesis company copy.
 */
export type ClientDesk = {
  modeLabel: string;
  modeHelp: string;
  modeOffHelp: string;
  panelTitle: string;
  panelHelp: string;
  panelPrivate: string;
  panelEmpty: string;
  customerLink: string;
  lenders: readonly SampleLender[];
};

export type BorrowerCopy = {
  title: string;
  lede: string;
  sampleTitle: string;
  currentStage: string;
};

export type Pack = {
  id: VerticalId;
  label: string;
  promise: string;
  benefits: readonly string[];
  previewTitle: string;
  questions: readonly PackQuestion[];
  kpis: readonly Kpi[];
  activity: readonly Activity[];
  stages: readonly Stage[];
  leads: readonly SampleLead[];
  inbox: readonly SampleThread[];
  approvals: readonly SampleApproval[];
  nextStep: string;
  /** Present only when the pack mentions funding. */
  fundingDisclaimer?: string;
  /** Lending only. The client is a lender when this is false. */
  broker_mode?: boolean;
  deskTitle?: string;
  clientDesk?: ClientDesk;
  borrower?: BorrowerCopy;
};
