import styles from "./EngagementPath.module.css";

const stages = [
  ["01", "Consultation", "Free fit conversation"],
  ["02", "Scoping", "Recommendation + next step"],
  ["03", "Implementation", "The system build"],
  ["04", "Launch", "Live in the operation"],
  ["05", "Scoped Management", "Support + improve when included"],
] as const;

export function EngagementPath() {
  return (
    <div className={styles.frame} aria-label="Genesis engagement path">
      <div className={styles.topline}>
        <span>One Infrastructure path</span>
        <span>From operating constraint to an implemented system</span>
      </div>

      <ol className={styles.rail}>
        {stages.map(([number, title, copy], index) => (
          <li key={number} className={styles.stage}>
            <span className={styles.number}>{number}</span>
            <span className={styles.node} aria-hidden="true"><i /></span>
            <div><h3>{title}</h3><p>{copy}</p></div>
            {index === 1 ? (
              <aside className={`${styles.branch} ${styles.pilot}`}>
                <span>Optional scoping</span><b>Discovery / Pilot</b><small>Used when complexity warrants</small>
              </aside>
            ) : null}
            {index === 4 ? (
              <aside className={`${styles.branch} ${styles.enterprise}`}>
                <span>Complex operations</span><b>Custom Infrastructure</b><small>Scoped engagement</small>
              </aside>
            ) : null}
          </li>
        ))}
      </ol>

      <div className={styles.outcome}>
        <span className={styles.outcomeLine} aria-hidden="true" />
        <div><small>The resulting state</small><b>Defined ownership</b></div>
        <p>Launch and any continuing management follow the boundary stated in the proposal.</p>
      </div>
    </div>
  );
}
