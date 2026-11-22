"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { GenesisMark } from "./GenesisMark";

/**
 * The Genesis mark, followed by the wordmark unless `wordmark` is false.
 * `light` is the ivory lockup for dark grounds, so it takes the gold G; the
 * ink lockup sits on ivory or paper and takes the deeper gold G.
 */
export function Logo({
  light = false,
  wordmark = true,
}: {
  light?: boolean;
  wordmark?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="Genesis AI"
      onClick={(event) => {
        if (window.location.pathname !== "/") return;

        event.preventDefault();
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        window.scrollTo({
          top: 0,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      }}
      className={cn(
        "inline-flex min-h-12 items-center gap-0",
        // The mark alone still gets a full-size target.
        !wordmark && "min-w-12",
        light ? "text-ivory" : "text-ink",
      )}
    >
      {/* 24px tall. The margins put the G where the old 37px square file did. */}
      <GenesisMark
        ground={light ? "dark" : "light"}
        loading="eager"
        fetchPriority="high"
        className="mt-[5px] mr-[3.5px] mb-2 ml-[3px] h-6 w-auto"
      />
      {wordmark ? (
        <span className="relative top-px -ml-0.5 flex items-baseline gap-1.5 font-display leading-none tracking-[0.12em] uppercase">
          <span className="text-[0.87rem] font-semibold">enesis</span>
          <span className="text-[0.72rem] font-bold text-gold-light">AI</span>
        </span>
      ) : null}
    </Link>
  );
}
