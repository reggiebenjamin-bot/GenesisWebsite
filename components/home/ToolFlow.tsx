import { Card } from "@/components/ui/Blocks";
import { genesisTools, toolJourney } from "@/lib/offers";
import styles from "./ToolFlow.module.css";

/**
 * How the tools connect, as a flow: one card per step, joined by dotted links
 * with a pulse running from each tool to the next.
 */
export function ToolFlow() {
  return (
    <ol className={styles.flow}>
      {toolJourney.map((step, index) => {
        const tool = genesisTools.find((candidate) => candidate.id === step.tool);
        if (!tool) return null;

        return (
          <li key={step.tool} className={styles.step}>
            {index > 0 ? (
              <span aria-hidden="true" className={styles.link}>
                <i />
              </span>
            ) : null}

            <Card className="h-full">
              <p className="font-display text-[0.64rem] tracking-[0.16em] text-gold-dark uppercase">
                {step.cue}
              </p>
              <p className="mt-6 text-[clamp(1.35rem,2vw,1.7rem)] leading-[1.15] tracking-[-0.02em]">
                “{step.task}”
              </p>
              <p className="mt-6 text-[0.9rem] text-muted-dark">
                {tool.number} · {tool.name}
              </p>
            </Card>
          </li>
        );
      })}
    </ol>
  );
}
