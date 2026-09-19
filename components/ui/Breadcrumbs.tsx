import Link from "next/link";
import { breadcrumbTrail } from "@/lib/seo";
import { cn } from "@/lib/utils";

/**
 * Where a page sits: Home › section › page. The same trail as the page's
 * BreadcrumbList structured data, because both come from lib/seo.ts.
 */
export function Breadcrumbs({
  path,
  light = false,
  className,
}: {
  path: string;
  light?: boolean;
  className?: string;
}) {
  const trail = breadcrumbTrail(path);

  return (
    <nav aria-label="Breadcrumb" className={cn("text-[0.8rem]", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trail.map((page, index) => {
          const current = index === trail.length - 1;
          return (
            <li key={page.path} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className={light ? "text-ivory/30" : "text-ink/30"}>
                  /
                </span>
              ) : null}
              {current ? (
                <span aria-current="page" className={light ? "text-ivory/80" : "text-ink/80"}>
                  {page.label}
                </span>
              ) : (
                <Link
                  href={page.path}
                  className={cn(
                    "transition-colors duration-200",
                    light ? "text-ivory/55 hover:text-gold-light" : "text-muted-dark hover:text-gold-dark",
                  )}
                >
                  {page.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
