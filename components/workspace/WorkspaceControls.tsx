"use client";

import { Check, Info, Trash } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import styles from "./WorkspaceShell.module.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function DraftBar({ status, onClear }: { status: string; onClear: () => void }) {
  const [confirming, setConfirming] = useState(false);

  function clearDraft() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onClear();
    setConfirming(false);
  }

  return (
    <div className={styles.draftBar}>
      <span aria-live="polite">
        <Check aria-hidden="true" size={15} weight="bold" />
        {status === "Storage unavailable"
          ? "Storage unavailable. Your edits may not be kept."
          : status === "Loading draft"
            ? "Loading your draft…"
            : "Saved on this device for 30 days."}
      </span>
      <button type="button" onClick={clearDraft} onBlur={() => setConfirming(false)}>
        <Trash aria-hidden="true" size={14} />
        {confirming ? "Confirm clear draft" : "Clear draft"}
      </button>
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
