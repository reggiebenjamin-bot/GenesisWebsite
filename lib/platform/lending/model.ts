import { fundingDisclaimer } from "../copy.ts";

/** Owner stage list. Reference desk names are not used. */
export const lendingStages = [
  { id: "submitted", label: "Submitted" },
  { id: "in_review", label: "In review" },
  { id: "matched", label: "Matched" },
  { id: "terms_ready", label: "Terms ready" },
  { id: "closing", label: "Closing" },
  { id: "funded", label: "Funded" },
] as const;

export type StageId = (typeof lendingStages)[number]["id"];
export type Outcome = "active" | "funded" | "closed";

export function stageLabel(id: StageId): string {
  return lendingStages.find((stage) => stage.id === id)?.label ?? id;
}

export type Deal = {
  id: string;
  title: string;
  borrowerId: string;
  borrowerName: string;
  address: string;
  city: string;
  state: string;
  amount: number;
  purchase: number;
  arv: number;
  rehab: number;
  stageId: StageId;
  outcome: Outcome;
  product: string;
  credit: number;
  feePercent: number;
  /** Private. Omitted from every borrower facing view. */
  sourceId: string | null;
  next: string;
  flag: string | null;
  follow: "due" | "scheduled" | "none";
  receivedDocs: number;
  totalDocs: number;
};

export type Borrower = {
  id: string;
  name: string;
  entity: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  kind: string;
  verified: boolean;
};

export type SourceProgram = {
  id: string;
  name: string;
  product: string;
  minLoan: number;
  maxLoan: number;
  maxLtv: number;
  minCredit: number;
  notes: string;
};

export type Source = {
  id: string;
  name: string;
  contact: string;
  programs: SourceProgram[];
};

export type FollowBucket = "due" | "scheduled" | "none" | "all";

export const docPhases = [
  {
    id: "borrower",
    label: "Borrower",
    help: "Identity and authority.",
    items: ["Formation record", "Bank statements", "Identification"],
  },
  {
    id: "collateral",
    label: "Collateral",
    help: "The property and the project.",
    items: ["Purchase agreement", "Scope of work", "Value note"],
  },
  {
    id: "terms",
    label: "Terms",
    help: "Records as a file moves toward closing.",
    items: ["Term sheet", "Settlement statement"],
  },
  {
    id: "closing",
    label: "Closing",
    help: "Final records. Receipt is not approval.",
    items: ["Closing documents"],
  },
] as const;

export const sampleBorrowers: Borrower[] = [
  {
    id: "sample_borrower",
    name: "Sample Borrower",
    entity: "Sample Holdings",
    email: "borrower@example.com",
    phone: "555 0100",
    city: "Sample City",
    state: "TX",
    kind: "Entity",
    verified: false,
  },
  {
    id: "sample_contact",
    name: "Sample Contact",
    entity: "Sample Contact",
    email: "contact@example.com",
    phone: "555 0101",
    city: "Sample City",
    state: "TX",
    kind: "Individual",
    verified: true,
  },
];

