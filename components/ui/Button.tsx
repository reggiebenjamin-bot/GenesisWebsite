import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

const base =
  "inline-flex min-h-[52px] items-center justify-center gap-3 rounded-sm border px-6 text-[0.84rem] leading-[1.1] font-bold tracking-[0.025em] text-center transition-colors duration-200";

const variants = {
  gold: "border-gold-light bg-gold-light text-ink hover:bg-ivory hover:border-ivory",
  outline: "border-ink/30 text-ink hover:bg-ink hover:text-ivory",
  ghost: "border-ivory/30 bg-ink/20 text-ivory hover:bg-ivory/12",
} as const;

export type ButtonVariant = keyof typeof variants;

export function Button({
  variant = "gold",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  children: ReactNode;
}) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}

export function SubmitButton({
  variant = "gold",
  className = "",
  children,
  ...props
}: ComponentProps<"button"> & {
  variant?: ButtonVariant;
  children: ReactNode;
}) {
  return (
    <button
      className={`${base} ${variants[variant]} disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** The underlined inline link used to close out most sections. */
export function TextLink({
  light = false,
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { light?: boolean; children: ReactNode }) {
  return (
    <Link
      className={`inline-flex min-h-11 items-center gap-2.5 border-b font-bold transition-colors duration-200 ${
        light
          ? "border-ivory/35 text-ivory hover:border-gold-light hover:text-gold-light"
          : "border-ink/30 text-ink hover:border-gold-dark hover:text-gold-dark"
      } ${className}`}
      {...props}
    >
      {children}
      <span aria-hidden="true">↗</span>
    </Link>
  );
}
