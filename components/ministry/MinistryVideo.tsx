"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Whether the reader has asked for less motion. The server, and the first
 * paint before the browser answers, assume they have: the poster is always a
 * safe first frame, and a film only mounts once motion is known to be fine.
 */
function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => true,
  );
}

type Shared = {
  /** The mp4, or null when the file is not in public/ yet. */
  src: string | null;
  /** The poster image, or null when it is not in public/ yet. */
  poster: string | null;
  /** What the film shows, for screen readers. */
  label: string;
  /** Drawn in the frame when there is no poster image yet. */
  placeholder: ReactNode;
  /** Image sizes hint for the poster. */
  sizes: string;
  /** Load the poster first: only for a frame in the first screen. */
  eager?: boolean;
  className?: string;
};

type FeatureProps = Shared & {
  mode: "feature";
  /** A WebVTT captions file, or null when it is not there yet. */
  captions?: string | null;
  /** The button that starts the film. */
  playLabel: string;
  /** Where the frame leads while the film is not available. */
  fallback: { label: string; href: string };
};

type LoopProps = Shared & { mode: "loop" };

export type MinistryVideoProps = FeatureProps | LoopProps;

/* The shared frame: a fixed 16:9 box, so nothing shifts when a film arrives. */
const frame =
  "relative isolate aspect-video w-full overflow-hidden rounded-[6px] border border-line-dark bg-ink-soft";

const controlButton =
  "inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[6px] border border-ivory/30 bg-ink/70 px-4 text-[0.8rem] font-bold tracking-[0.025em] text-ivory backdrop-blur-sm transition-colors duration-200 hover:border-gold-light hover:text-gold-light";

function Still({ poster, placeholder, sizes, eager }: Pick<Shared, "poster" | "placeholder" | "sizes" | "eager">) {
  if (!poster) return <div className="absolute inset-0">{placeholder}</div>;
  return (
    <Image
      src={poster}
      alt=""
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      className="object-cover"
    />
  );
}

function PlayGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 fill-current">
      <path d="M3 1.5v13l11-6.5z" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 fill-current">
      <path d="M3 1.5h3.5v13H3zM9.5 1.5H13v13H9.5z" />
    </svg>
  );
}

/**
 * The large film on the Ministry page. The poster holds the frame until the
 * reader presses play; only then does the film load, with the browser's own
 * controls and captions. Nothing plays on its own, so the frame is the same
 * for readers who prefer less motion. Without a film yet, the frame offers
 * the guided demo instead of a play button that leads nowhere.
 */
function FeatureVideo({ src, poster, captions, label, placeholder, sizes, eager, playLabel, fallback, className }: FeatureProps) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const available = Boolean(src) && !failed;

  useEffect(() => {
    if (playing) videoRef.current?.focus();
  }, [playing]);

  return (
    <figure className={cn("m-0", className)}>
      <div className={frame}>
        {playing && available ? (
          <video
            ref={videoRef}
            className="absolute inset-0 size-full bg-ink object-contain"
            src={src ?? undefined}
            poster={poster ?? undefined}
            controls
            autoPlay
            playsInline
            preload="auto"
            aria-label={label}
            onError={() => {
              setFailed(true);
              setPlaying(false);
            }}
          >
            {captions ? <track kind="captions" src={captions} srcLang="en" label="English" default /> : null}
          </video>
        ) : (
          <>
            <Still poster={poster} placeholder={placeholder} sizes={sizes} eager={eager} />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(8_9_14/0.55))]"
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-center p-4 sm:p-6">
              {available ? (
                <button type="button" onClick={() => setPlaying(true)} className={controlButton}>
                  <PlayGlyph />
                  {playLabel}
                </button>
              ) : (
                /* Phones already have the same action right above the frame. */
                <a href={fallback.href} className={cn(controlButton, "max-sm:hidden")}>
                  {fallback.label}
                  <span aria-hidden="true">&#8599;</span>
                </a>
              )}
            </div>
          </>
        )}
      </div>
      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  );
}

/**
 * A short, silent loop beside a section of copy. It plays only while it is on
 * screen, has a pause button, and is never mounted for readers who prefer
 * less motion: they see the poster. Until the film exists, or if it fails to
 * load, the frame keeps the poster or the drawn placeholder.
 */
function LoopVideo({ src, poster, label, placeholder, sizes, eager, className }: LoopProps) {
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playing = Boolean(src) && !reduced && !failed;

  /* Play while on screen, rest while off it, unless the reader paused it. */
  useEffect(() => {
    const video = videoRef.current;
    if (!playing || !video || paused) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [playing, paused]);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) void video.play().catch(() => undefined);
    else video.pause();
    setPaused(!paused);
  }, [paused]);

  return (
    <div className={cn(frame, className)}>
      <Still poster={poster} placeholder={placeholder} sizes={sizes} eager={eager} />
      {playing ? (
        <>
          <video
            ref={videoRef}
            className="absolute inset-0 size-full object-cover"
            src={src ?? undefined}
            poster={poster ?? undefined}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={label}
            onError={() => setFailed(true)}
          />
          <button
            type="button"
            onClick={toggle}
            aria-pressed={paused}
            className={cn(controlButton, "absolute right-3 bottom-3 min-w-11 px-3")}
          >
            {paused ? <PlayGlyph /> : <PauseGlyph />}
            <span className="sr-only">{paused ? "Play the film" : "Pause the film"}</span>
          </button>
        </>
      ) : (
        <p className="sr-only">{label}</p>
      )}
    </div>
  );
}

/** A Ministry film: a large feature film with controls, or a short silent loop. */
export function MinistryVideo(props: MinistryVideoProps) {
  return props.mode === "feature" ? <FeatureVideo {...props} /> : <LoopVideo {...props} />;
}
