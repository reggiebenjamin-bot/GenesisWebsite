"use client";

import { useState } from "react";
import { Check, FileText, ImageSquare, LockKey } from "@phosphor-icons/react";
import { getWorkspaceTool } from "@/lib/toolWorkspace";
import { useWorkspaceDraft } from "../useWorkspaceDraft";
import { DraftBar, Field, PurchaseReview, WorkspaceAction } from "../WorkspaceControls";
import styles from "../WorkspaceShell.module.css";
import visual from "./DealPackagerVisual.module.css";

const packagerPrice = getWorkspaceTool("deal-packager").price;

type EvidenceKey = "photosReady" | "budgetReady" | "compsReady" | "contractReady";

type PackagerDraft = Record<string, unknown> & {
  projectName: string;
  audience: string;
  assetType: string;
  location: string;
  strategy: string;
  status: string;
  summary: string;
  askingPrice: string;
  valueEstimate: string;
  rehabCost: string;
  nextAction: string;
  contactName: string;
  contactEmail: string;
  photosReady: boolean;
  budgetReady: boolean;
  compsReady: boolean;
  contractReady: boolean;
};

const initialDraft: PackagerDraft = {
  projectName: "",
  audience: "",
  assetType: "",
  location: "",
  strategy: "",
  status: "",
  summary: "",
  askingPrice: "",
  valueEstimate: "",
  rehabCost: "",
  nextAction: "",
  contactName: "",
  contactEmail: "",
  photosReady: false,
  budgetReady: false,
  compsReady: false,
  contractReady: false,
};

const documentItems: readonly { key: EvidenceKey; label: string; icon: typeof FileText }[] = [
  { key: "photosReady", label: "Property photos", icon: ImageSquare },
  { key: "budgetReady", label: "Project budget", icon: FileText },
  { key: "compsReady", label: "Comparable support", icon: FileText },
  { key: "contractReady", label: "Contract or terms", icon: FileText },
];

function validAmount(value: string) {
  const trimmed = value.trim();
  const number = Number(trimmed);
  return /^\d+(?:\.\d{1,2})?$/.test(trimmed) && Number.isFinite(number) && number > 0;
}

function optionalAmountValid(value: string) {
  const trimmed = value.trim();
  return !trimmed || (/^\d+(?:\.\d{1,2})?$/.test(trimmed) && Number.isFinite(Number(trimmed)));
}

