import styles from "./EvidenceFlow.module.css";

const stages = [
  ["Inventory", "Eligible records"],
  ["Contactable", "Usable channel"],
  ["Touched", "Verified activity"],
  ["Conversations", "Human response"],
  ["Deals", "Qualified outcome"],
] as const;

const gaps = ["Missing channel", "Awaiting action", "No response", "Not yet qualified"] as const;

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
            <div className={styles.stage} style={{ "--stage": index + 1 } as React.CSSProperties}>
              <span>0{index + 1}</span><i aria-hidden="true" /><b>{title}</b><small>{copy}</small>
            </div>
            {index < gaps.length ? <div className={styles.gap}><i aria-hidden="true" /><span>{gaps[index]}</span></div> : null}
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
