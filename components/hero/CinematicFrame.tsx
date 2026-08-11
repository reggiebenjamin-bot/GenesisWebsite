import Image from "next/image";
import Link from "next/link";
import type { Ref } from "react";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { GenesisSystem } from "./GenesisSystem";

/**
 * The cinematic frame: the room, the laptop, and the hero copy.
 *
 * Rendered twice, deliberately.
 *
 *   · in the hero section, where it is **static** — the page's ordinary
 *     opening image, which is what a visitor sees on the way back up;
 *   · in the entrance overlay, where the same markup is **driven** by
 *     `useHeroScrub` and performs the push.
 *
 * The two are identical at rest because the driver scopes its custom
 * properties to the overlay; the static copy falls back to the `:root`
 * defaults, which are the at-rest values.
 *
 * The laptop's screen always shows a static miniature of the Genesis System —
 * on first load, throughout the push, and afterwards when the visitor scrolls
 * back up to it. It is never blank. The miniature is `decorative`: hidden from
 * assistive tech, out of the tab order and not hit-testable, so it can never
 * duplicate the real section's links or be zoomed into a second time.
 */
export function CinematicFrame({
  plateRef,
  hardwareRef,
  showHardware = true,
}: {
  plateRef?: Ref<HTMLImageElement>;
  hardwareRef?: Ref<HTMLImageElement>;
  showHardware?: boolean;
}) {
  return (
    <>
      <div className="hero-fit hero-rig-live">
        <div className="hero-intro">
          <div className="hero-pan">
            <div className="hero-zoom">
              <div className="hero-screen" aria-hidden="true" inert>
                <div className="hero-screen-canvas">
                  <GenesisSystem decorative />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-fit">
        <div className="hero-intro">
          <div className="hero-pan">
            <div className="hero-zoom">
              <div className="hero-plate-wide">
                <picture className="absolute inset-0 block">
                  <source
                    media="(max-width: 767px)"
                    srcSet="/images/hero/hero-mobile-room.webp"
                  />
                  <Image
                    ref={plateRef}
                    src="/images/hero/hero-plate-room.webp"
                    alt="A laptop open on a dark stone island in a contemporary home, looking out over a terrace at dusk."
                    fill
                    loading="eager"
                    fetchPriority="high"
                    quality={92}
                    sizes="(max-width: 767px) 100vw, 140vw"
                  />
                </picture>
              </div>

              <div className="hero-plate-detail" aria-hidden="true">
                <picture className="absolute inset-0 block">
                  <source
                    media="(max-width: 767px)"
                    srcSet="/images/hero/hero-mobile-detail.webp"
                  />
                  <Image
                    src="/images/hero/hero-plate-detail.webp"
                    alt=""
                    fill
                    quality={92}
                    sizes="(max-width: 767px) 55vw, 44vw"
                  />
                </picture>
              </div>

              {/* The screen itself is transparent in this source. It rides
                  inside the exact same camera rig as the room plates, while
                  the live Genesis UI remains beneath it in the display hole. */}
              {showHardware ? (
                <div className="hero-hardware" aria-hidden="true">
                  {/* The transform can magnify this layer beyond its resting
                      footprint, so it intentionally bypasses responsive image
                      candidate selection and loads the supplied 1920px PNG. */}
                  <picture>
                    <source
                      media="(max-width: 767px)"
                      srcSet="/images/hero/macbook-hardware-mobile.png"
                    />
                    <img
                      ref={hardwareRef}
                      src="/images/hero/macbook-hardware.png"
                      alt=""
                      width={1920}
                      height={1080}
                      loading="eager"
                      fetchPriority="high"
                      decoding="sync"
                      draggable={false}
                    />
                  </picture>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div
        className="hero-scrim pointer-events-none absolute inset-x-0 top-0 bottom-[45%] z-20"
        aria-hidden="true"
      />
      <div
        className="hero-vignette pointer-events-none absolute inset-0 z-20"
        aria-hidden="true"
      />
      {/* Kept outside the camera transforms so this subtle edge-only surface
          can never expose a transformed photo layer at the viewport bounds. */}
      <div className="hero-edge-blur" aria-hidden="true" />
      {/* The complete copy group shares one responsive anchor. Keeping the
          offset here leaves the camera rig and photograph geometry untouched. */}
      <div className="hero-copy absolute inset-x-0 top-[calc(var(--header-height)+clamp(4.25rem,9vh,6rem)+2.25rem)] bottom-[40%] z-30 flex items-start justify-center px-6 max-md:top-[calc(var(--header-height)+clamp(4.75rem,10svh,6rem)+1.5rem)]">
        <div className="w-full max-w-5xl text-center text-ivory">
          <p
            className="hero-rise hero-eyebrow font-display text-[0.69rem] font-semibold tracking-[0.18em] uppercase"
            style={{ "--i": 0 } as React.CSSProperties}
          >
            AI + Systems for Real Estate Professionals
          </p>

          <h1 className="mt-4 text-[clamp(1.3rem,min(2.9vw,4.4vh),2.95rem)] leading-[1.08]">
            <span
              className="hero-rise inline-block"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              AI systems that help real estate professionals
            </span>{" "}
            <span
              className="hero-rise hero-outcome-glow inline-block text-gold-light"
              data-text="work faster and close more deals."
              style={{ "--i": 2 } as React.CSSProperties}
            >
              work faster and close more deals.
            </span>
          </h1>

          <p
            className="hero-rise mx-auto mt-5 max-w-xl text-[clamp(0.85rem,min(1.05vw,1.7vh),1.05rem)] text-ivory/90 max-md:hidden"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            Genesis provisions your Microsoft 365 foundation, builds practical
            AI workflows, adds an optional CRM layer, and manages the system as
            your operation evolves.
          </p>

          <div
            className="hero-rise mt-7 flex flex-wrap justify-center gap-3 max-md:mt-6"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <ConsultationButton href="/contact" />
            <Link
              href="/how-it-works"
              className="secondary-action inline-flex min-h-12 items-center justify-center px-6 text-[0.84rem] font-bold"
            >
              <span>See How It Works</span>
            </Link>
          </div>
        </div>
      </div>

      <div
        className="hero-copy pointer-events-none absolute bottom-9 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 text-[0.7rem] tracking-[0.16em] text-ivory/55 uppercase max-md:hidden"
        aria-hidden="true"
      >
        <span>Scroll to enter</span>
        <span className="relative block h-px w-12 overflow-hidden bg-ivory/25">
          <i className="absolute inset-y-0 left-0 block w-4 bg-gold-light [animation:hero-sweep_2.2s_cubic-bezier(0.7,0,0.3,1)_infinite]" />
        </span>
      </div>
    </>
  );
}
