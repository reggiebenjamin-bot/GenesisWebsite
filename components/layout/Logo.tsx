"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** The Genesis mark, followed by the wordmark unless `wordmark` is false. */
export function Logo({
  light = false,
  wordmark = true,
  className = "",
}: {
  light?: boolean;
  wordmark?: boolean;
  className?: string;
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
        !wordmark && "min-w-12",
        light ? "text-ivory" : "text-ink",
        className,
      )}
    >
      <Image
        src={light ? "/brand/genesis-logo.svg" : "/brand/genesis-logo-ink.svg"}
        alt=""
        width={42}
        height={42}
        loading="eager"
        fetchPriority="high"
        className="h-8 w-8 object-contain md:h-[37px] md:w-[37px]"
      />
      {wordmark ? (
        <span className="relative top-px -ml-0.5 flex items-baseline gap-1.5 font-display leading-none tracking-[0.12em] uppercase">
          <span className="text-[0.95rem] font-semibold">enesis</span>
          <span className={cn("text-[0.8rem] font-bold", light ? "text-gold-light" : "text-gold-dark")}>AI</span>
        </span>
      ) : null}
    </Link>
  );
}
