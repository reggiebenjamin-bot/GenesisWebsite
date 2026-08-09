import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import styles from "./ConsultationButton.module.css";

export function ConsultationButton({
  compact = false,
  className = "",
  children = "Book a Consultation",
  ...props
}: Omit<ComponentProps<typeof Link>, "children"> & {
  compact?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Link
      className={`${styles.button} ${compact ? styles.compact : ""} ${className}`}
      {...props}
    >
      <span className={styles.sheen} aria-hidden="true" />
      <span className={styles.label}>{children}</span>
      <span className={styles.arrow} aria-hidden="true">
        &#8599;
      </span>
    </Link>
  );
}
