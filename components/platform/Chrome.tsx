import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";
import { Button, TextLink } from "@/components/ui/Button";
import { platformCopy } from "@/lib/platform/copy";
import { cn } from "@/lib/utils";

const skip =
  "fixed top-3 left-3 z-1000 -translate-y-[150%] bg-ivory px-4 py-2.5 text-ink transition-transform duration-200 focus:translate-y-0";

export function MarketingFrame({ children }: { children: ReactNode }) {
  return (
    <div className="bg-ink text-ivory">
      <a href="#main-content" className={skip}>
        {platformCopy.skip}
      </a>
      <header className="sticky top-0 z-40 border-b border-line-dark bg-ink/95 backdrop-blur">
        <div className="shell flex min-h-[88px] flex-wrap items-center justify-between gap-4 py-4">
          <Logo light />
          <nav aria-label={platformCopy.nav.workspace} className="flex flex-wrap items-center gap-2">
            <Button href="/signup" variant="ghost">
              {platformCopy.nav.signup}
            </Button>
            <Button href="/business-check">{platformCopy.nav.check}</Button>
          </nav>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <SiteFoot />
    </div>
  );
}

export function QuietFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <a href="#main-content" className={skip}>
        {platformCopy.skip}
      </a>
      <header className="border-b border-line-dark bg-ink md:border-line-light md:bg-paper">
        <div className="mx-auto flex min-h-16 w-full max-w-xl items-center justify-between gap-4 px-4">
          <span className="md:hidden">
            <Logo light />
          </span>
          <span className="hidden md:inline-flex">
            <Logo />
          </span>
          <span className="md:hidden">
            <TextLink href="/business-check" light>
              {platformCopy.nav.check}
            </TextLink>
          </span>
          <span className="hidden md:inline-flex">
            <TextLink href="/business-check">{platformCopy.nav.check}</TextLink>
          </span>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="mx-auto w-full max-w-xl px-4 pt-8 pb-28 md:pb-12">
        <FootLines />
      </footer>
    </div>
  );
}

export function SiteFoot() {
  return (
    <footer className="border-t border-line-dark bg-ink text-ivory">
      <div className="shell grid gap-4 py-8">
        <Logo light />
        <FootLines light />
      </div>
    </footer>
  );
}

function FootLines({ light = false }: { light?: boolean }) {
  return (
    <div className={cn("grid gap-2 text-[1rem] leading-relaxed", light ? "text-ivory/72" : "text-ink/70")}>
      <p>{platformCopy.address}</p>
      <p>{platformCopy.stubLine}</p>
    </div>
  );
}

export function SampleMark({ light = false }: { light?: boolean }) {
  return (
    <p
      className={cn(
        "font-display text-[0.69rem] leading-[1.4] font-semibold tracking-[0.18em] uppercase",
        light ? "text-gold" : "text-gold-dark",
      )}
    >
      {platformCopy.sample}
    </p>
  );
}

export function FundingDisclaimer({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <p
      data-testid="funding-disclaimer"
      className={cn(
        "max-w-3xl text-[1.05rem] leading-relaxed",
        light ? "text-ivory/80" : "text-ink/80",
      )}
    >
      {text}
    </p>
  );
}

export function Notice({
  tone,
  title,
  children,
}: {
  tone: "error" | "success" | "loading";
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-busy={tone === "loading" ? true : undefined}
      className={cn(
        "rounded-[6px] border px-4 py-4",
        tone === "error" && "border-ink bg-ivory",
        tone === "success" && "border-gold-dark bg-paper",
        tone === "loading" && "border-line-light bg-paper",
      )}
    >
      <p className="font-display text-[0.69rem] leading-[1.4] font-semibold tracking-[0.18em] text-gold-dark uppercase">
        {title}
      </p>
      <p className="mt-2 text-[1.05rem] leading-relaxed">{children}</p>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[6px] border border-line-light px-6 py-16 text-center">
      <h2 className="text-[clamp(1.75rem,3vw,2.4rem)] leading-none tracking-[-0.04em] text-balance">{title}</h2>
      <p className="mx-auto mt-4 max-w-md text-[1.125rem] leading-relaxed text-ink/75">{body}</p>
      {action ? <div className="mt-8 flex justify-center">{action}</div> : null}
    </div>
  );
}

export const fieldLabel =
  "font-display text-[0.69rem] leading-[1.4] font-semibold tracking-[0.18em] text-gold-dark uppercase";

export const textInput =
  "min-h-14 w-full rounded-[6px] border border-line-light bg-white px-4 text-[1.125rem] text-ink transition-colors duration-200 ease-editorial focus-visible:border-ink motion-reduce:transition-none";