export const sampleDeals: Deal[] = [
  {
    id: "sample_purchase",
    title: "Sample purchase file",
    borrowerId: "sample_borrower",
    borrowerName: "Sample Borrower",
    address: "100 Sample Street",
    city: "Sample City",
    state: "TX",
    amount: 240000,
    purchase: 320000,
    arv: 400000,
    rehab: 20000,
    stageId: "submitted",
    outcome: "active",
    product: "Bridge",
    credit: 700,
    feePercent: 2,
    sourceId: null,
    next: "Ready for initial review.",
    flag: null,
    follow: "due",
    receivedDocs: 1,
    totalDocs: 9,
  },
  {
    id: "sample_review",
    title: "Sample refinance file",
    borrowerId: "sample_borrower",
    borrowerName: "Sample Borrower",
    address: "200 Sample Street",
    city: "Sample City",
    state: "TX",
    amount: 180000,
    purchase: 250000,
    arv: 260000,
    rehab: 0,
    stageId: "in_review",
    outcome: "active",
    product: "Purchase",
    credit: 680,
    feePercent: 1,
    sourceId: "sample_a",
    next: "Fill the missing details.",
    flag: "No scope of work yet.",
    follow: "scheduled",
    receivedDocs: 3,
    totalDocs: 9,
  },
  {
    id: "sample_matched",
    title: "Sample matched file",
    borrowerId: "sample_contact",
    borrowerName: "Sample Contact",
    address: "300 Sample Street",
    city: "Sample City",
    state: "TX",
    amount: 500000,
    purchase: 700000,
    arv: 760000,
    rehab: 40000,
    stageId: "matched",
    outcome: "active",
    product: "Bridge",
    credit: 720,
    feePercent: 2,
    sourceId: "sample_b",
    next: "Review your list. Nothing is submitted.",
    flag: null,
    follow: "none",
    receivedDocs: 4,
    totalDocs: 9,
  },
  {
    id: "sample_terms",
    title: "Sample terms file",
    borrowerId: "sample_contact",
    borrowerName: "Sample Contact",
    address: "400 Sample Street",
    city: "Sample City",
    state: "TX",
    amount: 150000,
    purchase: 200000,
    arv: 210000,
    rehab: 0,
    stageId: "terms_ready",
    outcome: "active",
    product: "Refinance",
    credit: 640,
    feePercent: 2,
    sourceId: "sample_a",
    next: "Terms are a draft for your review.",
    flag: null,
    follow: "due",
    receivedDocs: 6,
    totalDocs: 9,
  },
  {
    id: "sample_closing",
    title: "Sample closing file",
    borrowerId: "sample_borrower",
    borrowerName: "Sample Borrower",
    address: "500 Sample Street",
    city: "Sample City",
    state: "TX",
    amount: 300000,
    purchase: 380000,
    arv: 390000,
    rehab: 10000,
    stageId: "closing",
    outcome: "active",
    product: "Purchase",
    credit: 710,
    feePercent: 1,
    sourceId: "sample_c",
    next: "Closing checklist is still open.",
    flag: null,
    follow: "scheduled",
    receivedDocs: 7,
    totalDocs: 9,
  },
  {
    id: "sample_funded",
    title: "Sample funded file",
    borrowerId: "sample_borrower",
    borrowerName: "Sample Borrower",
    address: "600 Sample Street",
    city: "Sample City",
    state: "TX",
    amount: 210000,
    purchase: 280000,
    arv: 280000,
    rehab: 0,
    stageId: "funded",
    outcome: "funded",
    product: "Purchase",
    credit: 700,
    feePercent: 2,
    sourceId: "sample_a",
    next: "Sample outcome. Not a result.",
    flag: null,
    follow: "none",
    receivedDocs: 9,
    totalDocs: 9,
  },
  {
    id: "sample_closed",
    title: "Sample closed file",
    borrowerId: "sample_contact",
    borrowerName: "Sample Contact",
    address: "700 Sample Street",
    city: "Sample City",
    state: "TX",
    amount: 90000,
    purchase: 120000,
    arv: 120000,
    rehab: 0,
    stageId: "submitted",
    outcome: "closed",
    product: "Bridge",
    credit: 600,
    feePercent: 0,
    sourceId: null,
    next: "Closed on this screen. Sample only.",
    flag: "Sample loss note.",
    follow: "none",
    receivedDocs: 0,
    totalDocs: 9,
  },
];

export function money(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}

export function ltv(deal: Deal): number | null {
  if (!deal.purchase) return null;
  return Math.round((deal.amount / deal.purchase) * 100);
}

export function visibleDeals(deals: readonly Deal[], outcome: Outcome): Deal[] {
  return deals.filter((deal) => deal.outcome === outcome);
}

export function publicDeal(deal: Deal) {
  return {
    id: deal.id,
    title: deal.title,
    stage: stageLabel(deal.stageId),
    amount: money(deal.amount),
    city: deal.city,
  };
}

export const feeNote =
  "This fee is your record. Genesis takes no fee. [CONFIRM: counsel]";

export const matchNote =
  "Your saved criteria compared with this deal. Not a placement.";

export { fundingDisclaimer };
