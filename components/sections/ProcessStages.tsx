import type { CSSProperties } from "react";
import { Points } from "@/components/ui/Blocks";
import { processSteps } from "@/lib/content";
import styles from "./ProcessStages.module.css";

/** What each stage produces, in a few words each. */
const stageDetails = [
  ["Current systems and responsibilities", "Highest-value operating friction", "Fit and next step"],
  ["Tools, access, and data flow", "Recommended scope and order", "Discovery or Pilot when warranted"],
  ["Provisioning and configuration", "Workflow and integration build", "Client access and adoption"],
  ["Daily use and validation", "Human approval points", "Go-live support"],
  ["Monitoring and support", "Maintenance and refinement", "Improvements within scope"],
] as const;

/**
 * The five stages of an engagement as five cards: what the stage is, what it
 * produces, and — for anyone who wants it — what actually happens, one tap
 * away.
 */
export function ProcessStages() {
  return (
    <ol className={styles.stages}>
      {processSteps.map((step, index) => (
        <li
          key={step.number}
          className={styles.stage}
          style={
            { "--progress": `${((index + 1) / processSteps.length) * 100}%` } as CSSProperties
          }
        >
          <span aria-hidden="true" className={styles.ghost}>
            {step.number}
          </span>

          <div className={styles.head}>
            <span className={styles.number}>{step.number}</span>
            <span className={styles.cue}>{step.summary}</span>
          </div>

          <h2 className={styles.title}>{step.title}</h2>

          <Points items={stageDetails[index]} className="relative mt-6" />

          <details className={styles.details}>
            <summary className={styles.summary}>
              What happens
              <span aria-hidden="true" className={styles.plus}>
                +
              </span>
            </summary>
            <p className={styles.body}>{step.method}</p>
          </details>
        </li>
      ))}
    </ol>
  );
}