export function DealPackagerWorkspace() {
  const { data, setData, status, clear } = useWorkspaceDraft("deal-packager", initialDraft);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof PackagerDraft, boolean>>>({});

  const invalidEmail = Boolean(data.contactEmail.trim()) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail.trim());

  const missing = [
    !data.audience && "Recipient type",
    !data.projectName.trim() && "Project name",
    !data.assetType.trim() && "Asset type",
    !data.location.trim() && "Location",
    !data.summary.trim() && "Opportunity summary",
    !validAmount(data.askingPrice) && "Valid asking price",
    !optionalAmountValid(data.valueEstimate) && "Valid value estimate",
    !optionalAmountValid(data.rehabCost) && "Valid project budget",
    invalidEmail && "Valid contact email",
  ].filter((item): item is string => Boolean(item));

  function update<K extends keyof PackagerDraft>(key: K, value: PackagerDraft[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  function markTouched(key: keyof PackagerDraft) {
    setTouched((current) => ({ ...current, [key]: true }));
  }

  function clearDraft() {
    clear();
    setTouched({});
  }

  return (
    <>
      <DraftBar status={status} onClear={clearDraft} />

      <div className={visual.intakeIntro}>
        <div>
          <span className={visual.eyebrow}>Your opportunity</span>
          <h2>Give us the essentials.</h2>
          <p>Enter your details free. Your finished package stays private until you choose the one-time result.</p>
        </div>
        <span className={visual.requiredNote}>* Required to continue</span>
      </div>

      <form className={visual.form} autoComplete="off" onSubmit={(event) => event.preventDefault()}>
        <section className={visual.formSection} aria-labelledby="deal-details-title">
          <div className={visual.sectionHeading}>
            <h3 id="deal-details-title">The deal</h3>
            <p>Enough context to make the package useful. You can add evidence after the essentials.</p>
          </div>

          <div className={styles.twoFields}>
            <Field label="Package for *">
              <select
                name="audience"
                required
                value={data.audience}
                aria-invalid={Boolean(touched.audience && !data.audience)}
                aria-describedby={touched.audience && !data.audience ? "packager-audience-error" : undefined}
                onBlur={() => markTouched("audience")}
                onChange={(event) => update("audience", event.target.value)}
              >
                <option value="">Select recipient</option>
                <option value="Buyer or investor">Buyer or investor</option>
                <option value="Capital partner">Capital partner</option>
                <option value="Lender presentation">Lender presentation</option>
              </select>
              {touched.audience && !data.audience ? <span id="packager-audience-error" className={visual.inlineError} role="status">Choose a recipient type.</span> : null}
            </Field>
            <Field label="Deal status" hint="Optional">
              <select name="deal_status" value={data.status} onChange={(event) => update("status", event.target.value)}>
                <option value="">Select status</option>
                <option value="Under review">Under review</option>
                <option value="Under contract">Under contract</option>
                <option value="Seeking interest">Seeking interest</option>
                <option value="Ready to share">Ready to share</option>
              </select>
            </Field>
          </div>

          <Field label="Project name *">
            <input
              name="project_name"
              required
              value={data.projectName}
              aria-invalid={Boolean(touched.projectName && !data.projectName.trim())}
              aria-describedby={touched.projectName && !data.projectName.trim() ? "packager-project-error" : undefined}
              onBlur={() => markTouched("projectName")}
              onChange={(event) => update("projectName", event.target.value)}
              placeholder="e.g., Parkside Multifamily…"
            />
            {touched.projectName && !data.projectName.trim() ? <span id="packager-project-error" className={visual.inlineError} role="status">Enter a project name.</span> : null}
          </Field>

          <div className={styles.twoFields}>
            <Field label="Asset type *">
              <input
                name="asset_type"
                required
                value={data.assetType}
                aria-invalid={Boolean(touched.assetType && !data.assetType.trim())}
                aria-describedby={touched.assetType && !data.assetType.trim() ? "packager-asset-error" : undefined}
                onBlur={() => markTouched("assetType")}
                onChange={(event) => update("assetType", event.target.value)}
                placeholder="e.g., Multifamily…"
              />
              {touched.assetType && !data.assetType.trim() ? <span id="packager-asset-error" className={visual.inlineError} role="status">Enter an asset type.</span> : null}
            </Field>
            <Field label="Location *">
              <input
                name="location"
                required
                value={data.location}
                aria-invalid={Boolean(touched.location && !data.location.trim())}
                aria-describedby={touched.location && !data.location.trim() ? "packager-location-error" : undefined}
                onBlur={() => markTouched("location")}
                onChange={(event) => update("location", event.target.value)}
                placeholder="e.g., Austin, Texas…"
              />
              {touched.location && !data.location.trim() ? <span id="packager-location-error" className={visual.inlineError} role="status">Enter a city and state.</span> : null}
            </Field>
          </div>

          <Field label="Opportunity summary *" hint="In your words. Mention what is known and what still needs verification.">
            <textarea
              name="opportunity_summary"
              required
              value={data.summary}
              aria-invalid={Boolean(touched.summary && !data.summary.trim())}
              aria-describedby={touched.summary && !data.summary.trim() ? "packager-summary-error" : undefined}
              onBlur={() => markTouched("summary")}
              onChange={(event) => update("summary", event.target.value)}
              rows={4}
              placeholder="e.g., Renovation scope and upside…"
            />
            {touched.summary && !data.summary.trim() ? <span id="packager-summary-error" className={visual.inlineError} role="status">Add a short opportunity summary.</span> : null}
          </Field>
        </section>

        <section className={visual.formSection} aria-labelledby="economics-title">
          <div className={visual.sectionHeading}>
            <h3 id="economics-title">Economics</h3>
            <p>Only the asking price is required. Add estimates when you have them.</p>
          </div>
          <div className={styles.twoFields}>
            <Field label="Asking or purchase price *">
              <input
                type="number"
                name="asking_price"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                required
                value={data.askingPrice}
                aria-invalid={Boolean(touched.askingPrice && !validAmount(data.askingPrice))}
                aria-describedby={touched.askingPrice && !validAmount(data.askingPrice) ? "packager-price-error" : undefined}
                onBlur={() => markTouched("askingPrice")}
                onChange={(event) => update("askingPrice", event.target.value)}
                placeholder="e.g., 1250000…"
              />
              {touched.askingPrice && !validAmount(data.askingPrice) ? <span id="packager-price-error" className={visual.inlineError} role="status">Enter an asking price greater than $0.</span> : null}
            </Field>
            <Field label="Supplied value estimate" hint="Optional. Your estimate, not a Genesis calculation.">
              <input
                type="number"
                name="value_estimate"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={data.valueEstimate}
                aria-invalid={Boolean(touched.valueEstimate && !optionalAmountValid(data.valueEstimate))}
                aria-describedby={touched.valueEstimate && !optionalAmountValid(data.valueEstimate) ? "packager-value-error" : undefined}
                onBlur={() => markTouched("valueEstimate")}
                onChange={(event) => update("valueEstimate", event.target.value)}
                placeholder="e.g., 1520000…"
              />
              {touched.valueEstimate && !optionalAmountValid(data.valueEstimate) ? <span id="packager-value-error" className={visual.inlineError} role="status">Enter a valid amount or leave this empty.</span> : null}
            </Field>
          </div>
          <div className={styles.twoFields}>
            <Field label="Rehab or project budget" hint="Optional">
              <input
                type="number"
                name="project_budget"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={data.rehabCost}
                aria-invalid={Boolean(touched.rehabCost && !optionalAmountValid(data.rehabCost))}
                aria-describedby={touched.rehabCost && !optionalAmountValid(data.rehabCost) ? "packager-budget-error" : undefined}
                onBlur={() => markTouched("rehabCost")}
                onChange={(event) => update("rehabCost", event.target.value)}
                placeholder="e.g., 180000…"
              />
              {touched.rehabCost && !optionalAmountValid(data.rehabCost) ? <span id="packager-budget-error" className={visual.inlineError} role="status">Enter a valid amount or leave this empty.</span> : null}
            </Field>
            <Field label="Strategy" hint="Optional">
              <input name="strategy" value={data.strategy} onChange={(event) => update("strategy", event.target.value)} placeholder="e.g., Acquire and reposition…" />
            </Field>
          </div>
        </section>

        <details className={visual.formSection}>
          <summary className={visual.optionalSummary}>
            <span>Supporting detail</span>
            <small>Optional evidence, next action, and contact</small>
          </summary>
          <div className={visual.optionalBody}>

          <fieldset className={visual.evidence}>
            <legend>What can you provide?</legend>
            <div className={visual.evidenceGrid}>
              {documentItems.map((item) => {
                const Icon = item.icon;
                const checked = data[item.key];
                return (
                  <label key={item.key} className={visual.evidenceItem}>
                    <input type="checkbox" name={item.key} checked={checked} onChange={(event) => update(item.key, event.target.checked)} />
                    <Icon aria-hidden="true" size={19} />
                    <span>{item.label}</span>
                    {checked ? <Check aria-hidden="true" size={15} weight="bold" /> : null}
                  </label>
                );
              })}
            </div>
            <p>This is a readiness checklist. Files are not uploaded or saved here.</p>
          </fieldset>

          <Field label="Suggested next action" hint="Optional">
            <textarea name="next_action" value={data.nextAction} onChange={(event) => update("nextAction", event.target.value)} rows={3} placeholder="e.g., Request the diligence folder…" />
          </Field>

            <div className={styles.twoFields}>
              <Field label="Approved contact name" hint="Optional">
                <input name="contact_name" autoComplete="name" value={data.contactName} onChange={(event) => update("contactName", event.target.value)} />
              </Field>
              <Field label="Approved contact email" hint="Optional">
                <input
                  type="email"
                  name="contact_email"
                  autoComplete="email"
                  spellCheck={false}
                  value={data.contactEmail}
                  aria-invalid={Boolean(touched.contactEmail && invalidEmail)}
                  aria-describedby={touched.contactEmail && invalidEmail ? "packager-email-error" : undefined}
                  onBlur={() => markTouched("contactEmail")}
                  onChange={(event) => update("contactEmail", event.target.value)}
                  placeholder="e.g., alex@example.com…"
                />
                {touched.contactEmail && invalidEmail ? <span id="packager-email-error" className={visual.inlineError} role="status">Enter a valid email or leave this empty.</span> : null}
              </Field>
            </div>
          </div>
        </details>
      </form>

      <section className={visual.preview} aria-labelledby="package-preview-title">
        <div className={visual.previewHeading}>
          <div>
            <span className={visual.eyebrow}>Your result</span>
            <h2 id="package-preview-title">A clear package, not a raw form.</h2>
            <p>A few details you entered appear below. Your deal-specific writing, figures, and evidence index remain locked.</p>
          </div>
          <LockKey aria-hidden="true" size={30} weight="light" />
        </div>

        <div className={visual.paper}>
          <div className={visual.paperTopline}>
            <span>GENESIS / DEAL PACKAGE</span>
            <span>PRIVATE RESULT</span>
          </div>
          <h3>{data.projectName.trim() || "Your opportunity"}</h3>
          <p className={visual.paperSubline}>Prepared for review</p>
          {data.assetType.trim() || data.location.trim() ? (
            <dl className={visual.paperFacts}>
              {data.assetType.trim() ? (
                <div>
                  <dt>Asset</dt>
                  <dd>{data.assetType.trim()}</dd>
                </div>
              ) : null}
              {data.location.trim() ? (
                <div>
                  <dt>Location</dt>
                  <dd>{data.location.trim()}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          <div className={visual.paperBlock}>
            <span>Opportunity at a glance</span>
            <div className={visual.maskLines} aria-hidden="true"><i /><i /><i /></div>
          </div>
          <div className={visual.paperColumns}>
            <div className={visual.paperBlock}>
              <span>Investment case</span>
              <div className={visual.maskLines} aria-hidden="true"><i /><i /><i /></div>
            </div>
            <div className={visual.paperBlock}>
              <span>Deal economics</span>
              <div className={visual.maskValues} aria-hidden="true"><i /><i /><i /></div>
            </div>
          </div>
          <div className={visual.paperBlock}>
            <span>Evidence index and next action</span>
            <div className={visual.maskLines} aria-hidden="true"><i /><i /></div>
          </div>
          <div className={visual.lockedLine}><LockKey aria-hidden="true" size={15} /> Deal-specific content is reserved for the finished package.</div>
        </div>
      </section>

      <section className={visual.checkout} aria-labelledby="packager-checkout-title">
        <div>
          <span className={visual.eyebrow}>When you are ready</span>
          <h2 id="packager-checkout-title">Finish your package.</h2>
          <p>One result, one payment. Your information can be entered and saved on this device without paying.</p>
        </div>
        <div className={visual.purchaseGate}>
          {missing.length ? (
            <div className={visual.missing} aria-live="polite">
              <strong>Complete the essentials to continue</strong>
              <p>{missing.join(" · ")}</p>
            </div>
          ) : null}
          <WorkspaceAction label="Purchase finished package" price={packagerPrice} disabled={missing.length > 0} onClick={() => setPurchaseOpen(true)} />
        </div>
      </section>

      <PurchaseReview open={purchaseOpen} name="Deal Packager" price={packagerPrice} unit="package" onClose={() => setPurchaseOpen(false)} />
    </>
  );
}
