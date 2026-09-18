"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { offerPathHomeHref, offerPathPageKind, offerPaths } from "@/lib/offers";
import { cn } from "@/lib/utils";
import { choosePathInPlace, setOfferPath, useOfferPath } from "./offerPathState";
import styles from "./PathToggle.module.css";

/**
 * Agent / Custom Infrastructure: in the navigation bar ("bar"), the mobile
 * menu ("sheet"), the homepage hero on phones ("hero"), and above the pricing
 * panels ("section").
 *
 * On the homepage and pricing page, which show both paths, the options are
 * toggle buttons that switch the page in place. Everywhere else they are
 * links to each path's homepage, and on a page that belongs to one path (the
 * tools page, the solutions page) that path is marked.
 *
 * On switching pages the selected segment is styled from the attribute on
 * <html> rather than from React state, so it is right before hydration.
 */
export function PathToggle({
  variant = "bar",
  onChoose,
  className,
}: {
  variant?: "bar" | "sheet" | "hero" | "section";
  /** Called after a choice, e.g. to close the mobile menu. */
  onChoose?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const active = useOfferPath();
  const page = offerPathPageKind(pathname);

  return (
    <div
      role="group"
      aria-label="Genesis path"
      data-kind={page.kind}
      className={cn(
        styles.toggle,
        variant === "sheet" && styles.sheet,
        variant === "hero" && styles.hero,
        variant === "section" && styles.section,
        className,
      )}
    >
      {offerPaths.map((path) =>
        page.kind === "switch" ? (
          <button
            key={path.id}
            type="button"
            data-path={path.id}
            aria-pressed={active === path.id}
            className={styles.segment}
            onClick={() => {
              onChoose?.();
              choosePathInPlace(path.id, { afterMenuCloses: variant === "sheet" });
            }}
          >
            {path.label}
          </button>
        ) : (
          <Link
            key={path.id}
            href={offerPathHomeHref(path.id)}
            data-path={path.id}
            data-selected={page.kind === "page" && page.path === path.id ? "true" : undefined}
            aria-current={page.kind === "page" && page.path === path.id ? "true" : undefined}
            className={styles.segment}
            onClick={() => {
              // Chosen before the homepage renders, so it opens on this path.
              setOfferPath(path.id);
              onChoose?.();
            }}
          >
            {path.label}
          </Link>
        ),
      )}
    </div>
  );
}
