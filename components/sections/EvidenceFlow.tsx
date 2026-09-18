import type { CSSProperties } from "react";
import styles from "./EvidenceFlow.module.css";

const stages = [
  ["Inventory", "Eligible records"],
  ["Contactable", "Usable channel"],
  ["Touched", "Verified activity"],
  ["Conversations", "Human response"],
  ["Deals", "Qualified outcome"],
] as const;

const gaps = ["Missing channel", "Awaiting action", "No response", "Not yet qualified"] as const;

/* The same twelve records at every stage, with fewer of them still qualifying:
   how many stay lit is the whole point of the picture. */
const LIT = [12, 9, 6, 4, 2] as const;

/* Which dot goes dark first. Fixed, so the pattern is the same every render
   and reads as records dropping out rather than a bar emptying. */
const ORDER: readonly number[] = [5, 6, 1, 9, 2, 10, 4, 7, 0, 11, 3, 8];

/** The set of records at one stage: twelve dots, only the qualifying ones lit. */
function StageMark({ lit }: { lit: number }) {
  const on = new Set(ORDER.slice(0, lit));

  return (
    <svg viewBox="0 0 48 48" className={styles.mark} aria-hidden="true">
      {ORDER.map((_, index) => (
        <circle
          key={index}
          cx={12 + (index % 4) * 8}
          cy={16 + Math.floor(index / 4) * 8}
          r={on.has(index) ? 2.3 : 1.7}
          className={on.has(index) ? styles.on : styles.off}
        />
      ))}
    </svg>
  );
}

export function EvidenceFlow() {
  return (
    <div className={styles.frame}>
      <div className={styles.header}>
        <div><small>Illustrative evidence model</small><h3>Every result stays connected to its source.</h3></div>
        <span>Exact sets · Same snapshot</span>
      </div>

      <ol className={styles.flow} aria-label="Illustrative revenue evidence flow">
        {stages.map(([title, copy], index) => (
          <li className={styles.group} key={title}>
            <div className={styles.stage} style={{ "--stage": index + 1 } as CSSProperties}>
              <span>0{index + 1}</span>
              <i aria-hidden="true"><StageMark lit={LIT[index]} /></i>
              <b>{title}</b>
              <small>{copy}</small>
            </div>
            {index < gaps.length ? (
              <div className={styles.gap} style={{ "--i": index } as CSSProperties}>
                <i aria-hidden="true" />
                <span>{gaps[index]}</span>
              </div>
            ) : null}
          </li>
        ))}
      </ol>

      <ol className={styles.proof} aria-label="Genesis evidence requirements">
        <li><span>01</span><b>Baseline</b><small>Document the starting state before the build.</small></li>
        <li><span>02</span><b>System change</b><small>Identify the exact workflow Genesis changed.</small></li>
        <li><span>03</span><b>Source records</b><small>Measure inside the operation&rsquo;s system of record.</small></li>
        <li><span>04</span><b>Permission</b><small>Publish only with approved context and wording.</small></li>
      </ol>
    </div>
  );
}
