"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { contact, navigation } from "@/lib/content";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { Logo } from "./Logo";

/**
 * Always visible, on every page and at every point of the hero push. It sits
 * above the hero's stacking context (z-100 against the hero's z-10) and the
 * hero's overlays are all `pointer-events: none`, so it stays clickable
 * throughout — the navigation belongs to the site, not to the cinematic frame.
 */
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const miniPage = pathname === "/mini" || pathname.startsWith("/mini/");
  const primaryActionHref = miniPage
    ? `mailto:${contact.email}?subject=${encodeURIComponent("G-Core Mini beta interest")}`
    : "/contact";
  const primaryActionLabel = miniPage
    ? "Ask About Mini"
    : "Book a Consultation";

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="site-header fixed inset-x-0 top-0 z-100 h-[var(--header-height)] border-b border-ivory/8 bg-ink/80 text-ivory backdrop-blur-lg transition-colors duration-500">
      <div className="shell relative z-1 flex h-full items-center justify-between">
        <Logo light />

        <button
          ref={menuButton}
          type="button"
          aria-controls="primary-navigation"
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          data-open={open}
          onClick={() => setOpen((current) => !current)}
          className="mobile-menu-toggle grid h-12 w-12 place-items-center lg:hidden"
        >
          <span className="sr-only">Menu</span>
          <span aria-hidden="true" className="mobile-menu-icon">
            <span />
            <span />
            <span />
          </span>
        </button>

        <nav
          id="primary-navigation"
          aria-label="Primary navigation"
          data-open={open}
          className="flex items-center gap-[clamp(18px,2.2vw,34px)] lg:absolute lg:left-1/2 lg:-translate-x-1/2 max-lg:absolute max-lg:inset-x-0 max-lg:top-full max-lg:flex-col max-lg:items-stretch max-lg:gap-0 max-lg:border-b max-lg:border-ivory/10 max-lg:bg-ink max-lg:p-6 max-lg:data-[open=false]:hidden"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={() => setOpen(false)}
              className="group relative inline-flex min-h-11 items-center text-[0.83rem] font-medium text-ivory/78 transition-colors duration-200 hover:text-ivory aria-[current=page]:text-ivory"
            >
              {item.label}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-2 h-px origin-right scale-x-0 bg-gold transition-transform duration-200 ease-editorial group-hover:origin-left group-hover:scale-x-100 group-aria-[current=page]:origin-left group-aria-[current=page]:scale-x-100 max-lg:hidden"
              />
            </Link>
          ))}

          <div className="mt-4 lg:hidden">
            <ConsultationButton
              href={primaryActionHref}
              compact
              onClick={() => setOpen(false)}
              className="w-full"
            >
              {primaryActionLabel}
            </ConsultationButton>
          </div>
        </nav>

        <div className="hidden lg:block">
          <ConsultationButton href={primaryActionHref} compact>
            {primaryActionLabel}
          </ConsultationButton>
        </div>
      </div>
    </header>
  );
}
