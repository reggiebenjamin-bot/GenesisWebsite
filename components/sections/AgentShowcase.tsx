"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { agentMarks } from "@/components/visuals/marks";
import { Eyebrow } from "@/components/ui/Section";
import { agents } from "@/lib/content";
import styles from "./AgentShowcase.module.css";

/**
 * The four workflow mechanisms, one card at a time.
 *
 * The cards are a CSS sticky stack: each one rises, takes the rail, and stays
 * there while the next arrives over it. The only JavaScript is an
 * IntersectionObserver that tells the left rail which card currently holds the
 * top, which is a state question rather than a per-frame one.
 */
export function AgentShowcase() {
  const cards = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const nodes = cards.current.filter(Boolean) as HTMLElement[];
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = nodes.indexOf(entry.target as HTMLElement);
          if (index >= 0) setActive(index);
        }
      },
      // A narrow band across the middle of the viewport. Whichever card is
      // stuck to the rail is the one crossing it.
      { rootMargin: "-42% 0px -46% 0px", threshold: 0 },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="site-section relative border-t border-line-dark bg-navy py-[clamp(88px,11vw,168px)] text-ivory">
      <div className="shell grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
        <div>
          <div className="lg:sticky lg:top-[calc(var(--header-height)+5rem)]">
            <Eyebrow>Applied intelligence</Eyebrow>
            <h2 className="mt-5 text-[clamp(2.4rem,4.6vw,4.4rem)] text-balance">
              Four places the work stops moving.
            </h2>
            <p className="mt-6 max-w-md text-[1.02rem] text-muted-light">
              Genesis puts a mechanism in each one, inside the workflow rather
              than beside it. A person still approves what leaves.
            </p>

            <ul aria-hidden="true" className="mt-11 hidden lg:block">
              {agents.map((agent, index) => (
                <li
                  key={agent.id}
                  data-active={index === active}
                  className={`${styles.railItem} group flex items-center gap-4 py-3.5`}
                >
                  <span className={`${styles.railTrack} h-px w-14 shrink-0`}>
                    <span className={styles.railFill} />
                  </span>
                  <span
                    className={`text-[0.92rem] transition-colors duration-300 ${
                      index === active ? "text-ivory" : "text-ivory/38"
                    }`}
                  >
                    {agent.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.stack}>
          {agents.map((agent, index) => {
            const Mark = agentMarks[agent.id as keyof typeof agentMarks];

            return (
              <Fragment key={agent.id}>
              <article
                ref={(node) => {
                  cards.current[index] = node;
                }}
                data-active={index === active}
                style={{ "--i": index } as CSSProperties}
                className={`${styles.card} p-[clamp(26px,3.4vw,44px)]`}
              >
                <div className="flex flex-col-reverse items-start gap-4 sm:flex-row sm:justify-between sm:gap-6">
                  <div className="min-w-0">
                    <p className="font-display text-[0.62rem] tracking-[0.2em] text-gold uppercase">
                      {agent.role}
                    </p>
                    <h3 className="mt-4 text-[clamp(1.7rem,2.7vw,2.5rem)] text-ivory">
                      {agent.name}
                    </h3>
                  </div>
                  <Mark className="w-[104px] shrink-0 self-end sm:w-[150px] sm:self-auto" />
                </div>

                <p className="mt-5 max-w-[52ch] text-[0.98rem] text-muted-light">
                  {agent.description}
                </p>

                <div className="mt-7 flex flex-wrap gap-2 border-t border-line-dark pt-6">
                  {agent.signals.map((signal) => (
                    <span
                      key={signal}
                      className="rounded-sm border border-ivory/12 px-3 py-1.5 font-display text-[0.6rem] tracking-[0.1em] text-ivory/60 uppercase"
                    >
                      {signal}
                    </span>
                  ))}
                </div>
              </article>
              {index < agents.length - 1 ? (
                <div aria-hidden="true" className={styles.gap} />
              ) : null}
              </Fragment>
            );
          })}
          <div aria-hidden="true" className={styles.tail} />
        </div>
      </div>
    </section>
  );
}
