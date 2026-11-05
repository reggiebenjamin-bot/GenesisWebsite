import assert from "node:assert/strict";
import test from "node:test";
import {
  computeCapitalAdvisor,
  computeDealArchitect,
  computeDealPackager,
  formatUsd,
  type ResultRow,
} from "../lib/toolResults.ts";

const DASH = /[-–—]/;

function assertNoDashInLabels(rows: readonly ResultRow[]) {
  for (const row of rows) {
    assert.equal(DASH.test(row.label), false, `label has a dash: "${row.label}"`);
  }
}

test("formatUsd renders whole dollars and uses parentheses for negatives", () => {
  assert.equal(formatUsd(161000), "$161,000");
  assert.equal(formatUsd(0), "$0");
  assert.equal(formatUsd(-39000), "($39,000)");
});

test("Deal Architect computes a flip from the saved inputs", () => {
  const result = computeDealArchitect({
    projectName: "Oak Street",
    strategy: "Flip",
    address: "123 Oak St",
    purchasePrice: "100,000",
    closingCosts: "5,000",
    rehabCost: "40,000",
    carryingCosts: "1,000",
    sellingCosts: "10,000",
    resaleValue: "200,000",
    holdMonths: "6",
  });

  assert.equal(result.holdingCosts, 6000);
  assert.equal(result.totalProjectCost, 161000);
  assert.equal(result.cashNeeded, 161000);
  assert.equal(result.exitValue, 200000);
  assert.equal(result.projectedProfit, 39000);
  assert.equal(result.profitMarginPct, (39000 / 200000) * 100);
  assert.equal(result.returnOnCashPct, (39000 / 161000) * 100);
  assert.match(result.verdict, /projected profit/);
  assert.ok(result.assumptions.length > 0);
  assertNoDashInLabels(result.rows);
});

test("Deal Architect compares margin against a target the user entered", () => {
  const under = computeDealArchitect({
    strategy: "Flip",
    purchasePrice: "100000",
    rehabCost: "0",
    resaleValue: "110000",
    holdMonths: "1",
    targetMarginPct: "20",
  });
  assert.equal(under.projectedProfit, 10000);
  assert.match(under.verdict, /under your target/);

  const loss = computeDealArchitect({
    strategy: "Flip",
    purchasePrice: "100000",
    rehabCost: "0",
    resaleValue: "90000",
    holdMonths: "1",
  });
  assert.equal(loss.projectedProfit, -10000);
  assert.match(loss.verdict, /projected loss/);
});

test("Capital Advisor computes an amortized request with points", () => {
  const result = computeCapitalAdvisor({
    projectName: "Oakline",
    purpose: "Acquisition",
    assetType: "Small multifamily",
    totalUses: "250000",
    requestedDebt: "200000",
    availableCash: "50000",
    propertyValue: "312500",
    interestRate: "12",
    termMonths: "12",
    pointsPct: "2",
  });

  assert.equal(result.amountRequested, 200000);
  assert.equal(result.loanToCostPct, 80);
  assert.equal(result.loanToValuePct, 64);
  assert.equal(result.pointsCost, 4000);
  assert.equal(result.totalCashToClose, 54000);
  assert.equal(result.repaymentBasis, "amortized");

  const r = 0.12 / 12;
  const expectedPayment = (200000 * r) / (1 - Math.pow(1 + r, -12));
  assert.ok(result.monthlyPayment != null);
  assert.ok(Math.abs((result.monthlyPayment as number) - expectedPayment) < 1e-6);
  assert.ok(Math.abs((result.totalInterest as number) - (expectedPayment * 12 - 200000)) < 1e-6);

  assertNoDashInLabels(result.rows);
});

test("Capital Advisor falls back to an interest only payment without a term", () => {
  const result = computeCapitalAdvisor({
    totalUses: "250000",
    requestedDebt: "200000",
    availableCash: "50000",
    interestRate: "12",
  });

  assert.equal(result.repaymentBasis, "interestOnly");
  assert.equal(result.monthlyPayment, 2000);
  assert.equal(result.totalInterest, null);
  assert.equal(result.loanToValuePct, null);
  assert.equal(result.pointsCost, 0);
  assertNoDashInLabels(result.rows);
});

test("Deal Packager assembles the package and a copy text", () => {
  const result = computeDealPackager({
    projectName: "Parkside Multifamily",
    audience: "Capital partner",
    assetType: "Multifamily",
    location: "Austin, Texas",
    strategy: "Acquire and reposition",
    status: "Under contract",
    summary: "A stabilized asset with upside.",
    askingPrice: "1000000",
    valueEstimate: "1300000",
    rehabCost: "180000",
    nextAction: "Request the diligence folder.",
    contactName: "Alex Rivers",
    contactEmail: "alex@example.com",
    photosReady: true,
    budgetReady: true,
    risks: "Market softening\nPermit timing",
  });

  assert.equal(result.title, "Parkside Multifamily");
  assert.equal(result.preparedFor, "Capital partner");
  assert.equal(result.askingPrice, 1000000);
  assert.equal(result.estimatedSpread, 120000);
  assert.deepEqual(result.risks, ["Market softening", "Permit timing"]);
  assert.deepEqual(result.highlights, [
    "Property photos are available",
    "A project budget is prepared",
  ]);
  assert.match(result.plainText, /DEAL PACKAGE: Parkside Multifamily/);
  assert.match(result.plainText, /Estimated spread over price and budget: \$120,000/);

  assertNoDashInLabels(result.property);
  assertNoDashInLabels(result.numbers);
  assertNoDashInLabels(result.contact);
});
