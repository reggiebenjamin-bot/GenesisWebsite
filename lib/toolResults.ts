/**
 * Pure, deterministic result calculators for the three Genesis Tools.
 *
 * These run entirely from the inputs a buyer already saved in their local
 * workspace draft. There is no network call, no model, and no paid API here:
 * the same inputs always produce the same numbers. The math is standard,
 * clearly labeled real estate arithmetic. Nothing is invented. No outside
 * benchmark, rate, or statistic is introduced, and missing optional fields are
 * treated as zero or reported as not entered rather than guessed.
 *
 * Visible strings here never use a hyphen, en dash, or em dash, because they
 * are rendered as result copy on the unlocked page.
 *
 * No path aliases in this file: the tests import it directly under Node.
 */

export type ResultRow = { label: string; value: string };

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Currency in USD. Negative amounts use accounting parentheses so no dash appears. */
export function formatUsd(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  if (safe < 0) return `(${usd.format(Math.abs(safe))})`;
  return usd.format(safe);
}

/** A percent to one decimal. Negative values use parentheses so no dash appears. */
export function formatPct(value: number): string {
  if (!Number.isFinite(value)) return "not available";
  const rounded = Math.round(value * 10) / 10;
  if (rounded < 0) return `(${Math.abs(rounded).toFixed(1)} percent)`;
  return `${rounded.toFixed(1)} percent`;
}

