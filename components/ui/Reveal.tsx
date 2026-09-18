import type { ComponentProps, CSSProperties, ReactNode } from "react";

/** Fades and lifts its children into view once, on first intersection. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  style,
  ...props
}: ComponentProps<"div"> & {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`reveal ${className}`}
      style={{ "--reveal-delay": `${delay}s`, ...style } as CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
}
