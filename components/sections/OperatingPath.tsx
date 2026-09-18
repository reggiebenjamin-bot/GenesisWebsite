import { TextLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { processSteps } from "@/lib/content";
import styles from "./OperatingPath.module.css";

/**
 * Implementation, laid out as the single line it actually is. Odd steps hang
 * above the line and even steps below, so five stages fit one band without
 * turning into five identical columns of prose.
 */
export function OperatingPath() {
  return (
    <section className="site-section relative bg-ivory py-[clamp(88px,11vw,168px)] text-ink">
      <div className="shell">
        <Reveal className="max-w-[900px]">
          <h2 className="text-[clamp(2.4rem,5vw,4.8rem)] text-balance">
            From founder-dependent work to a managed operating advantage.
          </h2>
          <p className="mt-6 max-w-2xl text-[1.05rem] text-muted-dark">
            The work begins with the operation, not with a prepackaged stack of
            tools.
          </p>
        </Reveal>

        <div
          className={`${styles.rail} mt-[clamp(56px,8vw,104px)]`}
        >
          <span aria-hidden="true" className={styles.spine} />

          <ol className="grid lg:grid-cols-5">
            {processSteps.map((step, index) => {
              const above = index % 2 === 0;

              return (
                <li
                  key={step.number}
                  className={`${styles.step} group relative grid max-lg:grid-cols-[auto_1fr] max-lg:items-start max-lg:gap-5 max-lg:py-7 lg:grid-rows-[1fr_auto_1fr] lg:min-h-[clamp(340px,32vw,420px)] lg:pr-[clamp(16px,2.4vw,40px)]`}
                >
                  <span
                    aria-hidden="true"
                    className={`${styles.node} max-lg:mt-2.5 lg:row-start-2`}
                  />

                  <div
                    className={`${
                      above
                        ? "lg:row-start-1 lg:flex lg:flex-col lg:justify-end lg:pb-9"
                        : "lg:row-start-3 lg:pt-9"
                    }`}
                  >
                    <p className="font-display text-[0.66rem] tracking-[0.16em] text-gold-dark">
                      {step.number}
                    </p>
                    <h3 className="mt-3 text-[1.35rem] tracking-[-0.02em]">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-[34ch] text-[0.93rem] text-muted-dark">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <TextLink href="/how-it-works" className="mt-[clamp(44px,6vw,72px)]">
          See the implementation process
        </TextLink>
      </div>
    </section>
  );
}
