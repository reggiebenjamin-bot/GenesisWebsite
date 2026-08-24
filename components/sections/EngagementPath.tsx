import styles from "./EngagementPath.module.css";

const stages = [
  ["01", "Consultation", "Free fit conversation"],
  ["02", "Discovery", "Scope + roadmap"],
  ["03", "Implementation", "The system build"],
  ["04", "Launch", "Live in the operation"],
  ["05", "Managed Platform", "Operate + improve"],
] as const;

export function EngagementPath() {
  return (
    <div className={styles.frame} aria-label="Genesis engagement path">
      <div className={styles.topline}>
        <span>One commercial path</span>
        <span>From operating constraint to managed system</span>
      </div>

      <ol className={styles.rail}>
        {stages.map(([number, title, copy], index) => (
          <li key={number} className={styles.stage}>
            <span className={styles.number}>{number}</span>
            <span className={styles.node} aria-hidden="true"><i /></span>
            <div><h3>{title}</h3><p>{copy}</p></div>
            {index === 1 ? (
              <aside className={`${styles.branch} ${styles.pilot}`}>
                <span>Optional branch</span><b>Pilot</b><small>Validate one workflow</small>
              </aside>
            ) : null}
            {index === 4 ? (
              <aside className={`${styles.branch} ${styles.enterprise}`}>
                <span>Larger operations</span><b>Enterprise</b><small>Managed partnership</small>
              </aside>
            ) : null}
          </li>
        ))}
      </ol>

      <div className={styles.outcome}>
        <span className={styles.outcomeLine} aria-hidden="true" />
        <div><small>The resulting state</small><b>Continuous operation</b></div>
        <p>The product stays live, managed, and accountable as the business changes.</p>
      </div>
    </div>
  );
}
