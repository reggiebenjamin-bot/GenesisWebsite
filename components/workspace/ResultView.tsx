"use client";

import { useState } from "react";
import { Copy, Printer } from "@phosphor-icons/react";
import type { ResultRow } from "@/lib/toolResults";
import { FUNDING_LINE } from "@/lib/legal";
import styles from "./WorkspaceShell.module.css";

export function ResultCard({
  eyebrow,
  stamp,
  title,
  subtitle,
  children,
  copyText,
  copyLabel,
}: {
  eyebrow: string;
  stamp: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  copyText?: string;
  copyLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  function print() {
    window.print();
  }

  async function copy() {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className={styles.result} aria-label={`${title} result`}>
      <div className={styles.resultTop}>
        <span>{eyebrow}</span>
        <span>{stamp}</span>
      </div>
      <h3 className={styles.resultTitle}>{title}</h3>
      {subtitle ? <p className={styles.resultSubtitle}>{subtitle}</p> : null}
      <div className={styles.resultBody}>{children}</div>
      <div className={styles.resultActions}>
        <button type="button" className={styles.resultButton} onClick={print}>
          <Printer aria-hidden="true" size={17} /> Print or save as PDF
        </button>
        {copyText ? (
          <button type="button" className={`${styles.resultButton} ${styles.resultButtonGhost}`} onClick={copy}>
            <Copy aria-hidden="true" size={17} /> {copied ? "Copied" : copyLabel ?? "Copy text"}
          </button>
        ) : null}
      </div>
      <p className={styles.resultFunding}>{FUNDING_LINE}</p>
    </section>
  );
}

export function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.resultSection}>
      <span className={styles.resultSectionTitle}>{title}</span>
      {children}
    </div>
  );
}

export function ResultTable({ rows }: { rows: readonly ResultRow[] }) {
  return (
    <dl className={styles.resultTable}>
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ResultFacts({ rows }: { rows: readonly ResultRow[] }) {
  if (rows.length === 0) return null;
  return (
    <dl className={styles.resultFacts}>
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ResultList({ items }: { items: readonly string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className={styles.resultList}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function UnlockNotice({ state }: { state: "verifying" | "failed" | "missing" }) {
  if (state === "verifying") {
    return (
      <div className={styles.resultNotice} aria-live="polite">
        <h3>Confirming your purchase</h3>
        <p>One moment while we check your payment and prepare your result.</p>
      </div>
    );
  }
  if (state === "missing") {
    return (
      <div className={styles.resultNotice} aria-live="polite">
        <h3>We could not find your saved inputs</h3>
        <p>
          Your purchase is still valid on this device. Please re enter your details in the form above and your
          finished result will appear here automatically.
        </p>
      </div>
    );
  }
  return (
    <div className={styles.resultNotice} aria-live="polite">
      <h3>We could not confirm this purchase yet</h3>
      <p>
        If you just paid, give it a moment and refresh this page. If the problem continues, your purchase stays
        tied to this checkout, so you can return to this link to try again.
      </p>
    </div>
  );
}
