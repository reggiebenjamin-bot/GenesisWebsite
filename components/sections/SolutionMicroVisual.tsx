"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import styles from "./SolutionMicroVisual.module.css";

export type SolutionVisualKind = "foundation" | "workflows" | "crm" | "managed";

export function SolutionMicroVisual({ kind }: { kind: SolutionVisualKind }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.55 });
  const reducedMotion = useReducedMotion();
  const state = reducedMotion ? "complete" : inView ? "active" : "idle";

  return (
    <div
      ref={ref}
      className={`${styles.visual} ${styles[kind]}`}
      data-state={state}
      aria-hidden="true"
    >
      {kind === "foundation" ? <Foundation /> : null}
      {kind === "workflows" ? <Workflows /> : null}
      {kind === "crm" ? <Crm /> : null}
      {kind === "managed" ? <Managed /> : null}
    </div>
  );
}

function Foundation() {
  return (
    <>
      <svg className={styles.foundationLines} viewBox="0 0 300 170" fill="none">
        <path d="M150 86 65 30M150 86 236 30M150 86 45 91M150 86 69 143M150 86 231 143" />
      </svg>
      <span className={`${styles.foundationCore} ${styles.core}`}>365</span>
      {[
        ["Email", "mail", "one"],
        ["Identity", "id", "two"],
        ["Calendar", "calendar", "three"],
        ["Documents", "document", "four"],
        ["Teams", "teams", "five"],
      ].map(([label, icon, position]) => (
        <span key={label} className={`${styles.foundationModule} ${styles[position]}`}>
          <i className={styles.icon} data-icon={icon} />
          <b>{label}</b>
        </span>
      ))}
      <span className={styles.foundationCaption}>Provisioned foundation</span>
    </>
  );
}

function Workflows() {
  return (
    <>
      <svg className={styles.workflowPath} viewBox="0 0 300 170" fill="none">
        <path d="M30 86h52l22-34h48l22 68h52l22-34h22" />
      </svg>
      <span className={`${styles.workflowNode} ${styles.request}`}>Request</span>
      <span className={`${styles.workflowNode} ${styles.draft}`}>Draft</span>
      <span className={`${styles.workflowNode} ${styles.route}`}>Route</span>
      <span className={`${styles.workflowNode} ${styles.complete}`}>Complete</span>
      <span className={styles.workflowPulse} />
      <span className={styles.workflowCaption}>Follow-up routed automatically</span>
    </>
  );
}

function Crm() {
  const stages = ["New", "Follow-up", "Booked", "Closed"];
  return (
    <>
      <span className={styles.optional}>Optional layer</span>
      <div className={styles.pipeline}>
        {stages.map((stage, index) => (
          <span className={styles.pipelineStage} key={stage}>
            <i>{index + 1}</i>
            <b>{stage}</b>
          </span>
        ))}
        <span className={styles.pipelineLead} />
      </div>
      <span className={styles.crmCaption}>Opportunity progression</span>
    </>
  );
}

function Managed() {
  return (
    <>
      <span className={styles.managedCore}>G</span>
      <svg className={styles.managedOrbit} viewBox="0 0 300 170" fill="none">
        <circle cx="150" cy="84" r="51" />
        <circle className={styles.scanArc} cx="150" cy="84" r="51" />
      </svg>
      {[
        ["Monitor", "monitor"],
        ["Maintain", "maintain"],
        ["Refine", "refine"],
        ["Support", "support"],
      ].map(([label, position]) => (
        <span key={label} className={`${styles.managedIndicator} ${styles[position]}`}>
          <i />
          {label}
        </span>
      ))}
      <span className={styles.managedCaption}>System health: stable</span>
    </>
  );
}
