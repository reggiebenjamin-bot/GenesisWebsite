"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/hooks/useMotionPreference";
import { track } from "@/lib/analytics";

const BASE = "/video/hawk";
type Shape = "wide" | "vertical";

/** Wide from 768px up, vertical below. Null until the browser has answered. */
function useShape(): Shape | null {
  const [shape, setShape] = useState<Shape | null>(null);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setShape(query.matches ? "wide" : "vertical");
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return shape;
}

const frame =
  "relative mx-auto aspect-[9/16] w-full max-w-[21rem] overflow-hidden rounded-[6px] border border-line-dark bg-ink-soft shadow-[0_30px_80px_rgb(0_0_0/0.45)] md:aspect-video md:max-w-[64rem]";

export function HawkInActionPlayer() {
  const shape = useShape();
  const reduced = useReducedMotion();
  const loopRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  /* Pause the loop while it is off screen so it never spends a phone's battery unseen. */
  useEffect(() => {
    const video = loopRef.current;
    if (!video || reduced) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [shape, reduced]);

  const openSpot = useCallback(() => {
    track("hawk_demo_played", { shape: shape ?? "wide" });
    setOpen(true);
    dialogRef.current?.showModal();
  }, [shape]);

  const closeSpot = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  return (
    <div>
      <div className={frame}>
        {/* Before the script runs, and for anyone who prefers no motion, the poster is the film. */}
        <picture className="absolute inset-0 block size-full">
          <source media="(min-width: 768px)" srcSet={`${BASE}/hawk_hero_poster_wide.webp`} type="image/webp" />
          <source srcSet={`${BASE}/hawk_hero_poster_vertical.webp`} type="image/webp" />
          <img
            src={`${BASE}/hawk_hero_poster_vertical.jpg`}
            alt="Hawk answering a question inside the Genesis workspace, shown with sample data."
            className="size-full object-cover"
            width={720}
            height={1280}
          />
        </picture>

        {shape && !reduced ? (
          <video
            key={shape}
            ref={loopRef}
            className="absolute inset-0 size-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="Looping product film, no sound. Hawk answers a question, one tap calls a lead, and Hawk drafts a reply that waits for approval."
            poster={`${BASE}/hawk_hero_poster_${shape}.jpg`}
          >
            <source src={`${BASE}/hawk_hero_loop_${shape}.webm`} type="video/webm" />
            <source src={`${BASE}/hawk_hero_loop_${shape}.mp4`} type="video/mp4" />
          </video>
        ) : null}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={openSpot}
          className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-[6px] border border-gold-light bg-gold-light px-6 text-[0.84rem] leading-[1.1] font-bold tracking-[0.025em] text-ink transition-colors duration-200 hover:border-ivory hover:bg-ivory max-sm:w-full"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 fill-current">
            <path d="M3 1.5v13l11-6.5z" />
          </svg>
          Watch the 60 second film with sound
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Hawk runs your revenue desk, full film"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeSpot();
        }}
        className="m-auto w-[min(94vw,68rem)] max-w-none overflow-visible bg-transparent p-0 text-ivory backdrop:bg-ink/95 backdrop:backdrop-blur-sm"
      >
        <div className="relative">
          <button
            type="button"
            onClick={closeSpot}
            className="absolute right-0 -top-12 min-h-[44px] px-3 text-[0.84rem] font-bold tracking-[0.025em] text-ivory hover:text-gold-light"
          >
            Close
          </button>
          {open ? (
            <video
              className={
                shape === "vertical"
                  ? "mx-auto max-h-[82vh] w-auto rounded-[6px] bg-ink"
                  : "w-full rounded-[6px] bg-ink"
              }
              controls
              autoPlay
              playsInline
              preload="auto"
              poster={`${BASE}/hawk_full_spot_poster_${shape ?? "wide"}.jpg`}
              src={`${BASE}/hawk_full_spot_${shape ?? "wide"}.mp4`}
            />
          ) : null}
          <p className="mt-3 text-center text-[0.75rem] text-muted-light/80">
            Sample data shown. Genesis is software. We do not lend, place or arrange funding.
          </p>
        </div>
      </dialog>
    </div>
  );
}
