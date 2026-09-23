"use client";

import { useState } from "react";
import { FileLock, Files, Info } from "@phosphor-icons/react";
import { getWorkspaceTool } from "@/lib/toolWorkspace";
import { useWorkspaceDraft } from "../useWorkspaceDraft";
import {
  DraftBar,
  Field,
  PurchaseReview,
  WorkspaceAction,
} from "../WorkspaceControls";
import visual from "./CapitalAdvisorVisual.module.css";

const advisorPrice = getWorkspaceTool("capital-advisor").price;

type CapitalDraft = Record<string, unknown> & {
  projectName: string;
  purpose: string;
  assetType: string;
  totalUses: string;
  propertyValue: string;
  requestedDebt: string;
  availableCash: string;
  interestRate: string;
  termMonths: string;
  monthlyNoi: string;
  exitStrategy: string;
  entityDocuments: boolean;
  exitEvidence: boolean;
  projectBudget: boolean;
};

const initialDraft: CapitalDraft = {
  projectName: "",
  purpose: "",
  assetType: "",
  totalUses: "",
  propertyValue: "",
  requestedDebt: "",
  availableCash: "",
  interestRate: "",
  termMonths: "",
  monthlyNoi: "",
  exitStrategy: "",
  entityDocuments: false,
  exitEvidence: false,
  projectBudget: false,
};

function validAmount(value: string, allowZero = false) {
  const raw = value.trim();
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(raw)) return false;
  const normalized = raw.replaceAll(",", "");
  const number = Number(normalized);
  return Number.isFinite(number) && (allowZero ? number >= 0 : number > 0);
}

function validRate(value: string) {
  return validAmount(value) && Number(value.replaceAll(",", "")) <= 100;
}

function validTerm(value: string) {
  return /^\d+$/.test(value.trim()) && Number(value.trim()) > 0;
}

