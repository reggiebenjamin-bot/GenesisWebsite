"use client";

import { Check, Info, Trash } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import styles from "./WorkspaceShell.module.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function DraftBar({
  status, onClear, conflict, onChoose,
}: {
  status: string;
  onClear: () => void;
  conflict?: "different" | "clear" | null;
  onChoose?: (source: "account" | "device") => void;
}) {
  const [confirming, setConfirming] = useState(false);

  function clearDraft() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onClear();
    setConfirming(false);
  }

  if (conflict) return (
    <section className={styles.draftConflict} aria-labelledby="draft-conflict-title" role="status">
      <div>
        <h2 id="draft-conflict-title">Choose which draft to keep</h2>
        <p>{conflict === "clear"
          ? "This account draft changed elsewhere. Keep its latest version, or clear it from your account."
          : "You have a draft on this device and a different one in your account. Choosing one replaces the other for this product."}</p>
      </div>
      <div className={styles.draftChoices}>
        <button type="button" onClick={() => onChoose?.("account")}>Use account draft</button>
        <button type="button" onClick={() => onChoose?.("device")}>{conflict === "clear" ? "Clear account draft" : "Use this device’s draft"}</button>
      </div>
    </section>
  );

  const message = status === "Storage unavailable" ? "Device storage is unavailable. Check browser storage settings before leaving."
    : status === "Loading draft" ? "Loading your draft…"
      : status === "Account sync unavailable" ? "Account sync is unavailable. This draft is on this device only; refresh to retry."
        : status === "Account save failed" ? "Account save failed. Check your connection and refresh before leaving."
          : status === "Saving to your account" ? "Saving to your account…"
            : status === "Account ready" ? "Your edits will save to your account."
            : status === "Saved to your account" ? "Saved to your account for up to 365 days after your last edit."
              : "Saved on this device for 30 days.";

  return (
    <div className={styles.draftBar}>
      <span aria-live="polite"><Check aria-hidden="true" size={15} weight="bold" />{message}</span>
      {status !== "Loading draft" && status !== "Account ready" ? <button type="button" onClick={clearDraft} onBlur={() => setConfirming(false)}>
        <Trash aria-hidden="true" size={14} />
        {confirming ? "Confirm clear draft" : status === "Account sync unavailable" ? "Clear device draft" : "Clear draft"}
      </button> : null}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function PurchaseReview({
  open,
  name,
  price,
  unit,
  onClose,
}: {
  open: boolean;
  name: string;
  price: number;
  unit: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, [open]);

  if (!open) return null;

  return (
    <dialog ref={dialogRef} className={styles.purchaseDialog} onClose={onClose} onCancel={onClose} aria-labelledby="purchase-title">
      <section className={styles.purchaseReview}>
        <div>
          <span className={styles.purchaseKicker}>One-time purchase</span>
          <h3 id="purchase-title">Your {unit} · {currency.format(price)} once</h3>
          <p>
            Your brief has the essential details. The example is free to watch; the personalized {unit} would be the paid result.
          </p>
        </div>
        <div className={styles.purchaseNotice}>
          <Info aria-hidden="true" size={18} />
          <p>
            This is a local design preview. Checkout and result generation are not connected yet.
            No payment or submission has occurred.
          </p>
        </div>
        <button type="button" className={styles.secondaryButton} onClick={onClose}>
          Return to {name}
        </button>
      </section>
    </dialog>
  );
}

export function WorkspaceAction({
  label,
  price,
  onClick,
  disabled = false,
}: {
  label: string;
  price: number;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" className={styles.primaryButton} onClick={onClick} disabled={disabled}>
      <span>{label}</span>
      <span>{currency.format(price)} once</span>
    </button>
  );
}
