"use client";

import Image from "next/image";
import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Genesis AI"
      onClick={(event) => {
        if (window.location.pathname !== "/") return;

        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className={`inline-flex min-h-12 items-center gap-0 ${
        light ? "text-ivory" : "text-ink"
      }`}
    >
      <Image
        src="/brand/genesis-logo.svg"
        alt=""
        width={42}
        height={42}
        loading="eager"
        fetchPriority="high"
        className="h-[37px] w-[37px] object-contain"
      />
      <span className="relative top-px -ml-0.5 flex items-baseline gap-1.5 font-display leading-none tracking-[0.12em] uppercase">
        <span className="text-[0.87rem] font-semibold">enesis</span>
        <span className="text-[0.72rem] font-bold text-gold-light">AI</span>
      </span>
    </Link>
  );
}
