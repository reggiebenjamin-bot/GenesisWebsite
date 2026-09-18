import { Disclosure, SectionIntro } from "@/components/ui/Blocks";
import { processSteps } from "@/lib/content";
import styles from "./ProcessTimeline.module.css";

/**
 * The managed engagement as a timeline: big step numbers and short labels
 * along a dotted rail with a pulse running through it. What each step
 * involves waits behind a disclosure. For an ink sheet.
 */
export function ProcessTimeline() {
  return (
    <div>
      <SectionIntro
        eyebrow="How it runs"
        title="From consultation to a managed platform."
        titleId="process-title"
      />

      <ol className={styles.timeline}>
        {processSteps.map((step) => (
          <li key={step.number} className={styles.stage}>
            <span aria-hidden="true" className={styles.node} />
            <p className="font-display text-[clamp(2rem,3vw,2.6rem)] leading-none text-gold">
              {step.number}
            </p>
            <p className="mt-4 text-[1.1rem] font-medium tracking-[-0.01em] text-ivory">
              {step.title}
            </p>
            <p className="mt-1 text-[0.9rem] text-muted-light">{step.summary}</p>
          </li>
        ))}
      </ol>

      <Disclosure summary="What happens at each step" className="mt-12">
        <ol className="grid gap-3">
          {processSteps.map((step) => (
            <li key={step.number}>
              <span className="text-ivory">{step.title}.</span> {step.description}
            </li>
          ))}
        </ol>
      </Disclosure>
    </div>
  );
}
