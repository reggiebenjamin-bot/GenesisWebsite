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

/** True when the visitor asked the browser to save data: the poster stands in for the loop. */
function prefersSavingData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(connection?.saveData);
}

const frame =
  "relative mx-auto aspect-[9/16] w-full max-w-[21rem] overflow-hidden rounded-[6px] border border-line-dark bg-ink-soft shadow-[0_30px_80px_rgb(0_0_0/0.45)] md:aspect-video md:max-w-[64rem]";

export function HawkInActionPlayer() {
  const shape = useShape();
  const reduced = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  /* The loop is not even requested until the frame is near the screen. */
  const [near, setNear] = useState(false);
  /* The visitor's own pause wins over scrolling back into view. */
  const [paused, setPaused] = useState(false);
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSaveData(prefersSavingData());
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const showLoop = Boolean(shape) && !reduced && near && !saveData;

  /* Plays while on screen and pauses off screen, so it never spends a phone's battery unseen. */
  useEffect(() => {
    const video = loopRef.current;
    if (!video || !showLoop) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !paused) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [shape, showLoop, paused]);

  const togglePause = () => {
    const video = loopRef.current;
    if (!video) return;
    if (paused) {
      setPaused(false);
      void video.play().catch(() => undefined);
    } else {
      setPaused(true);
      video.pause();
    }
  };

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
      <div ref={frameRef} className={frame}>
        {/* Before the script runs, and for anyone who prefers no motion or saves data, the poster is the film. */}
        <picture className="absolute inset-0 block size-full">
          <source media="(min-width: 768px)" srcSet={`${BASE}/hawk_hero_poster_wide.webp`} type="image/webp" />
          <source srcSet={`${BASE}/hawk_hero_poster_vertical.webp`} type="image/webp" />
          <img
            src={`${BASE}/hawk_hero_poster_vertical.jpg`}
            alt="Hawk answering a question inside the Genesis workspace, shown with sample data."
            className="size-full object-cover"
            width={720}
            height={1280}
            loading="lazy"
            decoding="async"
          />
        </picture>

        {showLoop && shape ? (
          <video
            key={shape}
            ref={loopRef}
            className="absolute inset-0 size-full object-cover"
            autoPlay={!paused}
            muted
            loop
            playsInline
            preload="none"
            aria-label="Looping product film, no sound. Hawk answers a question, one tap calls a lead, and Hawk drafts a reply that waits for approval."
            poster={`${BASE}/hawk_hero_poster_${shape}.jpg`}
          >
            <source src={`${BASE}/hawk_hero_loop_${shape}.webm`} type="video/webm" />
            <source src={`${BASE}/hawk_hero_loop_${shape}.mp4`} type="video/mp4" />
          </video>
        ) : null}

        {/* Moving content longer than five seconds needs a way to stop it (WCAG 2.2.2). */}
        {showLoop ? (
          <button
            type="button"
            onClick={togglePause}
            aria-pressed={paused}
            className="absolute right-3 bottom-3 z-10 inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-ivory/25 bg-ink/75 px-3 text-[0.8rem] font-bold text-ivory backdrop-blur-sm transition-colors duration-200 hover:border-gold-light"
          >
            {paused ? (
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3 fill-current">
                <path d="M3 1.5v13l11-6.5z" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3 fill-current">
                <path d="M3 2h3.5v12H3zM9.5 2H13v12H9.5z" />
              </svg>
            )}
            {paused ? "Play loop" : "Pause loop"}
          </button>
        ) : null}
      </div>

      <div className="mt-6 flex justify-center">
        {/* A secondary action: the page's one gold button is the assessment. */}
        <button
          type="button"
          onClick={openSpot}
          className="secondary-action inline-flex min-h-[52px] items-center justify-center gap-3 px-6 max-sm:w-full"
        >
          <span className="inline-flex items-center gap-3">
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 fill-current">
              <path d="M3 1.5v13l11-6.5z" />
            </svg>
            Watch the 60 Second Film With Sound
          </span>
        </button>
      </div>

      {/* The film fits the screen it opens on, a phone held sideways included: the video is
          capped to the viewport's height, the Close button sits inside the dialog, and the
          dialog scrolls if anything is still taller than the screen. */}
      <dialog
        ref={dialogRef}
        aria-label="Hawk runs your revenue desk, full film"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeSpot();
        }}
        className="m-auto max-h-[100dvh] w-[min(94vw,68rem)] max-w-none overflow-y-auto bg-transparent p-0 text-ivory backdrop:bg-ink/95 backdrop:backdrop-blur-sm"
      >
        <div className="relative py-2">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={closeSpot}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[6px] bg-ink/80 px-3 text-[0.84rem] font-bold tracking-[0.025em] text-ivory hover:text-gold-light"
            >
              Close
            </button>
          </div>
          {open ? (
            <video
              className={
                shape === "vertical"
                  ? "mx-auto mt-2 block max-h-[calc(100dvh-7rem)] w-auto max-w-full rounded-[6px] bg-ink"
                  : "mx-auto mt-2 block max-h-[calc(100dvh-7rem)] w-full rounded-[6px] bg-ink object-contain"
              }
              controls
              autoPlay
              playsInline
              preload="auto"
              poster={`${BASE}/hawk_full_spot_poster_${shape ?? "wide"}.jpg`}
              src={`${BASE}/hawk_full_spot_${shape ?? "wide"}.mp4`}
            />
          ) : null}
          <p className="mt-2 text-center text-[0.75rem] text-muted-light/80">
            Sample data shown. Genesis is software. We do not lend, place or arrange funding.
          </p>
        </div>
      </dialog>
    </div>
  );
}
