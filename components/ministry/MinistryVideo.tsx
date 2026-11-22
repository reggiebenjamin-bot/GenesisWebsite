"use client";

import Image, { getImageProps } from "next/image";
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
  /**
   * The poster as a phone shows it (3:4), or null. While there is no film,
   * phones get this still in a 3:4 frame instead of the 16:9 one shrunk to
   * the width of the phone, where its words would be too small to read.
   */
  posterPhone?: string | null;
  /** What the film shows, for screen readers. Read only while the film is there. */
  label: string;
  /** What the poster image shows, read when the poster stands in for a missing film. */
  stillAlt: string;
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
};

type LoopProps = Shared & { mode: "loop" };

export type MinistryVideoProps = FeatureProps | LoopProps;

/* The shared frame: a fixed 16:9 box, so nothing shifts when a film arrives. */
const frame =
  "relative isolate aspect-video w-full overflow-hidden rounded-[6px] border border-line-dark bg-ink-soft";

/* Phones, as Tailwind's max-sm variant reads them. The phone still and its 3:4 frame go together. */
const PHONE = "(max-width: 639px)";
const phoneFrame = "max-sm:aspect-[3/4]";

/* The controls sit on dark film even inside a light section, so the focus
   ring stays gold rather than taking the light surface's ink ring. */
const controlButton =
  "inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[6px] border border-ivory/30 bg-ink/70 px-4 text-[0.8rem] font-bold tracking-[0.025em] text-ivory backdrop-blur-sm transition-colors duration-200 hover:border-gold-light hover:text-gold-light focus-visible:outline-gold-light";

/**
 * The frame's still: the poster image, or the drawn placeholder until there
 * is one. The placeholder is decoration and is hidden from screen readers;
 * the poster is described by `alt`, which is empty when a film plays over it
 * or is described on its own.
 */
function Still({
  poster,
  posterPhone,
  placeholder,
  sizes,
  eager,
  alt,
}: Pick<Shared, "poster" | "posterPhone" | "placeholder" | "sizes" | "eager"> & { alt: string }) {
  if (!poster) {
    return (
      <div aria-hidden="true" className="absolute inset-0">
        {placeholder}
      </div>
    );
  }
  if (posterPhone) {
    /* Art direction, as the next/image docs show it: getImageProps gives each still its own
       optimized srcSet, and the picture element picks the phone one on phones. */
    const common = {
      alt,
      fill: true,
      loading: eager ? "eager" : "lazy",
      fetchPriority: eager ? "high" : undefined,
    } as const;
    const {
      props: { srcSet: phoneSrcSet },
    } = getImageProps({ ...common, src: posterPhone, sizes: "100vw" });
    const { props } = getImageProps({ ...common, src: poster, sizes });
    return (
      <picture>
        <source media={PHONE} srcSet={phoneSrcSet} sizes="100vw" />
        <img {...props} alt={alt} className="object-cover" />
      </picture>
    );
  }
  return (
    <Image
      src={poster}
      alt={alt}
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
 * for readers who prefer less motion. Without a film yet, the frame shows
 * only the poster: no play button that leads nowhere, and no button laid
 * over the still, where it would read as part of the screenshot. The page
 * puts its own action under the frame.
 */
function FeatureVideo({
  src,
  poster,
  posterPhone,
  captions,
  label,
  stillAlt,
  placeholder,
  sizes,
  eager,
  playLabel,
  className,
}: FeatureProps) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const available = Boolean(src) && !failed;

  useEffect(() => {
    if (playing) videoRef.current?.focus();
  }, [playing]);

  return (
    <figure className={cn("m-0", className)}>
      <div className={cn(frame, !available && posterPhone && phoneFrame)}>
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
            <Still
              poster={poster}
              posterPhone={available ? null : posterPhone}
              placeholder={placeholder}
              sizes={sizes}
              eager={eager}
              alt={available ? "" : stillAlt}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(8_9_14/0.55))]"
            />
            {available ? (
              <div className="absolute inset-x-0 bottom-0 flex justify-center p-4 sm:p-6">
                <button type="button" onClick={() => setPlaying(true)} className={controlButton}>
                  <PlayGlyph />
                  {playLabel}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
      {/* Describe the film only when there is one to play. */}
      {available ? <figcaption className="sr-only">{label}</figcaption> : null}
    </figure>
  );
}

/**
 * A short, silent loop beside a section of copy. It plays only while it is on
 * screen, has a pause button, and is never mounted for readers who prefer
 * less motion: they see the poster. Until the film exists, or if it fails to
 * load, the frame keeps the poster or the drawn placeholder.
 */
function LoopVideo({ src, poster, posterPhone, label, stillAlt, placeholder, sizes, eager, className }: LoopProps) {
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
    <div className={cn(frame, !src && posterPhone && phoneFrame, className)}>
      <Still
        poster={poster}
        posterPhone={src ? null : posterPhone}
        placeholder={placeholder}
        sizes={sizes}
        eager={eager}
        alt={playing ? "" : stillAlt}
      />
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
      ) : null}
    </div>
  );
}

/** A Ministry film: a large feature film with controls, or a short silent loop. */
export function MinistryVideo(props: MinistryVideoProps) {
  return props.mode === "feature" ? <FeatureVideo {...props} /> : <LoopVideo {...props} />;
}