/** Parse a money or number input that may carry a currency symbol, commas, or spaces. */
function parseAmount(value: string | number | undefined | null, fallback = 0): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/[$,\s]/g, "");
  if (cleaned === "") return fallback;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function splitLines(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/* ------------------------------------------------------------------ */
/* Deal Architect                                                      */
/* ------------------------------------------------------------------ */

export type DealArchitectInput = {
  projectName?: string;
  strategy?: string;
  address?: string;
  purchasePrice: string | number;
  closingCosts?: string | number;
  rehabCost?: string | number;
  carryingCosts?: string | number;
  sellingCosts?: string | number;
  resaleValue: string | number;
  holdMonths: string | number;
  notes?: string;
  /** Optional profit margin target the buyer set, in percent. */
  targetMarginPct?: string | number;
};

export type DealArchitectResult = {
  projectName: string;
  strategy: string;
  address: string;
  purchasePrice: number;
  totalProjectCost: number;
  cashNeeded: number;
  exitValue: number;
  projectedProfit: number;
  profitMarginPct: number;
  returnOnCashPct: number;
  holdMonths: number;
  holdingCosts: number;
  rows: ResultRow[];
  verdict: string;
  assumptions: string[];
};

export function computeDealArchitect(input: DealArchitectInput): DealArchitectResult {
  const strategy = (input.strategy ?? "Flip").toString().trim() || "Flip";
  const isRental = strategy === "Rental";
  const exitLabel = isRental ? "Property value" : "Resale value";

  const purchase = parseAmount(input.purchasePrice);
  const closing = parseAmount(input.closingCosts);
  const rehab = parseAmount(input.rehabCost);
  const carryingMonthly = parseAmount(input.carryingCosts);
  const selling = parseAmount(input.sellingCosts);
  const exitValue = parseAmount(input.resaleValue);
  const months = Math.max(0, Math.round(parseAmount(input.holdMonths)));

  const holdingCosts = carryingMonthly * months;
  const totalProjectCost = purchase + closing + rehab + holdingCosts + selling;
  const cashNeeded = totalProjectCost;
  const projectedProfit = exitValue - totalProjectCost;
  const profitMarginPct = exitValue > 0 ? (projectedProfit / exitValue) * 100 : 0;
  const returnOnCashPct = cashNeeded > 0 ? (projectedProfit / cashNeeded) * 100 : 0;

  const targetRaw =
    input.targetMarginPct != null && input.targetMarginPct.toString().trim() !== ""
      ? parseAmount(input.targetMarginPct)
      : null;

  let verdict: string;
  if (projectedProfit > 0) {
    if (targetRaw != null) {
      verdict =
        profitMarginPct >= targetRaw
          ? `This deal shows a projected profit, and the margin of ${formatPct(profitMarginPct)} meets or beats your target of ${formatPct(targetRaw)}.`
          : `This deal shows a projected profit, but the margin of ${formatPct(profitMarginPct)} is under your target of ${formatPct(targetRaw)}.`;
    } else {
      verdict = `This deal shows a projected profit with a margin of ${formatPct(profitMarginPct)} on the ${exitLabel.toLowerCase()}.`;
    }
  } else if (projectedProfit === 0) {
    verdict = "This deal breaks even at your numbers, with no projected profit.";
  } else {
    verdict = `This deal shows a projected loss at your numbers. The ${exitLabel.toLowerCase()} does not cover the total project cost.`;
  }

  const monthWord = months === 1 ? "month" : "months";
  const rows: ResultRow[] = [
    { label: "Purchase price", value: formatUsd(purchase) },
    { label: "Closing costs", value: formatUsd(closing) },
    { label: "Rehab or site work", value: formatUsd(rehab) },
    { label: `Holding costs over ${months} ${monthWord}`, value: formatUsd(holdingCosts) },
    { label: "Selling costs", value: formatUsd(selling) },
    { label: "Total project cost", value: formatUsd(totalProjectCost) },
    { label: "Cash needed", value: formatUsd(cashNeeded) },
    { label: exitLabel, value: formatUsd(exitValue) },
    { label: "Projected profit", value: formatUsd(projectedProfit) },
    { label: "Profit margin", value: formatPct(profitMarginPct) },
    { label: "Return on cash", value: formatPct(returnOnCashPct) },
  ];

  const assumptions: string[] = [
    `Strategy is ${strategy}.`,
    "Every figure comes only from the inputs you entered. No outside benchmark or statistic was added.",
    `Carrying and financing is read as a monthly cost applied across the ${months} ${monthWord} hold period.`,
    "Cash needed assumes the full project is paid from your own cash, since no financing split was entered here.",
    `Projected profit is the ${exitLabel.toLowerCase()} minus the total project cost.`,
    "Profit margin is projected profit divided by the exit value. Return on cash is projected profit divided by cash needed.",
  ];
  if (!input.closingCosts || parseAmount(input.closingCosts) === 0) {
    assumptions.push("Closing costs were left blank and treated as zero.");
  }
  if (!input.sellingCosts || parseAmount(input.sellingCosts) === 0) {
    assumptions.push("Selling costs were left blank and treated as zero.");
  }
  if (carryingMonthly === 0) {
    assumptions.push("Carrying and financing was left blank and treated as zero.");
  }
  if (isRental) {
    assumptions.push(
      "No rental income was entered, so the result compares your property value against the total project cost rather than monthly cash flow.",
    );
  }

  return {
    projectName: (input.projectName ?? "").toString().trim(),
    strategy,
    address: (input.address ?? "").toString().trim(),
    purchasePrice: purchase,
    totalProjectCost,
    cashNeeded,
    exitValue,
    projectedProfit,
    profitMarginPct,
    returnOnCashPct,
    holdMonths: months,
    holdingCosts,
    rows,
    verdict,
    assumptions,
  };
}

/* ------------------------------------------------------------------ */
/* Capital Advisor                                                     */
/* ------------------------------------------------------------------ */

export type CapitalAdvisorInput = {
  projectName?: string;
  purpose?: string;
  assetType?: string;
  totalUses: string | number;
  propertyValue?: string | number;
  requestedDebt: string | number;
  availableCash?: string | number;
  interestRate?: string | number;
  termMonths?: string | number;
  monthlyNoi?: string | number;
  exitStrategy?: string;
  entityDocuments?: boolean;
  exitEvidence?: boolean;
  projectBudget?: boolean;
  /** Optional lender points, in percent of the requested amount. */
  pointsPct?: string | number;
  /** Optional override of the repayment basis. Defaults from the inputs present. */
  repaymentType?: "amortized" | "interestOnly";
};

export type CapitalAdvisorResult = {
  amountRequested: number;
  totalUses: number;
  loanToCostPct: number;
  loanToValuePct: number | null;
  repaymentBasis: "amortized" | "interestOnly" | "notEnoughInputs";
  monthlyPayment: number | null;
  totalInterest: number | null;
  pointsCost: number;
  totalCashToClose: number;
  rows: ResultRow[];
  checklist: string[];
};

export function computeCapitalAdvisor(input: CapitalAdvisorInput): CapitalAdvisorResult {
  const totalUses = parseAmount(input.totalUses);
  const amountRequested = parseAmount(input.requestedDebt);
  const propertyValue = parseAmount(input.propertyValue, Number.NaN);
  const annualRatePct = parseAmount(input.interestRate, Number.NaN);
  const term = Math.round(parseAmount(input.termMonths, Number.NaN));
  const pointsPct = parseAmount(input.pointsPct, 0);

  const hasRate = Number.isFinite(annualRatePct);
  const hasTerm = Number.isFinite(term) && term > 0;
  const hasValue = Number.isFinite(propertyValue) && propertyValue > 0;

  const loanToCostPct = totalUses > 0 ? (amountRequested / totalUses) * 100 : 0;
  const loanToValuePct = hasValue ? (amountRequested / propertyValue) * 100 : null;

  const repaymentType = input.repaymentType ?? (hasTerm ? "amortized" : "interestOnly");

  let repaymentBasis: CapitalAdvisorResult["repaymentBasis"] = "notEnoughInputs";
  let monthlyPayment: number | null = null;
  let totalInterest: number | null = null;

  if (repaymentType === "amortized" && hasTerm && hasRate) {
    repaymentBasis = "amortized";
    if (annualRatePct === 0) {
      monthlyPayment = amountRequested / term;
    } else {
      const monthlyRate = annualRatePct / 100 / 12;
      monthlyPayment = (amountRequested * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
    }
    totalInterest = monthlyPayment * term - amountRequested;
  } else if (repaymentType === "interestOnly" && hasRate) {
    repaymentBasis = "interestOnly";
    monthlyPayment = (amountRequested * (annualRatePct / 100)) / 12;
    if (hasTerm) totalInterest = monthlyPayment * term;
  }

  const pointsCost = (amountRequested * pointsPct) / 100;
  const equityPortion = totalUses - amountRequested;
  const totalCashToClose = equityPortion + pointsCost;

  const repaymentLabel =
    repaymentBasis === "amortized"
      ? "Amortized"
      : repaymentBasis === "interestOnly"
        ? "Interest only"
        : "Not enough inputs to calculate";

  const rows: ResultRow[] = [
    { label: "Amount requested", value: formatUsd(amountRequested) },
    { label: "Total project uses", value: formatUsd(totalUses) },
    { label: "Loan to cost", value: formatPct(loanToCostPct) },
  ];
  if (loanToValuePct != null) {
    rows.push({ label: "Loan to value", value: formatPct(loanToValuePct) });
  }
  rows.push({ label: "Repayment basis", value: repaymentLabel });
  if (monthlyPayment != null) {
    rows.push({ label: "Monthly payment", value: formatUsd(monthlyPayment) });
  }
  if (totalInterest != null) {
    rows.push({ label: "Total interest over term", value: formatUsd(totalInterest) });
  }
  rows.push({ label: "Points cost", value: formatUsd(pointsCost) });
  rows.push({ label: "Total cash to close", value: formatUsd(totalCashToClose) });

  const readiness = (label: string, ready: boolean | undefined) =>
    `${label}: ${ready ? "ready" : "still to gather"}`;

  const checklist: string[] = [
    readiness("Itemized project budget", input.projectBudget),
    readiness("Repayment or exit evidence", input.exitEvidence),
    readiness("Entity documents", input.entityDocuments),
    "A clear written repayment or exit plan",
    "A sources and uses summary for the project",
    "Proof of the cash available for your share of the costs",
  ];

  return {
    amountRequested,
    totalUses,
    loanToCostPct,
    loanToValuePct,
    repaymentBasis,
    monthlyPayment,
    totalInterest,
    pointsCost,
    totalCashToClose,
    rows,
    checklist,
  };
}

/* ------------------------------------------------------------------ */
/* Deal Packager                                                       */
/* ------------------------------------------------------------------ */

export type DealPackagerInput = {
  projectName?: string;
  audience?: string;
  assetType?: string;
  location?: string;
  strategy?: string;
  status?: string;
  summary?: string;
  askingPrice: string | number;
  valueEstimate?: string | number;
  rehabCost?: string | number;
  nextAction?: string;
  contactName?: string;
  contactEmail?: string;
  photosReady?: boolean;
  budgetReady?: boolean;
  compsReady?: boolean;
  contractReady?: boolean;
  /** Optional highlights the buyer listed, one per line. */
  highlights?: string;
  /** Optional risks the buyer listed, one per line. */
  risks?: string;
};

export type DealPackagerResult = {
  title: string;
  preparedFor: string;
  summary: string;
  property: ResultRow[];
  numbers: ResultRow[];
  theAsk: string;
  highlights: string[];
  risks: string[];
  contact: ResultRow[];
  askingPrice: number;
  estimatedSpread: number | null;
  plainText: string;
};

export function computeDealPackager(input: DealPackagerInput): DealPackagerResult {
  const title = (input.projectName ?? "").toString().trim() || "Your opportunity";
  const preparedFor = (input.audience ?? "").toString().trim() || "Reviewer";
  const summary = (input.summary ?? "").toString().trim();

  const askingPrice = parseAmount(input.askingPrice);
  const valueEstimate = parseAmount(input.valueEstimate, Number.NaN);
  const rehabCost = parseAmount(input.rehabCost, 0);
  const hasValue = Number.isFinite(valueEstimate) && valueEstimate > 0;
  const hasRehab = Number.isFinite(parseAmount(input.rehabCost, Number.NaN)) && rehabCost > 0;
  const estimatedSpread = hasValue ? valueEstimate - askingPrice - rehabCost : null;

  const property: ResultRow[] = [];
  const assetType = (input.assetType ?? "").toString().trim();
  const location = (input.location ?? "").toString().trim();
  const strategy = (input.strategy ?? "").toString().trim();
  const status = (input.status ?? "").toString().trim();
  if (assetType) property.push({ label: "Asset type", value: assetType });
  if (location) property.push({ label: "Location", value: location });
  if (strategy) property.push({ label: "Strategy", value: strategy });
  if (status) property.push({ label: "Deal status", value: status });

  const numbers: ResultRow[] = [{ label: "Asking or purchase price", value: formatUsd(askingPrice) }];
  if (hasValue) numbers.push({ label: "Supplied value estimate", value: formatUsd(valueEstimate) });
  if (hasRehab) numbers.push({ label: "Rehab or project budget", value: formatUsd(rehabCost) });
  if (estimatedSpread != null) {
    numbers.push({ label: "Estimated spread over price and budget", value: formatUsd(estimatedSpread) });
  }

  const theAsk = (input.nextAction ?? "").toString().trim() || "Review the opportunity and reply with your interest.";

  const providedHighlights = splitLines(input.highlights);
  const evidenceHighlights = [
    input.photosReady ? "Property photos are available" : null,
    input.budgetReady ? "A project budget is prepared" : null,
    input.compsReady ? "Comparable support is on file" : null,
    input.contractReady ? "A contract or terms are in hand" : null,
  ].filter((item): item is string => Boolean(item));
  const highlights = providedHighlights.length > 0 ? providedHighlights : evidenceHighlights;

  const risks = splitLines(input.risks);

  const contact: ResultRow[] = [];
  const contactName = (input.contactName ?? "").toString().trim();
  const contactEmail = (input.contactEmail ?? "").toString().trim();
  if (contactName) contact.push({ label: "Contact name", value: contactName });
  if (contactEmail) contact.push({ label: "Contact email", value: contactEmail });

  const plainText = buildPackagerText({
    title,
    preparedFor,
    summary,
    property,
    numbers,
    theAsk,
    highlights,
    risks,
    contact,
  });

  return {
    title,
    preparedFor,
    summary,
    property,
    numbers,
    theAsk,
    highlights,
    risks,
    contact,
    askingPrice,
    estimatedSpread,
    plainText,
  };
}

function buildPackagerText(parts: {
  title: string;
  preparedFor: string;
  summary: string;
  property: ResultRow[];
  numbers: ResultRow[];
  theAsk: string;
  highlights: string[];
  risks: string[];
  contact: ResultRow[];
}): string {
  const lines: string[] = [];
  lines.push(`DEAL PACKAGE: ${parts.title}`);
  lines.push(`Prepared for: ${parts.preparedFor}`);
  lines.push("");

  if (parts.summary) {
    lines.push("SUMMARY");
    lines.push(parts.summary);
    lines.push("");
  }

  if (parts.property.length > 0) {
    lines.push("PROPERTY");
    for (const row of parts.property) lines.push(`${row.label}: ${row.value}`);
    lines.push("");
  }

  lines.push("NUMBERS");
  for (const row of parts.numbers) lines.push(`${row.label}: ${row.value}`);
  lines.push("");

  lines.push("THE ASK");
  lines.push(parts.theAsk);
  lines.push("");

  if (parts.highlights.length > 0) {
    lines.push("HIGHLIGHTS");
    for (const item of parts.highlights) lines.push(`* ${item}`);
    lines.push("");
  }

  if (parts.risks.length > 0) {
    lines.push("RISKS THE SELLER LISTED");
    for (const item of parts.risks) lines.push(`* ${item}`);
    lines.push("");
  }

  if (parts.contact.length > 0) {
    lines.push("CONTACT");
    for (const row of parts.contact) lines.push(`${row.label}: ${row.value}`);
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}
