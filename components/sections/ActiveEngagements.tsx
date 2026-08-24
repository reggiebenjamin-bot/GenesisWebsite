import Link from "next/link";
import { activeEngagements } from "@/lib/content";
import styles from "./ActiveEngagements.module.css";

export function ActiveEngagements() {
  return (
    <div className={styles.grid}>
      {activeEngagements.map((engagement) => (
        <article className={styles.card} key={engagement.slug}>
          <header className={styles.header}>
            <span className={styles.number} aria-hidden="true">
              {engagement.number}
            </span>
            <span
              className={styles.status}
              data-state={
                engagement.status === "Live — In Production"
                  ? "live"
                  : "underway"
              }
            >
              <i aria-hidden="true" />
              {engagement.status}
            </span>
          </header>

          <div className={styles.body}>
            <p className={styles.identity}>Active engagement</p>
            <h3>{engagement.identity}</h3>
            <p className={styles.description}>{engagement.description}</p>
          </div>

          <dl className={styles.slots}>
            <div>
              <dt>Client voice</dt>
              <dd>
                {engagement.quote ? (
                  <blockquote>
                    <p>“{engagement.quote.text}”</p>
                    <cite>{engagement.quote.attribution}</cite>
                  </blockquote>
                ) : (
                  <span>Publishes only with written client approval.</span>
                )}
              </dd>
            </div>

            <div>
              <dt>Verified outcome</dt>
              <dd>
                {engagement.metric ? (
                  <span>
                    <strong>{engagement.metric.value}</strong>{" "}
                    {engagement.metric.label}
                  </span>
                ) : (
                  <span>Pending measurement and client clearance.</span>
                )}
              </dd>
            </div>

            <div>
              <dt>Case study</dt>
              <dd>
                {engagement.caseStudyHref ? (
                  <Link href={engagement.caseStudyHref}>Read the evidence</Link>
                ) : (
                  <span>Reserved until the evidence is complete.</span>
                )}
              </dd>
            </div>
          </dl>

          <footer>
            Outcome data publishes only once measured and cleared by the client.
          </footer>
        </article>
      ))}
    </div>
  );
}
