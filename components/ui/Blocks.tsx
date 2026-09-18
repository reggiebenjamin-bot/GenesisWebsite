import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import styles from "./Blocks.module.css";

/*
 * The section system every page is built from. A section is a short headline
 * and a few short points; cards, figures, previews and diagrams carry the
 * rest, and anything longer waits behind a Disclosure. One card style,
 * arranged differently from section to section.
 */

/* ── sheets ─────────────────────────────────────────────────────────── */

type Surface = "paper" | "ink";

const surfaces: Record<Surface, string> = {
  paper: "bg-paper text-ink",
  ink: "bg-ink text-ivory",
};

/**
 * A full-width section on paper or ink. `rise` makes it a rounded sheet that
 * overlaps the section before it, which is how the surface changes. A dark
 * sheet that rises also carries the gold grid.
 */
export function Sheet({
  surface,
  rise = false,
  className,
  children,
  ...props
}: { surface: Surface; rise?: boolean } & ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={cn(
        "relative py-[clamp(88px,10vw,136px)]",
        surfaces[surface],
        rise && "z-10 -mt-10 rounded-t-[32px]",
        rise && surface === "ink" && styles.inkGrid,
        className,
      )}
      {...props}
    >
      <div className="shell">{children}</div>
    </section>
  );
}

/* ── headings ───────────────────────────────────────────────────────── */

/**
 * A section's opening: an optional label and a short headline, with an
 * optional aside set opposite the headline on wide screens ("split").
 */
export function SectionIntro({
  eyebrow,
  title,
  titleId,
  aside,
  layout = "stack",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  titleId?: string;
  aside?: ReactNode;
  layout?: "stack" | "split" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-[clamp(36px,5vw,56px)]",
        layout === "split" && "flex flex-wrap items-end justify-between gap-x-10 gap-y-5",
        layout === "center" && "mx-auto max-w-[44rem] text-center",
        className,
      )}
    >
      <div>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2
          id={titleId}
          className={cn(
            "max-w-[20ch] text-[clamp(2.2rem,4.4vw,3.9rem)] leading-[1.02] tracking-[-0.045em] text-balance",
            eyebrow && "mt-4",
            layout === "center" && "mx-auto",
          )}
        >
          {title}
        </h2>
      </div>
      {aside ? <div className={cn(layout !== "split" && "mt-5")}>{aside}</div> : null}
    </div>
  );
}

/* ── cards ──────────────────────────────────────────────────────────── */

type CardTone = "light" | "dark" | "inverse";

const cardTones: Record<CardTone, string> = {
  /* On paper. */
  light: "border-line-light bg-white/70 text-ink shadow-[0_18px_44px_rgb(8_9_14/0.06)]",
  /* On ink. */
  dark: "border-line-dark bg-ink-soft text-ivory",
  /* Ink on paper, for the one card a group leads with. */
  inverse: "border-ink bg-ink text-ivory shadow-[0_22px_50px_rgb(8_9_14/0.2)]",
};

/** The one card style. */
export function Card({
  as: Element = "div",
  tone = "light",
  id,
  className,
  style,
  children,
}: {
  as?: "div" | "li" | "article";
  tone?: CardTone;
  /** Set when the card is the target of a link, such as /mini#deal-desk. */
  id?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <Element
      id={id}
      className={cn("rounded-[24px] border p-[clamp(22px,2.4vw,32px)]", cardTones[tone], className)}
      style={style}
    >
      {children}
    </Element>
  );
}

/* ── contents ───────────────────────────────────────────────────────── */

/** Short points: a few words each, never sentences. */
export function Points({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cn("grid gap-2.5", className)}>
      {items.map((item) => (
        <li
          key={item}
          className="grid grid-cols-[8px_minmax(0,1fr)] gap-3 text-[0.95rem] leading-snug"
        >
          <span aria-hidden="true" className="mt-[0.45rem] size-1.5 rounded-full bg-gold" />
          <span className="opacity-85">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** A figure set large, with its unit small beside it. */
export function Figure({
  value,
  unit,
  className,
}: {
  value: string;
  unit?: string;
  className?: string;
}) {
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-1.5", className)}>
      <span className="text-[clamp(2.2rem,3.4vw,3rem)] leading-none tracking-[-0.05em] tabular-nums">
        {value}
      </span>
      {unit ? <span className="text-[0.88rem] opacity-60">{unit}</span> : null}
    </p>
  );
}

/**
 * Longer content, closed until asked for. Native details and summary, so it
 * works without script and announces whether it is open.
 */
export function Disclosure({
  summary,
  children,
  className,
}: {
  summary: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details className={cn("group border-t border-current/15", className)}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[0.95rem] font-medium [&::-webkit-details-marker]:hidden">
        {summary}
        <span
          aria-hidden="true"
          className="text-[1.35rem] leading-none font-light transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
        >
          +
        </span>
      </summary>
      <div className="pb-5 text-[0.92rem] leading-relaxed opacity-80">{children}</div>
    </details>
  );
}

/* ── closes ─────────────────────────────────────────────────────────── */

/** The end of a page: a short headline, the actions, and at most a footnote. */
export function ClosingBand({
  eyebrow,
  title,
  line,
  actions,
  footnote,
}: {
  eyebrow?: string;
  title: string;
  line?: string;
  actions: ReactNode;
  footnote?: ReactNode;
}) {
  return (
    <Sheet surface="ink" rise className="text-center">
      <div className="mx-auto max-w-[46rem]">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2
          className={cn(
            "text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.02] tracking-[-0.045em] text-balance",
            eyebrow && "mt-4",
          )}
        >
          {title}
        </h2>
        {line ? <p className="mx-auto mt-5 max-w-[42ch] text-muted-light">{line}</p> : null}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
          {actions}
        </div>
        {footnote ? (
          <div className="mx-auto mt-9 max-w-[56ch] text-[0.84rem] text-muted-light">{footnote}</div>
        ) : null}
      </div>
    </Sheet>
  );
}
