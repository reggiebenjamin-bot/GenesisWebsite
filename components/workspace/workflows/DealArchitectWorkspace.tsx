"use client";

import { useState } from "react";
import { Lock } from "@phosphor-icons/react";
import { getWorkspaceTool } from "@/lib/toolWorkspace";
import { useWorkspaceDraft } from "../useWorkspaceDraft";
import { DraftBar, Field, PurchaseReview, WorkspaceAction } from "../WorkspaceControls";
import styles from "../WorkspaceShell.module.css";
import visual from "./DealArchitectVisual.module.css";

const architectPrice = getWorkspaceTool("deal-architect").price;

type ArchitectDraft = Record<string, unknown> & {
  projectName: string;
  strategy: string;
  address: string;
  purchasePrice: string;
  closingCosts: string;
  rehabCost: string;
  carryingCosts: string;
  sellingCosts: string;
  resaleValue: string;
  holdMonths: string;
  notes: string;
};

// The read-only walkthrough owns the example. A new customer draft starts empty.
const initialDraft: ArchitectDraft = {
  projectName: "", strategy: "Flip", address: "", purchasePrice: "", closingCosts: "",
  rehabCost: "", carryingCosts: "", sellingCosts: "", resaleValue: "", holdMonths: "", notes: "",
};

function validAmount(value: string, allowZero = false) {
  const trimmed = value.trim();
  if (!/^\$?\s*(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(trimmed)) return false;
  const amount = Number(trimmed.replaceAll(",", "").replace("$", "").trim());
  return Number.isFinite(amount) && (allowZero ? amount >= 0 : amount > 0);
}

function validMonths(value: string) {
  return /^\d+$/.test(value.trim()) && Number(value) > 0;
}

function validOptionalAmount(value: string) {
  return !value.trim() || validAmount(value, true);
}

export function DealArchitectWorkspace() {
  const { data, setData, status, clear } = useWorkspaceDraft("deal-architect", initialDraft);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const isRental = data.strategy === "Rental";
  const missing = [
    !data.address.trim() ? "property address or parcel" : null,
    !validAmount(data.purchasePrice) ? "purchase price" : null,
    !validAmount(data.resaleValue) ? (isRental ? "property value" : "resale value") : null,
    !validAmount(data.rehabCost, true) ? "rehab or site-work cost (enter 0 if none)" : null,
    !validMonths(data.holdMonths) ? "expected hold period" : null,
    !validOptionalAmount(data.closingCosts) ? "valid closing costs" : null,
    !validOptionalAmount(data.carryingCosts) ? "valid carrying and financing costs" : null,
    !validOptionalAmount(data.sellingCosts) ? "valid selling costs" : null,
  ].filter((item): item is string => Boolean(item));
  const ready = missing.length === 0;

  function update<K extends keyof ArchitectDraft>(key: K, value: ArchitectDraft[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      <DraftBar status={status} onClear={clear} />
      <div className={visual.flow}>
        <form className={`${styles.inputPanel} ${visual.formPanel}`} autoComplete="off" onSubmit={(event) => event.preventDefault()}>
          <div className={visual.formHeading}>
            <span className={visual.kicker}>Your deal</span>
            <h2>Start with what you know.</h2>
            <p>Your inputs stay in a local draft. Nothing here calculates or reveals a result before purchase.</p>
          </div>

          <fieldset className={styles.fieldset}>
            <legend>Property and strategy</legend>
            <Field label="Project name" hint="Optional. A short name helps you find this draft later.">
              <input name="project_name" value={data.projectName} onChange={(event) => update("projectName", event.target.value)} autoComplete="off" placeholder="e.g., Oak Street renovation…" />
            </Field>
            <div className={styles.twoFields}>
              <Field label="Strategy">
                <select name="strategy" value={data.strategy} onChange={(event) => update("strategy", event.target.value)}>
                  <option>Flip</option><option>Rental</option><option>Lot resale</option>
                </select>
              </Field>
              <Field label="Hold period" hint="Months">
                <input name="hold_months" type="number" min="1" step="1" inputMode="numeric" value={data.holdMonths} onChange={(event) => update("holdMonths", event.target.value)} placeholder="e.g., 6…" aria-invalid={Boolean(data.holdMonths.trim()) && !validMonths(data.holdMonths)} required />
                {data.holdMonths.trim() && !validMonths(data.holdMonths) ? <small className={visual.fieldError}>Enter a whole number above 0.</small> : null}
              </Field>
            </div>
            <Field label="Address or parcel">
              <input name="property_address" value={data.address} onChange={(event) => update("address", event.target.value)} autoComplete="street-address" placeholder="e.g., 123 Main St or parcel ID…" required />
            </Field>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend>Deal economics</legend>
            <div className={styles.twoFields}>
              <Field label="Purchase price">
                <input name="purchase_price" type="text" inputMode="decimal" value={data.purchasePrice} onChange={(event) => update("purchasePrice", event.target.value)} placeholder="e.g., $145,000…" aria-invalid={Boolean(data.purchasePrice.trim()) && !validAmount(data.purchasePrice)} required />
                {data.purchasePrice.trim() && !validAmount(data.purchasePrice) ? <small className={visual.fieldError}>Enter an amount above 0.</small> : null}
              </Field>
              <Field label={isRental ? "Property value" : "Resale value"} hint="Your estimate, not an appraisal">
                <input name="resale_value" type="text" inputMode="decimal" value={data.resaleValue} onChange={(event) => update("resaleValue", event.target.value)} placeholder="e.g., $250,000…" aria-invalid={Boolean(data.resaleValue.trim()) && !validAmount(data.resaleValue)} required />
                {data.resaleValue.trim() && !validAmount(data.resaleValue) ? <small className={visual.fieldError}>Enter an amount above 0.</small> : null}
              </Field>
              <Field label="Rehab or site work" hint="Enter 0 if there is none">
                <input name="rehab_cost" type="text" inputMode="decimal" value={data.rehabCost} onChange={(event) => update("rehabCost", event.target.value)} placeholder="e.g., $42,000 or 0…" aria-invalid={Boolean(data.rehabCost.trim()) && !validAmount(data.rehabCost, true)} required />
                {data.rehabCost.trim() && !validAmount(data.rehabCost, true) ? <small className={visual.fieldError}>Enter 0 or a positive amount.</small> : null}
              </Field>
              <Field label="Closing costs" hint="Optional">
                <input name="closing_costs" type="text" inputMode="decimal" value={data.closingCosts} onChange={(event) => update("closingCosts", event.target.value)} placeholder="e.g., $5,000…" aria-invalid={!validOptionalAmount(data.closingCosts)} />
                {!validOptionalAmount(data.closingCosts) ? <small className={visual.fieldError}>Enter a valid amount or leave blank.</small> : null}
              </Field>
              <Field label="Carrying and financing" hint="Optional">
                <input name="carrying_costs" type="text" inputMode="decimal" value={data.carryingCosts} onChange={(event) => update("carryingCosts", event.target.value)} placeholder="e.g., $10,000…" aria-invalid={!validOptionalAmount(data.carryingCosts)} />
                {!validOptionalAmount(data.carryingCosts) ? <small className={visual.fieldError}>Enter a valid amount or leave blank.</small> : null}
              </Field>
              <Field label="Selling costs" hint="Optional">
                <input name="selling_costs" type="text" inputMode="decimal" value={data.sellingCosts} onChange={(event) => update("sellingCosts", event.target.value)} placeholder="e.g., $15,000…" aria-invalid={!validOptionalAmount(data.sellingCosts)} />
                {!validOptionalAmount(data.sellingCosts) ? <small className={visual.fieldError}>Enter a valid amount or leave blank.</small> : null}
              </Field>
            </div>
          </fieldset>

          <Field label="Evidence and notes" hint="Optional. Add sources or assumptions to verify.">
            <textarea name="evidence_notes" value={data.notes} onChange={(event) => update("notes", event.target.value)} rows={3} placeholder="Comps, contractor quotes, financing terms…" />
          </Field>
        </form>

        <section className={visual.previewPanel} aria-labelledby="architect-preview-title">
          <div className={visual.previewIntro}>
            <div>
              <span className={visual.kicker}>Finished result preview</span>
              <h2 id="architect-preview-title">A decision brief, not just a calculator.</h2>
              <p>The layout below is only a preview. No analysis has been generated yet.</p>
            </div>
            <Lock size={24} weight="light" aria-hidden="true" />
          </div>
          <div className={visual.paper}>
            <div className={visual.paperTop}><span>GENESIS / DEAL ARCHITECT</span><span>PRIVATE DECISION BRIEF</span></div>
            <h3>{data.projectName.trim() || "Your project"}</h3>
            <dl className={visual.paperFacts}>
              <div><dt>Strategy</dt><dd>{data.strategy}</dd></div>
              {data.address.trim() ? <div><dt>Property</dt><dd>{data.address.trim()}</dd></div> : null}
            </dl>
            <div className={visual.paperRule} />
            <div className={visual.paperSections}>
              <div><span>01 / Deal thesis</span><i className={visual.lineLong} /><i className={visual.lineMedium} /><i className={visual.lineShort} /></div>
              <div><span>02 / Cost and exit analysis</span><i className={visual.lineMedium} /><i className={visual.lineLong} /><i className={visual.lineShort} /></div>
              <div><span>03 / Risks and next moves</span><i className={visual.lineLong} /><i className={visual.lineShort} /></div>
            </div>
            <div className={visual.paperFoot}>Analysis available after purchase</div>
          </div>
        </section>

        <section className={visual.checkoutGate} aria-live="polite">
          <div>
            <span className={visual.kicker}>{ready ? "Your inputs are in" : "One-time purchase"}</span>
            <h2>{ready ? "Ready for the finished analysis." : "Your result, when you’re ready."}</h2>
            <p>{ready
              ? "Review the one-time purchase before anything is charged."
              : `Finish ${missing.length} ${missing.length === 1 ? "detail" : "details"} above to continue. Start with ${missing[0]}.`}</p>
          </div>
          <WorkspaceAction label="Purchase Deal Architect result" price={architectPrice} disabled={!ready} onClick={() => setPurchaseOpen(true)} />
        </section>
      </div>

      <PurchaseReview open={ready && purchaseOpen} name="Deal Architect" price={architectPrice} unit="analysis" onClose={() => setPurchaseOpen(false)} />
    </>
  );
}
