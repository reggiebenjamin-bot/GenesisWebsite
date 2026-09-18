import {
  FigureApplied,
  FigureCore,
  FigureManaged,
} from "@/components/visuals/genesisScenes";
import { Reveal } from "@/components/ui/Reveal";
import { productPillars } from "@/lib/content";

const FIGURES = [FigureCore, FigureApplied, FigureManaged] as const;

/**
 * The opening argument, and the first place the site shows rather than tells.
 *
 * A two-tone statement carries the thesis: the claim in full ivory, the
 * consequence dropping back to muted so the eye reads the sentence in two
 * beats. Then one figure per row, sides alternating. The drawings are full
 * compositions rather than marks, so they get half the page each; three of
 * them side by side would be three thumbnails.
 */
export function ProductThesis() {
  return (
    <section className="site-section relative border-t border-line-dark bg-ink py-[clamp(88px,11vw,160px)] text-ivory">
      <div className="shell">
        <Reveal>
          <h2 className="max-w-[62rem] text-[clamp(1.9rem,3.6vw,3.4rem)] leading-[1.14] tracking-[-0.035em] text-pretty">
            More leads cannot fix an operation that still depends on you.{" "}
            <span className="text-ivory/38">
              Genesis connects the files, follow-up, and handoffs into one
              system, powered by a reusable platform and run as a managed
              service.
            </span>
          </h2>
        </Reveal>

        <div className="mt-[clamp(56px,8vw,104px)]">
          {productPillars.map((pillar, index) => {
            const Figure = FIGURES[index];
            const flipped = index % 2 === 1;

            return (
              <Reveal
                key={pillar.figure}
                className="grid items-center gap-[clamp(28px,5vw,72px)] border-t border-line-dark py-[clamp(40px,5vw,72px)] last:border-b lg:grid-cols-[1.05fr_0.95fr]"
              >
                <div className={flipped ? "lg:order-2" : undefined}>
                  <Figure />
                </div>

                <div className={flipped ? "lg:order-1" : undefined}>
                  <p className="font-display text-[0.62rem] tracking-[0.22em] text-ivory/32 uppercase">
                    Fig {pillar.figure}
                  </p>
                  <h3 className="mt-5 max-w-[18ch] text-[clamp(1.6rem,2.6vw,2.4rem)] tracking-[-0.02em] text-balance text-ivory">
                    {pillar.title}
                  </h3>
                  <p className="mt-4 max-w-[42ch] text-[0.98rem] text-muted-light">
                    {pillar.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
