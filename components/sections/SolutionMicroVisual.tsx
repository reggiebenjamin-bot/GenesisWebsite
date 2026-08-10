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
      <svg className={styles.foundationLines} viewBox="0 0 300 150" fill="none">
        <path d="M150 75 73 31M150 75 225 31M150 75 49 75M150 75 73 119M150 75 225 119" />
      </svg>
      <span className={styles.foundationCore}>365</span>
      <i className={`${styles.foundationNode} ${styles.foundationNodeOne}`} />
      <i className={`${styles.foundationNode} ${styles.foundationNodeTwo}`} />
      <i className={`${styles.foundationNode} ${styles.foundationNodeThree}`} />
      <i className={`${styles.foundationNode} ${styles.foundationNodeFour}`} />
      <i className={`${styles.foundationNode} ${styles.foundationNodeFive}`} />
    </>
  );
}

function Workflows() {
  return (
    <>
      <svg className={styles.workflowLine} viewBox="0 0 300 150" fill="none">
        <path d="M35 75h230" />
      </svg>
      <i className={`${styles.workflowNode} ${styles.workflowNodeOne}`} />
      <i className={`${styles.workflowNode} ${styles.workflowNodeTwo}`} />
      <i className={`${styles.workflowNode} ${styles.workflowNodeThree}`} />
      <i className={`${styles.workflowNode} ${styles.workflowNodeFour}`} />
      <i className={styles.workflowPulse} />
    </>
  );
}

function Crm() {
  return (
    <div className={styles.pipeline}>
      <span>New</span>
      <span>Follow-up</span>
      <span>Booked</span>
      <span>Closed</span>
      <i className={styles.pipelineLead} />
    </div>
  );
}

function Managed() {
  return (
    <>
      <svg className={styles.managedOrbit} viewBox="0 0 300 150" fill="none">
        <circle cx="150" cy="75" r="45" />
        <circle className={styles.scanArc} cx="150" cy="75" r="45" />
      </svg>
      <span className={styles.managedCore}>G</span>
      <i className={`${styles.managedNode} ${styles.managedNodeOne}`} />
      <i className={`${styles.managedNode} ${styles.managedNodeTwo}`} />
      <i className={`${styles.managedNode} ${styles.managedNodeThree}`} />
      <i className={`${styles.managedNode} ${styles.managedNodeFour}`} />
    </>
  );
}