export function CapitalAdvisorWorkspace() {
  const { data, setData, status, clear, hydrated, conflict, chooseDraft } = useWorkspaceDraft("capital-advisor", initialDraft);
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  const invalid = {
    totalUses: Boolean(data.totalUses.trim()) && !validAmount(data.totalUses),
    requestedDebt: Boolean(data.requestedDebt.trim()) && !validAmount(data.requestedDebt),
    availableCash: Boolean(data.availableCash.trim()) && !validAmount(data.availableCash, true),
    propertyValue: Boolean(data.propertyValue.trim()) && !validAmount(data.propertyValue),
    interestRate: Boolean(data.interestRate.trim()) && !validRate(data.interestRate),
    termMonths: Boolean(data.termMonths.trim()) && !validTerm(data.termMonths),
    monthlyNoi: Boolean(data.monthlyNoi.trim()) && !validAmount(data.monthlyNoi, true),
  };

  const incomplete = [
    !data.projectName.trim() ? "project name" : null,
    !data.purpose ? "purpose" : null,
    !data.assetType.trim() ? "asset type" : null,
    !validAmount(data.totalUses) ? "total project uses" : null,
    !validAmount(data.requestedDebt) ? "requested debt" : null,
    !validAmount(data.availableCash, true) ? "available cash" : null,
    !data.exitStrategy.trim() ? "repayment or exit path" : null,
    invalid.propertyValue ? "valid property value" : null,
    invalid.interestRate ? "valid interest-rate assumption" : null,
    invalid.termMonths ? "valid term assumption" : null,
    invalid.monthlyNoi ? "valid monthly NOI" : null,
  ].filter((item): item is string => Boolean(item));
  const previewProject = data.projectName.trim().slice(0, 56) || "Your project";
  const previewAsset = data.assetType.trim().slice(0, 36) || "Asset type";

  function update<K extends keyof CapitalDraft>(key: K, value: CapitalDraft[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  const draftBar = <DraftBar status={status} onClear={() => void clear()} conflict={conflict?.reason} onChoose={(source) => void chooseDraft(source)} />;
  if (!hydrated || conflict) return draftBar;

  return (
    <>
      {draftBar}
      <div className={visual.flow}>
        <form className={visual.formPanel} autoComplete="off" onSubmit={(event) => event.preventDefault()}>
          <header className={visual.formHeader}>
            <div>
              <span className={visual.eyebrow}>Your brief</span>
              <h2>Build Your Capital Brief</h2>
              <p>Start with the facts you know. Supporting evidence is optional.</p>
            </div>
            <span className={visual.stepBadge}>PRIVATE DRAFT</span>
          </header>

          <div className={visual.formSections}>
            <fieldset className={visual.formSection}>
              <legend>Project</legend>
              <Field label="Project name">
                <input name="project_name" value={data.projectName} onChange={(event) => update("projectName", event.target.value)} placeholder="e.g. Oakline acquisition…" required />
              </Field>
              <div className={visual.twoFields}>
                <Field label="Purpose">
                  <select name="capital_purpose" value={data.purpose} onChange={(event) => update("purpose", event.target.value)} required>
                    <option value="" disabled>Select a purpose…</option>
                    <option>Acquisition</option>
                    <option>Refinance</option>
                    <option>Acquisition plus rehab</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="Asset type">
                  <input name="asset_type" value={data.assetType} onChange={(event) => update("assetType", event.target.value)} placeholder="e.g. small multifamily…" required />
                </Field>
              </div>
            </fieldset>

            <fieldset className={visual.formSection}>
              <legend>Funding Request</legend>
              <div className={visual.twoFields}>
                <Field label="Total project uses" hint="A positive amount, without a currency symbol">
                  <input name="total_uses" inputMode="decimal" value={data.totalUses} onChange={(event) => update("totalUses", event.target.value)} placeholder="e.g. 250,000…" aria-invalid={invalid.totalUses || undefined} aria-describedby={invalid.totalUses ? "capital-uses-error" : undefined} required />
                  {invalid.totalUses ? <small id="capital-uses-error" className={visual.fieldError}>Enter a positive amount, such as 250,000.</small> : null}
                </Field>
                <Field label="Requested debt">
                  <input name="requested_debt" inputMode="decimal" value={data.requestedDebt} onChange={(event) => update("requestedDebt", event.target.value)} placeholder="e.g. 200,000…" aria-invalid={invalid.requestedDebt || undefined} aria-describedby={invalid.requestedDebt ? "capital-debt-error" : undefined} required />
                  {invalid.requestedDebt ? <small id="capital-debt-error" className={visual.fieldError}>Enter a positive amount, such as 200,000.</small> : null}
                </Field>
                <Field label="Available cash" hint="Enter 0 if none is available">
                  <input name="available_cash" inputMode="decimal" value={data.availableCash} onChange={(event) => update("availableCash", event.target.value)} placeholder="e.g. 50,000…" aria-invalid={invalid.availableCash || undefined} aria-describedby={invalid.availableCash ? "capital-cash-error" : undefined} required />
                  {invalid.availableCash ? <small id="capital-cash-error" className={visual.fieldError}>Enter 0 or a positive amount.</small> : null}
                </Field>
                <Field label="Property value" hint="Optional estimate">
                  <input name="property_value" inputMode="decimal" value={data.propertyValue} onChange={(event) => update("propertyValue", event.target.value)} placeholder="e.g. 325,000…" aria-invalid={invalid.propertyValue || undefined} aria-describedby={invalid.propertyValue ? "capital-value-error" : undefined} />
                  {invalid.propertyValue ? <small id="capital-value-error" className={visual.fieldError}>Enter a positive amount or leave this blank.</small> : null}
                </Field>
              </div>
            </fieldset>

            <fieldset className={`${visual.formSection} ${visual.wideSection}`}>
              <legend>Repayment &amp; Context</legend>
              <Field label="Repayment or exit path">
                <textarea name="exit_strategy" value={data.exitStrategy} onChange={(event) => update("exitStrategy", event.target.value)} rows={3} placeholder="e.g. Refinance after lease-up…" required />
              </Field>
              <div className={visual.optionalGroup}>
                <span>Optional Assumptions</span>
                <p>These are your estimates, not live financing terms.</p>
                <div className={visual.threeFields}>
                  <Field label="Interest rate" hint="Percent, if known">
                    <input name="interest_rate" inputMode="decimal" value={data.interestRate} onChange={(event) => update("interestRate", event.target.value)} placeholder="e.g. 12…" aria-invalid={invalid.interestRate || undefined} aria-describedby={invalid.interestRate ? "capital-rate-error" : undefined} />
                    {invalid.interestRate ? <small id="capital-rate-error" className={visual.fieldError}>Enter a rate above 0 and no higher than 100.</small> : null}
                  </Field>
                  <Field label="Term" hint="Months, if known">
                    <input name="term_months" inputMode="numeric" value={data.termMonths} onChange={(event) => update("termMonths", event.target.value)} placeholder="e.g. 12…" aria-invalid={invalid.termMonths || undefined} aria-describedby={invalid.termMonths ? "capital-term-error" : undefined} />
                    {invalid.termMonths ? <small id="capital-term-error" className={visual.fieldError}>Enter a whole number of months above 0.</small> : null}
                  </Field>
                  <Field label="Monthly net operating income" hint="If applicable">
                    <input name="monthly_noi" inputMode="decimal" value={data.monthlyNoi} onChange={(event) => update("monthlyNoi", event.target.value)} placeholder="e.g. 3,000…" aria-invalid={invalid.monthlyNoi || undefined} aria-describedby={invalid.monthlyNoi ? "capital-noi-error" : undefined} />
                    {invalid.monthlyNoi ? <small id="capital-noi-error" className={visual.fieldError}>Enter 0 or a positive amount, or leave this blank.</small> : null}
                  </Field>
                </div>
              </div>
              <div className={visual.evidenceGroup}>
                <span>Supporting Evidence You Have</span>
                <p>Optional. Selecting these does not upload or verify a document.</p>
                <div className={visual.checks}>
                  <label><input name="project_budget_ready" type="checkbox" checked={data.projectBudget} onChange={(event) => update("projectBudget", event.target.checked)} /> Itemized project budget</label>
                  <label><input name="exit_evidence_ready" type="checkbox" checked={data.exitEvidence} onChange={(event) => update("exitEvidence", event.target.checked)} /> Exit evidence</label>
                  <label><input name="entity_documents_ready" type="checkbox" checked={data.entityDocuments} onChange={(event) => update("entityDocuments", event.target.checked)} /> Entity documents</label>
                </div>
              </div>
            </fieldset>
          </div>
        </form>

        <section className={visual.lockedPanel} aria-labelledby="capital-result-title">
          <div className={visual.lockedCopy}>
            <span className={visual.eyebrow}>Result preview</span>
            <h2 id="capital-result-title">See the Plan, Not the Answers</h2>
            <p>Your project details appear in the preview. The plan and analysis stay hidden until purchase.</p>
            <div className={visual.lockedNotice}>
              <FileLock aria-hidden="true" size={18} />
              <span>No calculated figures appear in this preview.</span>
            </div>
          </div>
          <div className={visual.resultSheet}>
            <div className={visual.sheetTopline}><span>GENESIS</span><span>CAPITAL ADVISOR</span></div>
            <div className={visual.sheetTitle}>Capital plan</div>
            <div className={visual.sheetContext}>
              <span>FROM YOUR BRIEF</span>
              <strong>{previewProject}</strong>
              <div className={visual.sheetContextDetails}>
                <span>{data.purpose || "Purpose"}</span>
                <span>{previewAsset}</span>
              </div>
            </div>
            <div className={visual.sheetRule} />
            <div className={visual.sheetSection}>
              <span>01 / SOURCES &amp; USES</span>
              <div className={visual.barWide} aria-hidden="true" /><div className={visual.barMedium} aria-hidden="true" />
            </div>
            <div className={visual.sheetColumns}>
              <div className={visual.sheetSection}><span>02 / ASSUMPTIONS</span><div className={visual.barMedium} aria-hidden="true" /><div className={visual.barShort} aria-hidden="true" /></div>
              <div className={visual.sheetSection}><span>03 / READINESS</span><div className={visual.barWide} aria-hidden="true" /><div className={visual.barShort} aria-hidden="true" /></div>
            </div>
            <div className={visual.sheetFooter}><Files size={15} aria-hidden="true" /><span>Full analysis available after purchase</span></div>
          </div>
        </section>

        <section className={visual.bottomAction} aria-label="Capital plan purchase">
          <div>
            <Info aria-hidden="true" size={19} />
            <span>Decision support only. Not a lender quote, match, or financing approval.</span>
          </div>
          {incomplete.length > 0 ? (
            <p className={visual.missingGuidance} aria-live="polite">
              To continue, complete {incomplete.slice(0, 3).join(", ")}{incomplete.length > 3 ? ` and ${incomplete.length - 3} more detail${incomplete.length - 3 === 1 ? "" : "s"}` : ""}.
            </p>
          ) : null}
          <WorkspaceAction
            label="Get My Capital Plan"
            price={advisorPrice}
            disabled={incomplete.length > 0}
            onClick={() => setPurchaseOpen(true)}
          />
        </section>
      </div>

      <PurchaseReview
        open={purchaseOpen}
        name="Capital Advisor"
        price={advisorPrice}
        unit="capital plan"
        onClose={() => setPurchaseOpen(false)}
      />
    </>
  );
}
