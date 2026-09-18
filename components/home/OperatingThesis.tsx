import Image from "next/image";
import { Eyebrow } from "@/components/ui/Section";
import { genesisPositioning, offerPaths, type OfferPathId } from "@/lib/offers";
import styles from "./OperatingThesis.module.css";

/* Row centres, in the connector's own 0–360 coordinate space. The domain list
   is laid out on the same fixed height, so these line up with the text at
   every width. */
const DOMAIN_ROWS = genesisPositioning.domains.map((_, index) => 30 + index * 60);
const CORE = 180;

/**
 * The thesis, then the picture of it: six operating domains converge into
 * Genesis, and Genesis resolves into the offer this page is showing.
 */
export function OperatingThesis({ current }: { current: OfferPathId }) {
  const outcome = offerPaths.find((path) => path.id === current);

  return (
    <section
      aria-labelledby="thesis-title"
      className="relative bg-ink pt-[clamp(48px,7vw,104px)] pb-[clamp(128px,15vw,200px)] text-ivory"
    >
      <div className="shell">
        <Eyebrow>The Genesis thesis</Eyebrow>
        <h2
          id="thesis-title"
          className="mt-4 max-w-[36rem] text-[clamp(2.1rem,4vw,3.6rem)] leading-[1.05] tracking-[-0.04em] text-balance"
        >
          <span className="text-ivory/50">Expertise, data, software and AI,</span> turned into
          operational infrastructure.
        </h2>

        <div className="mt-[clamp(56px,7vw,96px)] grid items-center gap-y-2 lg:grid-cols-[minmax(0,15rem)_minmax(3rem,1fr)_auto_minmax(3rem,1fr)_minmax(0,21rem)]">
          <ul
            aria-label="Where Genesis operates"
            className="flex flex-wrap justify-center gap-2.5 lg:grid lg:h-[360px] lg:grid-rows-6 lg:gap-0"
          >
            {genesisPositioning.domains.map((domain, index) => (
              <li key={domain} className="flex items-center">
                <span className="inline-flex min-h-10 items-center gap-3 rounded-full border border-line-dark bg-ink-soft px-4 text-[0.9rem] text-ivory/88 lg:w-full">
                  <span className="font-display text-[0.62rem] tracking-[0.12em] text-gold">
                    0{index + 1}
                  </span>
                  {domain}
                </span>
              </li>
            ))}
          </ul>

          <svg
            aria-hidden="true"
            viewBox="0 0 100 360"
            preserveAspectRatio="none"
            className="hidden h-[360px] w-full lg:block"
          >
            {DOMAIN_ROWS.map((y) => (
              <path
                key={y}
                d={`M0 ${y} C 55 ${y}, 45 ${CORE}, 100 ${CORE}`}
                fill="none"
                stroke="rgb(201 165 94 / 0.4)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {DOMAIN_ROWS.map((y, index) => (
              <path
                key={`pulse-${y}`}
                d={`M0 ${y} C 55 ${y}, 45 ${CORE}, 100 ${CORE}`}
                pathLength={100}
                fill="none"
                stroke="rgb(242 216 149 / 0.95)"
                strokeWidth="1.6"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className={styles.pulse}
                style={{ animationDelay: `${index * 0.3}s` }}
              />
            ))}
          </svg>
          <span aria-hidden="true" className="mx-auto block h-10 w-px bg-gold/40 lg:hidden" />

          <div className="relative mx-auto grid size-[148px] place-items-center rounded-full border border-gold/35 bg-[radial-gradient(circle_at_50%_40%,rgb(201_165_94/0.14),rgb(8_9_14)_70%)]">
            <span
              aria-hidden="true"
              className="absolute inset-[-10px] rounded-full border border-gold/12"
            />
            <div className="grid justify-items-center gap-2">
              <Image
                src="/brand/genesis-logo.svg"
                alt=""
                width={44}
                height={44}
                className="size-11"
              />
              <span className="font-display text-[0.66rem] tracking-[0.2em] text-ivory uppercase">
                Genesis
              </span>
            </div>
          </div>

          <svg
            aria-hidden="true"
            viewBox="0 0 100 360"
            preserveAspectRatio="none"
            className="hidden h-[360px] w-full lg:block"
          >
            <path
              d={`M0 ${CORE} L 100 ${CORE}`}
              fill="none"
              stroke="rgb(201 165 94 / 0.4)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={`M0 ${CORE} L 100 ${CORE}`}
              pathLength={100}
              fill="none"
              stroke="rgb(242 216 149 / 0.95)"
              strokeWidth="1.6"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className={styles.pulse}
              style={{ animationDelay: "1.8s" }}
            />
          </svg>
          <span aria-hidden="true" className="mx-auto block h-10 w-px bg-gold/40 lg:hidden" />

          {outcome ? (
            <div className="grid w-full gap-1.5 rounded-2xl border border-gold/45 bg-ink-soft p-5 lg:h-[124px] lg:content-center">
              <span className="font-display text-[0.64rem] tracking-[0.16em] text-gold uppercase">
                {outcome.label}
              </span>
              <span className="text-[1.2rem] leading-tight tracking-[-0.02em] text-ivory">
                {outcome.product}
              </span>
              <span className="text-[0.92rem] text-muted-light">{outcome.distinction}</span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
