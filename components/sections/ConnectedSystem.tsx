import { SystemLayerStack } from "@/components/visuals/genesisScenes";
import { TextLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { systemLayers } from "@/lib/content";
import styles from "./ConnectedSystem.module.css";

/**
 * The four layers, shown as one object before they are listed as four rows.
 * Hovering a row singles out its plate in the diagram; the relationship is
 * declared in CSS, so this stays a server component.
 */
export function ConnectedSystem() {
  return (
    <section className="site-section relative border-t border-line-dark bg-ink py-[clamp(88px,11vw,168px)] text-ivory">
      <div className="shell">
        <Reveal className="max-w-[980px]">
          <h2 className="text-[clamp(2.4rem,5vw,4.8rem)] text-balance">
            A product underneath it. A managed service around it. One system.
          </h2>
          <p className="mt-6 max-w-2xl text-[1.05rem] text-muted-light">
            Genesis is the managed Applied AI deal operations system for real
            estate, lending, and property-driven teams, operated as one
            accountable environment.
          </p>
        </Reveal>

        <div
          className={`${styles.layout} mt-[clamp(56px,8vw,104px)] grid items-center gap-[clamp(40px,6vw,88px)] lg:grid-cols-[0.9fr_1.1fr]`}
        >
          <div className={`${styles.diagram} mx-auto w-full max-w-[420px]`}>
            <SystemLayerStack />
          </div>

          <div>
            {systemLayers.map((layer, index) => (
              <Reveal
                key={layer.number}
                delay={index * 0.05}
                className={`${styles.layer} border-t border-line-dark py-7 last:border-b`}
                data-layer={layer.number}
              >
                <div className="grid gap-x-6 gap-y-3 sm:grid-cols-[3.5rem_1fr]">
                  <span className="font-display text-[0.66rem] tracking-[0.14em] text-gold">
                    {layer.number}
                  </span>
                  <div>
                    <h3 className="text-[1.28rem] tracking-[-0.02em] text-ivory">
                      {layer.title}
                    </h3>
                    <p className="mt-2.5 max-w-[52ch] text-[0.94rem] text-muted-light">
                      {layer.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}

            <TextLink href="/solutions" light className="mt-10">
              Explore the complete system
            </TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
