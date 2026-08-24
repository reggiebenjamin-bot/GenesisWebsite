import styles from "./ProductCockpit.module.css";

const capabilities = [
  ["Signal intelligence", "Evidence becomes priority"],
  ["Action queues", "The next move stays visible"],
  ["Deal flow", "Ownership and handoffs stay clear"],
  ["Revenue diagnostics", "Claims connect to records"],
] as const;

export function ProductCockpit() {
  return (
    <div className={styles.frame}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.chrome}>
        <span className={styles.dots} aria-hidden="true"><i /><i /><i /></span>
        <span>Genesis · Guided Revenue OS</span>
        <span className={styles.live}><i /> Managed live</span>
      </div>

      <div className={styles.workspace}>
        <aside className={styles.sidebar} aria-label="Illustrative product navigation">
          <div className={styles.brand}><span>G</span><b>Genesis</b></div>
          <p>Work</p>
          {[
            ["Today", true],
            ["Leads", false],
            ["Deals", false],
            ["Outreach", false],
          ].map(([label, active]) => (
            <span key={String(label)} className={active ? styles.activeNav : ""}>
              <i aria-hidden="true" />{label}
            </span>
          ))}
          <p>Intelligence</p>
          <span><i aria-hidden="true" />Reports</span>
        </aside>

        <main className={styles.main}>
          <header className={styles.head}>
            <div><small>Daily operating view</small><h3>Today</h3><p>One clear view of what deserves movement.</p></div>
            <span>Illustrative product view</span>
          </header>

          <div className={styles.pulse}>
            <div><small>Priority queue</small><b>12</b><span>Ranked next actions</span></div>
            <div><small>Due today</small><b>5</b><span>Owner-visible work</span></div>
            <div><small>Active deals</small><b>8</b><span>Moving forward</span></div>
          </div>

          <section className={styles.nextMove}>
            <div>
              <small>Your next move</small>
              <h4>Review qualified acquisition</h4>
              <p>Infill opportunity · Central Texas</p>
              <div className={styles.badges}><span>High priority</span><span>3 supporting signals</span></div>
              <blockquote>New response and diligence file detected. Prepare the decision brief before the next handoff.</blockquote>
            </div>
            <div className={styles.actions}><b>Prepare brief</b><span>Open record</span></div>
          </section>

          <div className={styles.lower}>
            <section className={styles.signalList}>
              <header><b>Why it moved up</b><span>Evidence-linked</span></header>
              {["Verified ownership", "Response detected", "Follow-up due"].map((item, index) => (
                <div key={item}><i data-index={index + 1} /><span>{item}</span><small>{index === 1 ? "New signal" : "Connected"}</small></div>
              ))}
            </section>
            <aside className={styles.brief}>
              <small>Genesis brief</small>
              <b>Context before action.</b>
              <p>New evidence is connected to the opportunity. The recommended next step is ready for human review.</p>
              <span>Source-linked · Permission-aware</span>
            </aside>
          </div>
        </main>
      </div>

      <div className={styles.capabilities}>
        {capabilities.map(([title, copy], index) => (
          <div key={title}><span>0{index + 1}</span><b>{title}</b><small>{copy}</small></div>
        ))}
      </div>
    </div>
  );
}
